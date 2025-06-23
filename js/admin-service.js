// Admin Service
// Handles admin-specific operations like managing books, categories, and user management

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
    Timestamp 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { db } from './firebase-config.js';
import authService from './auth-service.js';
import bookService from './book-service.js';

class AdminService {
    constructor() {
        this.isAdmin = false;
        this.adminListeners = [];
        this.checkAdminStatus();
    }

    // Check if current user is admin
    async checkAdminStatus() {
        try {
            const user = authService.getCurrentUser();
            if (!user) {
                this.isAdmin = false;
                this.notifyAdminListeners();
                return;
            }

            // In a real app, you'd check custom claims or admin collection
            // For now, we'll use a simple approach with admin emails
            const adminEmails = [
                'admin@bookworldindia.com',
                'muskanagarwaljuly8@gmail.com'
            ];

            this.isAdmin = adminEmails.includes(user.email);
            this.notifyAdminListeners();
        } catch (error) {
            console.error('Error checking admin status:', error);
            this.isAdmin = false;
            this.notifyAdminListeners();
        }
    }

    // Get admin status
    getAdminStatus() {
        return this.isAdmin;
    }

    // Check if user can perform admin actions
    canPerformAdminAction() {
        const user = authService.getCurrentUser();
        if (!user || !this.isAdmin) {
            return false;
        }
        return true;
    }

    // Add a new book (admin only)
    async addBook(bookData, imageFile = null) {
        if (!this.canPerformAdminAction()) {
            return { success: false, error: 'Admin access required' };
        }

        return await bookService.addBook(bookData, imageFile);
    }

    // Update a book (admin only)
    async updateBook(bookId, updates, imageFile = null) {
        if (!this.canPerformAdminAction()) {
            return { success: false, error: 'Admin access required' };
        }

        return await bookService.updateBook(bookId, updates, imageFile);
    }

    // Delete a book (admin only)
    async deleteBook(bookId) {
        if (!this.canPerformAdminAction()) {
            return { success: false, error: 'Admin access required' };
        }

        return await bookService.deleteBook(bookId);
    }

    // Get all books for admin management
    async getAllBooksForAdmin(limitCount = 50) {
        if (!this.canPerformAdminAction()) {
            return { success: false, error: 'Admin access required' };
        }

        try {
            const booksCollection = collection(db, 'books');
            const q = query(booksCollection, orderBy('createdAt', 'desc'), limit(limitCount));
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
            console.error('Error getting all books for admin:', error);
            return { success: false, error: error.message };
        }
    }

    // Get book statistics
    async getBookStatistics() {
        if (!this.canPerformAdminAction()) {
            return { success: false, error: 'Admin access required' };
        }

        try {
            const booksResult = await this.getAllBooksForAdmin(1000);
            if (!booksResult.success) {
                return booksResult;
            }

            const books = booksResult.books;
            const stats = {
                totalBooks: books.length,
                totalValue: 0,
                lowStockBooks: 0,
                outOfStockBooks: 0,
                averagePrice: 0,
                categories: {},
                authors: {}
            };

            books.forEach(book => {
                stats.totalValue += book.price * book.stock;
                
                if (book.stock <= 5) {
                    stats.lowStockBooks++;
                }
                if (book.stock === 0) {
                    stats.outOfStockBooks++;
                }

                // Count categories
                if (book.category) {
                    stats.categories[book.category] = (stats.categories[book.category] || 0) + 1;
                }

                // Count authors
                if (book.author) {
                    stats.authors[book.author] = (stats.authors[book.author] || 0) + 1;
                }
            });

            if (stats.totalBooks > 0) {
                stats.averagePrice = books.reduce((sum, book) => sum + book.price, 0) / stats.totalBooks;
            }

            return { success: true, statistics: stats };
        } catch (error) {
            console.error('Error getting book statistics:', error);
            return { success: false, error: error.message };
        }
    }

    // Get all users (admin only)
    async getAllUsers(limitCount = 50) {
        if (!this.canPerformAdminAction()) {
            return { success: false, error: 'Admin access required' };
        }

        try {
            const usersCollection = collection(db, 'users');
            const q = query(usersCollection, orderBy('createdAt', 'desc'), limit(limitCount));
            const querySnapshot = await getDocs(q);
            
            const users = [];
            querySnapshot.forEach((doc) => {
                users.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return { success: true, users };
        } catch (error) {
            console.error('Error getting all users:', error);
            return { success: false, error: error.message };
        }
    }

    // Get user statistics
    async getUserStatistics() {
        if (!this.canPerformAdminAction()) {
            return { success: false, error: 'Admin access required' };
        }

        try {
            const usersResult = await this.getAllUsers(1000);
            if (!usersResult.success) {
                return usersResult;
            }

            const users = usersResult.users;
            const stats = {
                totalUsers: users.length,
                activeUsers: 0,
                newUsersThisMonth: 0,
                averageOrdersPerUser: 0
            };

            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            users.forEach(user => {
                if (user.lastLogin) {
                    const lastLogin = user.lastLogin.toDate ? user.lastLogin.toDate() : new Date(user.lastLogin);
                    const daysSinceLogin = (new Date() - lastLogin) / (1000 * 60 * 60 * 24);
                    
                    if (daysSinceLogin <= 30) {
                        stats.activeUsers++;
                    }
                }

                if (user.createdAt) {
                    const createdDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
                    if (createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear) {
                        stats.newUsersThisMonth++;
                    }
                }
            });

            return { success: true, statistics: stats };
        } catch (error) {
            console.error('Error getting user statistics:', error);
            return { success: false, error: error.message };
        }
    }

    // Get all orders (admin only)
    async getAllOrders(limitCount = 50) {
        if (!this.canPerformAdminAction()) {
            return { success: false, error: 'Admin access required' };
        }

        try {
            // Get all users first
            const usersResult = await this.getAllUsers(100);
            if (!usersResult.success) {
                return usersResult;
            }

            const allOrders = [];
            
            // Get orders for each user
            for (const user of usersResult.users) {
                const ordersCollection = collection(db, 'users', user.id, 'orders');
                const q = query(ordersCollection, orderBy('createdAt', 'desc'), limit(10));
                const querySnapshot = await getDocs(q);
                
                querySnapshot.forEach((doc) => {
                    allOrders.push({
                        id: doc.id,
                        userId: user.id,
                        userName: user.name,
                        userEmail: user.email,
                        ...doc.data()
                    });
                });
            }

            // Sort by creation date and limit
            allOrders.sort((a, b) => {
                const dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                const dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                return dateB - dateA;
            });

            return { success: true, orders: allOrders.slice(0, limitCount) };
        } catch (error) {
            console.error('Error getting all orders:', error);
            return { success: false, error: error.message };
        }
    }

    // Get order statistics for admin
    async getOrderStatisticsForAdmin() {
        if (!this.canPerformAdminAction()) {
            return { success: false, error: 'Admin access required' };
        }

        try {
            const ordersResult = await this.getAllOrders(1000);
            if (!ordersResult.success) {
                return ordersResult;
            }

            const orders = ordersResult.orders;
            const stats = {
                totalOrders: orders.length,
                totalRevenue: 0,
                pendingOrders: 0,
                completedOrders: 0,
                cancelledOrders: 0,
                averageOrderValue: 0,
                monthlyRevenue: {},
                topSellingBooks: {}
            };

            orders.forEach(order => {
                stats.totalRevenue += order.total;
                
                switch (order.status) {
                    case 'pending':
                        stats.pendingOrders++;
                        break;
                    case 'completed':
                        stats.completedOrders++;
                        break;
                    case 'cancelled':
                        stats.cancelledOrders++;
                        break;
                }

                // Monthly revenue
                if (order.createdAt) {
                    const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
                    const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth() + 1}`;
                    stats.monthlyRevenue[monthKey] = (stats.monthlyRevenue[monthKey] || 0) + order.total;
                }

                // Top selling books
                if (order.items) {
                    order.items.forEach(item => {
                        const bookKey = item.book.title;
                        stats.topSellingBooks[bookKey] = (stats.topSellingBooks[bookKey] || 0) + item.quantity;
                    });
                }
            });

            if (stats.totalOrders > 0) {
                stats.averageOrderValue = stats.totalRevenue / stats.totalOrders;
            }

            return { success: true, statistics: stats };
        } catch (error) {
            console.error('Error getting order statistics for admin:', error);
            return { success: false, error: error.message };
        }
    }

    // Update order status (admin only)
    async updateOrderStatusForAdmin(userId, orderId, status, trackingNumber = null) {
        if (!this.canPerformAdminAction()) {
            return { success: false, error: 'Admin access required' };
        }

        try {
            const updates = {
                status: status,
                updatedAt: Timestamp.now()
            };

            if (trackingNumber) {
                updates.trackingNumber = trackingNumber;
            }

            await updateDoc(doc(db, 'users', userId, 'orders', orderId), updates);
            return { success: true, message: 'Order status updated' };
        } catch (error) {
            console.error('Error updating order status for admin:', error);
            return { success: false, error: error.message };
        }
    }

    // Add admin listener
    onAdminStatusChanged(callback) {
        this.adminListeners.push(callback);
    }

    // Notify all admin listeners
    notifyAdminListeners() {
        this.adminListeners.forEach(callback => callback(this.isAdmin));
    }

    // Initialize admin service
    async init() {
        // Listen for auth state changes
        authService.onAuthStateChanged(async (user) => {
            await this.checkAdminStatus();
        });
    }
}

// Create and export singleton instance
const adminService = new AdminService();
export default adminService; 