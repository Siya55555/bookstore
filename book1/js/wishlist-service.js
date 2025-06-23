// Wishlist Service
// Handles all wishlist-related operations including add, remove, and sync with Firestore

import { 
    collection, 
    doc, 
    addDoc, 
    getDoc, 
    getDocs, 
    deleteDoc, 
    query, 
    where, 
    orderBy,
    Timestamp 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { db } from './firebase-config.js';
import authService from './auth-service.js';
import bookService from './book-service.js';

class WishlistService {
    constructor() {
        this.wishlistItems = [];
        this.wishlistListeners = [];
        this.initWishlistListener();
    }

    // Initialize wishlist listener for real-time updates
    initWishlistListener() {
        authService.onAuthStateChanged(async (user) => {
            if (user) {
                await this.loadWishlistFromFirestore(user.uid);
            } else {
                this.wishlistItems = [];
                this.notifyWishlistListeners();
            }
        });
    }

    // Add book to wishlist
    async addToWishlist(bookId) {
        try {
            const user = authService.getCurrentUser();
            if (!user) {
                return { success: false, error: 'Please login to add items to wishlist' };
            }

            // Check if book is already in wishlist
            const existingItem = this.wishlistItems.find(item => item.bookId === bookId);
            if (existingItem) {
                return { success: false, error: 'Book is already in your wishlist' };
            }

            // Get book details
            const bookResult = await bookService.getBookById(bookId);
            if (!bookResult.success) {
                return { success: false, error: 'Book not found' };
            }

            const book = bookResult.book;

            // Create wishlist item
            const wishlistItem = {
                bookId: bookId,
                addedAt: Timestamp.now(),
                book: {
                    id: book.id,
                    title: book.title,
                    author: book.author,
                    price: book.price,
                    imageURL: book.imageURL,
                    rating: book.rating
                }
            };

            // Add to local array
            this.wishlistItems.push(wishlistItem);
            
            // Add to Firestore
            await this.addWishlistItemToFirestore(user.uid, wishlistItem);

            this.notifyWishlistListeners();
            return { success: true, message: 'Added to wishlist' };
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            return { success: false, error: error.message };
        }
    }

    // Remove book from wishlist
    async removeFromWishlist(bookId) {
        try {
            const user = authService.getCurrentUser();
            if (!user) {
                return { success: false, error: 'Please login to manage wishlist' };
            }

            // Remove from local array
            this.wishlistItems = this.wishlistItems.filter(item => item.bookId !== bookId);
            
            // Remove from Firestore
            await this.removeWishlistItemFromFirestore(user.uid, bookId);

            this.notifyWishlistListeners();
            return { success: true, message: 'Removed from wishlist' };
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            return { success: false, error: error.message };
        }
    }

    // Check if book is in wishlist
    isInWishlist(bookId) {
        return this.wishlistItems.some(item => item.bookId === bookId);
    }

    // Get wishlist items
    getWishlistItems() {
        return this.wishlistItems;
    }

    // Get wishlist count
    getWishlistCount() {
        return this.wishlistItems.length;
    }

    // Clear entire wishlist
    async clearWishlist() {
        try {
            const user = authService.getCurrentUser();
            if (!user) {
                return { success: false, error: 'Please login to manage wishlist' };
            }

            // Clear local array
            this.wishlistItems = [];
            
            // Clear from Firestore
            await this.clearWishlistFromFirestore(user.uid);

            this.notifyWishlistListeners();
            return { success: true, message: 'Wishlist cleared' };
        } catch (error) {
            console.error('Error clearing wishlist:', error);
            return { success: false, error: error.message };
        }
    }

    // Move wishlist item to cart
    async moveToCart(bookId) {
        try {
            const user = authService.getCurrentUser();
            if (!user) {
                return { success: false, error: 'Please login to manage wishlist' };
            }

            // Import cart service dynamically to avoid circular dependency
            const { default: cartService } = await import('./cart-service.js');
            
            // Add to cart
            const cartResult = await cartService.addToCart(bookId, 1);
            if (cartResult.success) {
                // Remove from wishlist
                await this.removeFromWishlist(bookId);
                return { success: true, message: 'Moved to cart' };
            } else {
                return cartResult;
            }
        } catch (error) {
            console.error('Error moving to cart:', error);
            return { success: false, error: error.message };
        }
    }

    // Load wishlist from Firestore
    async loadWishlistFromFirestore(userId) {
        try {
            const wishlistCollection = collection(db, 'users', userId, 'wishlist');
            const q = query(wishlistCollection, orderBy('addedAt', 'desc'));
            const querySnapshot = await getDocs(q);
            
            this.wishlistItems = [];
            querySnapshot.forEach((doc) => {
                this.wishlistItems.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            this.notifyWishlistListeners();
        } catch (error) {
            console.error('Error loading wishlist from Firestore:', error);
        }
    }

    // Add wishlist item to Firestore
    async addWishlistItemToFirestore(userId, wishlistItem) {
        try {
            const wishlistCollection = collection(db, 'users', userId, 'wishlist');
            await addDoc(wishlistCollection, wishlistItem);
        } catch (error) {
            console.error('Error adding wishlist item to Firestore:', error);
            throw error;
        }
    }

    // Remove wishlist item from Firestore
    async removeWishlistItemFromFirestore(userId, bookId) {
        try {
            const wishlistCollection = collection(db, 'users', userId, 'wishlist');
            const q = query(wishlistCollection, where('bookId', '==', bookId));
            const querySnapshot = await getDocs(q);
            
            querySnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });
        } catch (error) {
            console.error('Error removing wishlist item from Firestore:', error);
            throw error;
        }
    }

    // Clear wishlist from Firestore
    async clearWishlistFromFirestore(userId) {
        try {
            const wishlistCollection = collection(db, 'users', userId, 'wishlist');
            const querySnapshot = await getDocs(wishlistCollection);
            
            querySnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });
        } catch (error) {
            console.error('Error clearing wishlist from Firestore:', error);
            throw error;
        }
    }

    // Add wishlist listener
    onWishlistChanged(callback) {
        this.wishlistListeners.push(callback);
    }

    // Notify all wishlist listeners
    notifyWishlistListeners() {
        this.wishlistListeners.forEach(callback => callback(this.wishlistItems));
    }

    // Get wishlist summary
    getWishlistSummary() {
        return {
            items: this.wishlistItems,
            count: this.getWishlistCount(),
            totalValue: this.wishlistItems.reduce((total, item) => total + item.book.price, 0)
        };
    }

    // Update wishlist item with latest book data
    async refreshWishlistData() {
        try {
            const user = authService.getCurrentUser();
            if (!user) return;

            for (let i = 0; i < this.wishlistItems.length; i++) {
                const item = this.wishlistItems[i];
                const bookResult = await bookService.getBookById(item.bookId);
                
                if (bookResult.success) {
                    const book = bookResult.book;
                    this.wishlistItems[i].book = {
                        id: book.id,
                        title: book.title,
                        author: book.author,
                        price: book.price,
                        imageURL: book.imageURL,
                        rating: book.rating
                    };
                }
            }

            this.notifyWishlistListeners();
        } catch (error) {
            console.error('Error refreshing wishlist data:', error);
        }
    }
}

// Create and export singleton instance
const wishlistService = new WishlistService();
export default wishlistService; 