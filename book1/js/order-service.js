// Order Service
// Handles order management, history, and status tracking

import { 
    collection, 
    doc, 
    addDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    query, 
    where, 
    orderBy,
    limit,
    Timestamp 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { db } from './firebase-config.js';
import authService from './auth-service.js';

class OrderService {
    constructor() {
        this.orders = [];
        this.orderListeners = [];
    }

    // Create a new order
    async createOrder(orderData) {
        try {
            const user = authService.getCurrentUser();
            if (!user) {
                return { success: false, error: 'Please login to create an order' };
            }

            const order = {
                userId: user.uid,
                items: orderData.items,
                subtotal: orderData.subtotal,
                shipping: orderData.shipping || 50,
                total: orderData.total,
                shippingAddress: orderData.shippingAddress,
                paymentMethod: orderData.paymentMethod || 'cod',
                status: 'pending',
                paymentStatus: 'pending',
                trackingNumber: null,
                notes: orderData.notes || '',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            // Save order to Firestore
            const ordersCollection = collection(db, 'users', user.uid, 'orders');
            const docRef = await addDoc(ordersCollection, order);

            // Add to local array
            const newOrder = { id: docRef.id, ...order };
            this.orders.unshift(newOrder);

            this.notifyOrderListeners();
            return { success: true, orderId: docRef.id, order: newOrder };
        } catch (error) {
            console.error('Error creating order:', error);
            return { success: false, error: error.message };
        }
    }

    // Get order by ID
    async getOrderById(orderId) {
        try {
            const user = authService.getCurrentUser();
            if (!user) {
                return { success: false, error: 'Please login to view orders' };
            }

            const orderDoc = await getDoc(doc(db, 'users', user.uid, 'orders', orderId));
            
            if (orderDoc.exists()) {
                return { 
                    success: true, 
                    order: { id: orderDoc.id, ...orderDoc.data() } 
                };
            } else {
                return { success: false, error: 'Order not found' };
            }
        } catch (error) {
            console.error('Error getting order:', error);
            return { success: false, error: error.message };
        }
    }

    // Get all orders for current user
    async getUserOrders(limitCount = 20) {
        try {
            const user = authService.getCurrentUser();
            if (!user) {
                return { success: false, error: 'Please login to view orders' };
            }

            const ordersCollection = collection(db, 'users', user.uid, 'orders');
            const q = query(ordersCollection, orderBy('createdAt', 'desc'), limit(limitCount));
            const querySnapshot = await getDocs(q);
            
            this.orders = [];
            querySnapshot.forEach((doc) => {
                this.orders.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            this.notifyOrderListeners();
            return { success: true, orders: this.orders };
        } catch (error) {
            console.error('Error getting user orders:', error);
            return { success: false, error: error.message };
        }
    }

    // Update order status (admin function)
    async updateOrderStatus(orderId, status, trackingNumber = null) {
        try {
            const user = authService.getCurrentUser();
            if (!user) {
                return { success: false, error: 'Please login to update orders' };
            }

            // In a real app, you'd check if user is admin
            // For now, we'll allow any logged-in user to update their own orders

            const updates = {
                status: status,
                updatedAt: Timestamp.now()
            };

            if (trackingNumber) {
                updates.trackingNumber = trackingNumber;
            }

            await updateDoc(doc(db, 'users', user.uid, 'orders', orderId), updates);

            // Update local order
            const orderIndex = this.orders.findIndex(order => order.id === orderId);
            if (orderIndex !== -1) {
                this.orders[orderIndex] = { ...this.orders[orderIndex], ...updates };
            }

            this.notifyOrderListeners();
            return { success: true, message: 'Order status updated' };
        } catch (error) {
            console.error('Error updating order status:', error);
            return { success: false, error: error.message };
        }
    }

    // Cancel order
    async cancelOrder(orderId) {
        try {
            const user = authService.getCurrentUser();
            if (!user) {
                return { success: false, error: 'Please login to cancel orders' };
            }

            // Get order to check if it can be cancelled
            const orderResult = await this.getOrderById(orderId);
            if (!orderResult.success) {
                return orderResult;
            }

            const order = orderResult.order;
            
            // Check if order can be cancelled (only pending orders)
            if (order.status !== 'pending') {
                return { success: false, error: 'Order cannot be cancelled at this stage' };
            }

            // Update order status
            await this.updateOrderStatus(orderId, 'cancelled');

            return { success: true, message: 'Order cancelled successfully' };
        } catch (error) {
            console.error('Error cancelling order:', error);
            return { success: false, error: error.message };
        }
    }

    // Get orders by status
    async getOrdersByStatus(status) {
        try {
            const user = authService.getCurrentUser();
            if (!user) {
                return { success: false, error: 'Please login to view orders' };
            }

            const ordersCollection = collection(db, 'users', user.uid, 'orders');
            const q = query(
                ordersCollection, 
                where('status', '==', status),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            
            const orders = [];
            querySnapshot.forEach((doc) => {
                orders.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return { success: true, orders };
        } catch (error) {
            console.error('Error getting orders by status:', error);
            return { success: false, error: error.message };
        }
    }

    // Get recent orders
    async getRecentOrders(limitCount = 5) {
        try {
            const user = authService.getCurrentUser();
            if (!user) {
                return { success: false, error: 'Please login to view orders' };
            }

            const ordersCollection = collection(db, 'users', user.uid, 'orders');
            const q = query(ordersCollection, orderBy('createdAt', 'desc'), limit(limitCount));
            const querySnapshot = await getDocs(q);
            
            const orders = [];
            querySnapshot.forEach((doc) => {
                orders.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return { success: true, orders };
        } catch (error) {
            console.error('Error getting recent orders:', error);
            return { success: false, error: error.message };
        }
    }

    // Get order statistics
    async getOrderStatistics() {
        try {
            const user = authService.getCurrentUser();
            if (!user) {
                return { success: false, error: 'Please login to view statistics' };
            }

            const ordersResult = await this.getUserOrders(1000); // Get all orders
            if (!ordersResult.success) {
                return ordersResult;
            }

            const orders = ordersResult.orders;
            const stats = {
                totalOrders: orders.length,
                totalSpent: 0,
                pendingOrders: 0,
                completedOrders: 0,
                cancelledOrders: 0,
                averageOrderValue: 0
            };

            orders.forEach(order => {
                stats.totalSpent += order.total;
                
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
            });

            if (stats.totalOrders > 0) {
                stats.averageOrderValue = stats.totalSpent / stats.totalOrders;
            }

            return { success: true, statistics: stats };
        } catch (error) {
            console.error('Error getting order statistics:', error);
            return { success: false, error: error.message };
        }
    }

    // Get order status text
    getOrderStatusText(status) {
        const statusMap = {
            'pending': 'Pending',
            'processing': 'Processing',
            'shipped': 'Shipped',
            'delivered': 'Delivered',
            'cancelled': 'Cancelled',
            'refunded': 'Refunded'
        };
        return statusMap[status] || status;
    }

    // Get order status color
    getOrderStatusColor(status) {
        const colorMap = {
            'pending': 'warning',
            'processing': 'info',
            'shipped': 'primary',
            'delivered': 'success',
            'cancelled': 'danger',
            'refunded': 'secondary'
        };
        return colorMap[status] || 'secondary';
    }

    // Format order date
    formatOrderDate(timestamp) {
        if (!timestamp) return '';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Calculate order total
    calculateOrderTotal(items, shipping = 50) {
        const subtotal = items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
        
        return {
            subtotal: subtotal,
            shipping: shipping,
            total: subtotal + shipping
        };
    }

    // Add order listener
    onOrdersChanged(callback) {
        this.orderListeners.push(callback);
    }

    // Notify all order listeners
    notifyOrderListeners() {
        this.orderListeners.forEach(callback => callback(this.orders));
    }

    // Get current orders
    getCurrentOrders() {
        return this.orders;
    }

    // Get order count
    getOrderCount() {
        return this.orders.length;
    }

    // Get pending order count
    getPendingOrderCount() {
        return this.orders.filter(order => order.status === 'pending').length;
    }
}

// Create and export singleton instance
const orderService = new OrderService();
export default orderService; 