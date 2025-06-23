// Book Service
// Handles all book-related operations including CRUD, image uploads, and category management

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
    limit,
    startAfter,
    Timestamp 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
import { db, storage } from './firebase-config.js';

class BookService {
    constructor() {
        this.booksCollection = collection(db, 'books');
        this.categoriesCollection = collection(db, 'categories');
    }

    // Add a new book to the database
    async addBook(bookData, imageFile = null) {
        try {
            let imageURL = null;
            
            // Upload image if provided
            if (imageFile) {
                const imageResult = await this.uploadBookImage(imageFile);
                if (imageResult.success) {
                    imageURL = imageResult.imageURL;
                }
            }

            // Prepare book data
            const book = {
                title: bookData.title,
                author: bookData.author,
                price: parseFloat(bookData.price),
                stock: parseInt(bookData.stock),
                rating: parseFloat(bookData.rating) || 0,
                imageURL: imageURL || bookData.imageURL || 'https://via.placeholder.com/300x400/cccccc/666666?text=No+Image',
                category: bookData.category,
                description: bookData.description,
                isbn: bookData.isbn || '',
                publisher: bookData.publisher || '',
                publicationYear: bookData.publicationYear || new Date().getFullYear(),
                pages: bookData.pages || 0,
                language: bookData.language || 'English',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            // Add book to Firestore
            const docRef = await addDoc(this.booksCollection, book);
            
            return { 
                success: true, 
                bookId: docRef.id, 
                book: { id: docRef.id, ...book } 
            };
        } catch (error) {
            console.error('Error adding book:', error);
            return { success: false, error: error.message };
        }
    }

    // Get all books with optional filtering and pagination
    async getBooks(filters = {}, page = 1, limitCount = 12) {
        try {
            let q = this.booksCollection;
            
            // Apply filters
            if (filters.category && filters.category !== 'all') {
                q = query(q, where('category', '==', filters.category));
            }
            
            if (filters.author && filters.author !== 'all') {
                q = query(q, where('author', '==', filters.author));
            }
            
            if (filters.minPrice !== undefined) {
                q = query(q, where('price', '>=', filters.minPrice));
            }
            
            if (filters.maxPrice !== undefined) {
                q = query(q, where('price', '<=', filters.maxPrice));
            }
            
            if (filters.minRating !== undefined) {
                q = query(q, where('rating', '>=', filters.minRating));
            }

            // Apply sorting
            if (filters.sortBy) {
                switch (filters.sortBy) {
                    case 'price-asc':
                        q = query(q, orderBy('price', 'asc'));
                        break;
                    case 'price-desc':
                        q = query(q, orderBy('price', 'desc'));
                        break;
                    case 'title-asc':
                        q = query(q, orderBy('title', 'asc'));
                        break;
                    case 'title-desc':
                        q = query(q, orderBy('title', 'desc'));
                        break;
                    case 'rating-desc':
                        q = query(q, orderBy('rating', 'desc'));
                        break;
                    default:
                        q = query(q, orderBy('createdAt', 'desc'));
                }
            } else {
                q = query(q, orderBy('createdAt', 'desc'));
            }

            // Apply pagination
            if (page > 1) {
                // For pagination, you'd need to implement cursor-based pagination
                // This is a simplified version
                q = query(q, limit(limitCount));
            } else {
                q = query(q, limit(limitCount));
            }

            const querySnapshot = await getDocs(q);
            const books = [];
            
            querySnapshot.forEach((doc) => {
                books.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return { success: true, books };
        } catch (error) {
            console.error('Error getting books:', error);
            return { success: false, error: error.message };
        }
    }

    // Get a single book by ID
    async getBookById(bookId) {
        try {
            const bookDoc = await getDoc(doc(this.booksCollection, bookId));
            
            if (bookDoc.exists()) {
                return { 
                    success: true, 
                    book: { id: bookDoc.id, ...bookDoc.data() } 
                };
            } else {
                return { success: false, error: 'Book not found' };
            }
        } catch (error) {
            console.error('Error getting book:', error);
            return { success: false, error: error.message };
        }
    }

    // Update a book
    async updateBook(bookId, updates, imageFile = null) {
        try {
            // Upload new image if provided
            if (imageFile) {
                const imageResult = await this.uploadBookImage(imageFile);
                if (imageResult.success) {
                    updates.imageURL = imageResult.imageURL;
                }
            }

            // Add updated timestamp
            updates.updatedAt = Timestamp.now();

            await updateDoc(doc(this.booksCollection, bookId), updates);
            
            return { success: true };
        } catch (error) {
            console.error('Error updating book:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete a book
    async deleteBook(bookId) {
        try {
            // Get book data to delete image
            const bookDoc = await getDoc(doc(this.booksCollection, bookId));
            if (bookDoc.exists()) {
                const bookData = bookDoc.data();
                
                // Delete image from storage if it's not a placeholder
                if (bookData.imageURL && !bookData.imageURL.includes('placeholder')) {
                    await this.deleteBookImage(bookData.imageURL);
                }
            }

            await deleteDoc(doc(this.booksCollection, bookId));
            return { success: true };
        } catch (error) {
            console.error('Error deleting book:', error);
            return { success: false, error: error.message };
        }
    }

    // Search books
    async searchBooks(searchTerm) {
        try {
            // Note: Firestore doesn't support full-text search natively
            // This is a simple implementation that searches in title and author
            // For production, consider using Algolia or similar service
            
            const querySnapshot = await getDocs(this.booksCollection);
            const books = [];
            
            querySnapshot.forEach((doc) => {
                const bookData = doc.data();
                const searchLower = searchTerm.toLowerCase();
                
                if (bookData.title.toLowerCase().includes(searchLower) ||
                    bookData.author.toLowerCase().includes(searchLower) ||
                    bookData.description.toLowerCase().includes(searchLower)) {
                    books.push({
                        id: doc.id,
                        ...bookData
                    });
                }
            });

            return { success: true, books };
        } catch (error) {
            console.error('Error searching books:', error);
            return { success: false, error: error.message };
        }
    }

    // Get featured books (books with high ratings)
    async getFeaturedBooks(limitCount = 4) {
        try {
            const q = query(
                this.booksCollection,
                where('rating', '>=', 4.0),
                orderBy('rating', 'desc'),
                limit(limitCount)
            );
            
            const querySnapshot = await getDocs(q);
            const books = [];
            
            querySnapshot.forEach((doc) => {
                books.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return { success: true, books };
        } catch (error) {
            console.error('Error getting featured books:', error);
            return { success: false, error: error.message };
        }
    }

    // Upload book image
    async uploadBookImage(file) {
        try {
            const fileName = `book-${Date.now()}-${file.name}`;
            const storageRef = ref(storage, `book-images/${fileName}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            return { success: true, imageURL: downloadURL };
        } catch (error) {
            console.error('Error uploading book image:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete book image
    async deleteBookImage(imageURL) {
        try {
            const imageRef = ref(storage, imageURL);
            await deleteObject(imageRef);
            return { success: true };
        } catch (error) {
            console.error('Error deleting book image:', error);
            return { success: false, error: error.message };
        }
    }

    // Get all categories
    async getCategories() {
        try {
            const querySnapshot = await getDocs(this.categoriesCollection);
            const categories = [];
            
            querySnapshot.forEach((doc) => {
                categories.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return { success: true, categories };
        } catch (error) {
            console.error('Error getting categories:', error);
            return { success: false, error: error.message };
        }
    }

    // Add a new category
    async addCategory(categoryData) {
        try {
            const category = {
                name: categoryData.name,
                description: categoryData.description || '',
                imageURL: categoryData.imageURL || '',
                createdAt: Timestamp.now()
            };

            const docRef = await addDoc(this.categoriesCollection, category);
            
            return { 
                success: true, 
                categoryId: docRef.id, 
                category: { id: docRef.id, ...category } 
            };
        } catch (error) {
            console.error('Error adding category:', error);
            return { success: false, error: error.message };
        }
    }

    // Get books by category
    async getBooksByCategory(category, limitCount = 12) {
        try {
            const q = query(
                this.booksCollection,
                where('category', '==', category),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
            
            const querySnapshot = await getDocs(q);
            const books = [];
            
            querySnapshot.forEach((doc) => {
                books.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return { success: true, books };
        } catch (error) {
            console.error('Error getting books by category:', error);
            return { success: false, error: error.message };
        }
    }

    // Get unique authors
    async getAuthors() {
        try {
            const querySnapshot = await getDocs(this.booksCollection);
            const authors = new Set();
            
            querySnapshot.forEach((doc) => {
                const bookData = doc.data();
                if (bookData.author) {
                    authors.add(bookData.author);
                }
            });

            return { success: true, authors: Array.from(authors).sort() };
        } catch (error) {
            console.error('Error getting authors:', error);
            return { success: false, error: error.message };
        }
    }

    // Update book stock
    async updateBookStock(bookId, quantity) {
        try {
            const bookDoc = await getDoc(doc(this.booksCollection, bookId));
            if (bookDoc.exists()) {
                const currentStock = bookDoc.data().stock;
                const newStock = Math.max(0, currentStock + quantity);
                
                await updateDoc(doc(this.booksCollection, bookId), {
                    stock: newStock,
                    updatedAt: Timestamp.now()
                });
                
                return { success: true, newStock };
            } else {
                return { success: false, error: 'Book not found' };
            }
        } catch (error) {
            console.error('Error updating book stock:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create and export singleton instance
const bookService = new BookService();
export default bookService; 