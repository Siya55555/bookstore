// Firebase Setup Script
// Initializes the database with sample data and categories
// Run this script once to set up your Firebase project

import bookService from './book-service.js';
import authService from './auth-service.js';
import adminService from './admin-service.js';

class FirebaseSetup {
    constructor() {
        this.sampleBooks = [
            {
                title: 'The Alchemist',
                author: 'Paulo Coelho',
                price: 199,
                stock: 50,
                rating: 4.5,
                category: 'Fiction',
                description: 'A magical story about following your dreams and listening to your heart.',
                isbn: '9780062315007',
                publisher: 'HarperOne',
                publicationYear: 2014,
                pages: 208,
                language: 'English',
                imageURL: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop'
            },
            {
                title: 'Sapiens: A Brief History of Humankind',
                author: 'Yuval Noah Harari',
                price: 299,
                stock: 35,
                rating: 4.7,
                category: 'Non-Fiction',
                description: 'A groundbreaking narrative of humanity\'s creation and evolution.',
                isbn: '9780062316097',
                publisher: 'Harper',
                publicationYear: 2015,
                pages: 464,
                language: 'English',
                imageURL: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop'
            },
            {
                title: 'To Kill a Mockingbird',
                author: 'Harper Lee',
                price: 249,
                stock: 40,
                rating: 4.8,
                category: 'Fiction',
                description: 'A powerful story of racial injustice and loss of innocence in the American South.',
                isbn: '9780446310789',
                publisher: 'Grand Central Publishing',
                publicationYear: 1960,
                pages: 376,
                language: 'English',
                imageURL: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop'
            },
            {
                title: '1984',
                author: 'George Orwell',
                price: 180,
                stock: 45,
                rating: 4.6,
                category: 'Fiction',
                description: 'A dystopian novel about totalitarianism and surveillance society.',
                isbn: '9780451524935',
                publisher: 'Signet',
                publicationYear: 1949,
                pages: 328,
                language: 'English',
                imageURL: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=400&fit=crop'
            },
            {
                title: 'The Power of Habit',
                author: 'Charles Duhigg',
                price: 280,
                stock: 30,
                rating: 4.3,
                category: 'Non-Fiction',
                description: 'Why we do what we do in life and business.',
                isbn: '9780812981605',
                publisher: 'Random House',
                publicationYear: 2012,
                pages: 371,
                language: 'English',
                imageURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop'
            },
            {
                title: 'Becoming',
                author: 'Michelle Obama',
                price: 350,
                stock: 25,
                rating: 4.9,
                category: 'Biography',
                description: 'An intimate, powerful, and inspiring memoir by the former First Lady.',
                isbn: '9781524763138',
                publisher: 'Crown',
                publicationYear: 2018,
                pages: 448,
                language: 'English',
                imageURL: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=300&h=400&fit=crop'
            },
            {
                title: 'The Lord of the Rings',
                author: 'J.R.R. Tolkien',
                price: 450,
                stock: 20,
                rating: 4.8,
                category: 'Fantasy',
                description: 'An epic high-fantasy novel about the quest to destroy a powerful ring.',
                isbn: '9780547928210',
                publisher: 'Houghton Mifflin Harcourt',
                publicationYear: 1954,
                pages: 1216,
                language: 'English',
                imageURL: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=400&fit=crop'
            },
            {
                title: 'Atomic Habits',
                author: 'James Clear',
                price: 260,
                stock: 40,
                rating: 4.4,
                category: 'Non-Fiction',
                description: 'Tiny changes, remarkable results: An easy & proven way to build good habits.',
                isbn: '9780735211292',
                publisher: 'Avery',
                publicationYear: 2018,
                pages: 320,
                language: 'English',
                imageURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop'
            },
            {
                title: 'The Great Gatsby',
                author: 'F. Scott Fitzgerald',
                price: 220,
                stock: 35,
                rating: 4.5,
                category: 'Fiction',
                description: 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
                isbn: '9780743273565',
                publisher: 'Scribner',
                publicationYear: 1925,
                pages: 180,
                language: 'English',
                imageURL: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop'
            },
            {
                title: 'The Hobbit',
                author: 'J.R.R. Tolkien',
                price: 320,
                stock: 30,
                rating: 4.7,
                category: 'Fantasy',
                description: 'A fantasy novel about the adventures of Bilbo Baggins, a hobbit.',
                isbn: '9780547928241',
                publisher: 'Houghton Mifflin Harcourt',
                publicationYear: 1937,
                pages: 366,
                language: 'English',
                imageURL: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=400&fit=crop'
            }
        ];

        this.categories = [
            {
                name: 'Fiction',
                description: 'Imaginative stories and novels',
                imageURL: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop'
            },
            {
                name: 'Non-Fiction',
                description: 'Factual books and real-world topics',
                imageURL: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop'
            },
            {
                name: 'Biography',
                description: 'Life stories and memoirs',
                imageURL: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=300&fit=crop'
            },
            {
                name: 'Fantasy',
                description: 'Magical and supernatural stories',
                imageURL: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop'
            },
            {
                name: 'Romance',
                description: 'Love stories and romantic fiction',
                imageURL: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop'
            },
            {
                name: 'Mystery',
                description: 'Detective stories and thrillers',
                imageURL: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=300&fit=crop'
            },
            {
                name: 'Science Fiction',
                description: 'Futuristic and scientific stories',
                imageURL: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=300&fit=crop'
            },
            {
                name: 'Self-Help',
                description: 'Personal development and improvement',
                imageURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
            }
        ];
    }

    // Initialize the database with sample data
    async initializeDatabase() {
        try {
            console.log('🚀 Starting Firebase database initialization...');

            // Wait for authentication
            await this.waitForAuth();

            // Check if user is admin
            if (!adminService.getAdminStatus()) {
                console.error('❌ Admin access required to initialize database');
                return { success: false, error: 'Admin access required' };
            }

            // Add categories
            console.log('📚 Adding categories...');
            await this.addCategories();

            // Add books
            console.log('📖 Adding sample books...');
            await this.addBooks();

            console.log('✅ Database initialization completed successfully!');
            return { success: true, message: 'Database initialized successfully' };

        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Wait for authentication to complete
    async waitForAuth() {
        return new Promise((resolve) => {
            const checkAuth = () => {
                if (authService.getCurrentUser()) {
                    resolve();
                } else {
                    setTimeout(checkAuth, 100);
                }
            };
            checkAuth();
        });
    }

    // Add categories to the database
    async addCategories() {
        for (const category of this.categories) {
            try {
                const result = await bookService.addCategory(category);
                if (result.success) {
                    console.log(`✅ Added category: ${category.name}`);
                } else {
                    console.log(`⚠️ Failed to add category: ${category.name}`);
                }
            } catch (error) {
                console.log(`❌ Error adding category ${category.name}:`, error);
            }
        }
    }

    // Add books to the database
    async addBooks() {
        for (const book of this.sampleBooks) {
            try {
                const result = await bookService.addBook(book);
                if (result.success) {
                    console.log(`✅ Added book: ${book.title}`);
                } else {
                    console.log(`⚠️ Failed to add book: ${book.title}`);
                }
            } catch (error) {
                console.log(`❌ Error adding book ${book.title}:`, error);
            }
        }
    }

    // Clear all data (admin only)
    async clearAllData() {
        try {
            if (!adminService.getAdminStatus()) {
                return { success: false, error: 'Admin access required' };
            }

            console.log('🗑️ Clearing all data...');
            
            // Get all books and delete them
            const booksResult = await adminService.getAllBooksForAdmin(1000);
            if (booksResult.success) {
                for (const book of booksResult.books) {
                    await bookService.deleteBook(book.id);
                    console.log(`🗑️ Deleted book: ${book.title}`);
                }
            }

            console.log('✅ All data cleared successfully!');
            return { success: true, message: 'All data cleared' };

        } catch (error) {
            console.error('❌ Error clearing data:', error);
            return { success: false, error: error.message };
        }
    }

    // Get setup status
    async getSetupStatus() {
        try {
            const booksResult = await bookService.getBooks({}, 1, 1);
            const categoriesResult = await bookService.getCategories();

            return {
                success: true,
                hasBooks: booksResult.success && booksResult.books.length > 0,
                hasCategories: categoriesResult.success && categoriesResult.categories.length > 0,
                bookCount: booksResult.success ? booksResult.books.length : 0,
                categoryCount: categoriesResult.success ? categoriesResult.categories.length : 0
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Create and export setup instance
const firebaseSetup = new FirebaseSetup();

// Add to window for easy access in browser console
if (typeof window !== 'undefined') {
    window.firebaseSetup = firebaseSetup;
}

export default firebaseSetup; 