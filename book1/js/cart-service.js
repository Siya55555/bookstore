// Cart Service
// Handles all cart-related operations including add, remove, update quantity, and checkout

import { 
    collection, 
    doc, 
    addDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy,
    Timestamp 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { db } from './firebase-config.js';
import authService from './auth-service.js';
import bookService from './book-service.js';

class CartService {
    constructor() {
        this.cartItems = [];
        this.cartListeners = [];
        this.initCartListener();
    }

    // Initialize cart listener for real-time updates
    initCartListener() {
        authService.onAuthStateChanged(async (user) => {
            if (user) {
                await this.loadCartFromFirestore(user.uid);
            } else {
                this.cartItems = [];
                this.notifyCartListeners();
            }
        });
    }

    // Add item to cart
    async addToCart(bookId, quantity = 1) {
        try {
            const user = authService.getCurrentUser();
            if (!user) {
                return { success: false, error: 'Please login to add items to cart' };
            }

            // Get book details
            const bookResult = await bookService.getBookById(bookId);
            if (!bookResult.success) {
                return { success: false, error: 'Book not found' };
            }

            const book = bookResult.book;

            // Check if book is already in cart
            const existingItem = this.cartItems.find(item => item.bookId === bookId);
            
            if (existingItem) {
                // Update quantity
                existingItem.quantity += quantity;
                await this.updateCartItemInFirestore(user.uid, bookId, existingItem.quantity);
            } else {
                // Add new item
                const cartItem = {
                    bookId: bookId,
                    quantity: quantity,
                    addedAt: Timestamp.now(),
                    book: {
                        id: book.id,
                        title: book.title,
                        author: book.author,
                        price: book.price,
                        imageURL: book.imageURL
                    }
                };

                this.cartItems.push(cartItem);
                await this.addCartItemToFirestore(user.uid, cartItem);
            }

            this.notifyCartListeners();
            return { success: true, message: 'Item added to cart' };
        } catch (error) {
            console.error('Error adding to cart:', error);
            return { success: false, error: error.message };
        }
    }

    // Remove item from cart
    async removeFromCart(bookId) {
        try {
            const user = authService.getCurrentUser();
            if (!user) {
                return { success: false, error: 'Please login to manage cart' };
            }

            // Remove from local array
            this.cartItems = this.cartItems.filter(item => item.bookId !== bookId);
            
            // Remove from Firestore
            await this.removeCartItemFromFirestore(user.uid, bookId);

            this.notifyCartListeners();
            return { success: true, message: 'Item removed from cart' };
        } catch (error) {
            console.error('Error removing from cart:', error);
            return { success: false, error: error.message };
        }
    }

    // Update item quantity in cart
    async updateCartItemQuantity(bookId, quantity) {
        try {
            const user = authService.getCurrentUser();
            if (!user) {
                return { success: false, error: 'Please login to manage cart' };
            }

            if (quantity <= 0) {
                return await this.removeFromCart(bookId);
            }

            // Check book stock
            const bookResult = await bookService.getBookById(bookId);
            if (!bookResult.success) {
                return { success: false, error: 'Book not found' };
            }

            if (quantity > bookResult.book.stock) {
                return { success: false, error: 'Not enough stock available' };
            }

            // Update quantity in local array
            const cartItem = this.cartItems.find(item => item.bookId === bookId);
            if (cartItem) {
                cartItem.quantity = quantity;
                await this.updateCartItemInFirestore(user.uid, bookId, quantity);
            }

            this.notifyCartListeners();
            return { success: true, message: 'Cart updated' };
        } catch (error) {
            console.error('Error updating cart quantity:', error);
            return { success: false, error: error.message };
        }
    }

    // Clear entire cart
    async clearCart() {
        try {
            const user = authService.getCurrentUser();
            if (!user) {
                return { success: false, error: 'Please login to manage cart' };
            }

            // Clear local array
            this.cartItems = [];
            
            // Clear from Firestore
            await this.clearCartFromFirestore(user.uid);

            this.notifyCartListeners();
            return { success: true, message: 'Cart cleared' };
        } catch (error) {
            console.error('Error clearing cart:', error);
            return { success: false, error: error.message };
        }
    }

    // Get cart items
    getCartItems() {
        return this.cartItems;
    }

    // Get cart count
    getCartCount() {
        return this.cartItems.reduce((total, item) => total + item.quantity, 0);
    }

    // Get cart total
    getCartTotal() {
        return this.cartItems.reduce((total, item) => {
            return total + (item.book.price * item.quantity);
        }, 0);
    }

    // Checkout process
    async checkout(shippingAddress, paymentMethod = 'cod') {
        try {
            const user = authService.getCurrentUser();
            if (!user) {
                return { success: false, error: 'Please login to checkout' };
            }

            if (this.cartItems.length === 0) {
                return { success: false, error: 'Cart is empty' };
            }

            // Validate stock for all items
            for (const item of this.cartItems) {
                const bookResult = await bookService.getBookById(item.bookId);
                if (!bookResult.success) {
                    return { success: false, error: `Book ${item.book.title} not found` };
                }
                if (bookResult.book.stock < item.quantity) {
                    return { success: false, error: `Not enough stock for ${item.book.title}` };
                }
            }

            // Create order
            const order = {
                userId: user.uid,
                items: this.cartItems.map(item => ({
                    bookId: item.bookId,
                    quantity: item.quantity,
                    price: item.book.price,
                    book: item.book
                })),
                subtotal: this.getCartTotal(),
                shipping: 50, // Fixed shipping cost
                total: this.getCartTotal() + 50,
                shippingAddress: shippingAddress,
                paymentMethod: paymentMethod,
                status: 'pending',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            // Save order to Firestore
            const orderResult = await this.saveOrderToFirestore(user.uid, order);
            if (!orderResult.success) {
                return orderResult;
            }

            // Update book stock
            for (const item of this.cartItems) {
                await bookService.updateBookStock(item.bookId, -item.quantity);
            }

            // Clear cart
            await this.clearCart();

            return { 
                success: true, 
                orderId: orderResult.orderId,
                message: 'Order placed successfully' 
            };
        } catch (error) {
            console.error('Error during checkout:', error);
            return { success: false, error: error.message };
        }
    }

    // Load cart from Firestore
    async loadCartFromFirestore(userId) {
        try {
            const cartCollection = collection(db, 'users', userId, 'cart');
            const querySnapshot = await getDocs(cartCollection);
            
            this.cartItems = [];
            querySnapshot.forEach((doc) => {
                this.cartItems.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            this.notifyCartListeners();
        } catch (error) {
            console.error('Error loading cart from Firestore:', error);
        }
    }

    // Add cart item to Firestore
    async addCartItemToFirestore(userId, cartItem) {
        try {
            const cartCollection = collection(db, 'users', userId, 'cart');
            await addDoc(cartCollection, cartItem);
        } catch (error) {
            console.error('Error adding cart item to Firestore:', error);
            throw error;
        }
    }

    // Update cart item in Firestore
    async updateCartItemInFirestore(userId, bookId, quantity) {
        try {
            const cartCollection = collection(db, 'users', userId, 'cart');
            const q = query(cartCollection, where('bookId', '==', bookId));
            const querySnapshot = await getDocs(q);
            
            querySnapshot.forEach(async (doc) => {
                await updateDoc(doc.ref, { quantity: quantity });
            });
        } catch (error) {
            console.error('Error updating cart item in Firestore:', error);
            throw error;
        }
    }

    // Remove cart item from Firestore
    async removeCartItemFromFirestore(userId, bookId) {
        try {
            const cartCollection = collection(db, 'users', userId, 'cart');
            const q = query(cartCollection, where('bookId', '==', bookId));
            const querySnapshot = await getDocs(q);
            
            querySnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });
        } catch (error) {
            console.error('Error removing cart item from Firestore:', error);
            throw error;
        }
    }

    // Clear cart from Firestore
    async clearCartFromFirestore(userId) {
        try {
            const cartCollection = collection(db, 'users', userId, 'cart');
            const querySnapshot = await getDocs(cartCollection);
            
            querySnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });
        } catch (error) {
            console.error('Error clearing cart from Firestore:', error);
            throw error;
        }
    }

    // Save order to Firestore
    async saveOrderToFirestore(userId, order) {
        try {
            const ordersCollection = collection(db, 'users', userId, 'orders');
            const docRef = await addDoc(ordersCollection, order);
            return { success: true, orderId: docRef.id };
        } catch (error) {
            console.error('Error saving order to Firestore:', error);
            return { success: false, error: error.message };
        }
    }

    // Add cart listener
    onCartChanged(callback) {
        this.cartListeners.push(callback);
    }

    // Notify all cart listeners
    notifyCartListeners() {
        this.cartListeners.forEach(callback => callback(this.cartItems));
    }

    // Get cart summary
    getCartSummary() {
        return {
            items: this.cartItems,
            count: this.getCartCount(),
            subtotal: this.getCartTotal(),
            shipping: 50,
            total: this.getCartTotal() + 50
        };
    }
}

// Create and export singleton instance
const cartService = new CartService();
export default cartService; 