document.addEventListener('DOMContentLoaded', () => {

    const allBooks = [
        { id: 1, title: 'The Alchemist', author: 'Paulo Coelho', price: 199, image: 'assets/images/books/book1.jpg', category: 'fiction', rating: 4.5, reviews: 1250 },
        { id: 2, title: 'Sapiens', author: 'Yuval Noah Harari', price: 299, image: 'assets/images/books/book2.jpg', category: 'non-fiction', rating: 4.7, reviews: 890 },
        { id: 3, title: 'To Kill a Mockingbird', author: 'Harper Lee', price: 249, image: 'assets/images/books/book3.jpg', category: 'fiction', rating: 4.8, reviews: 2100 },
        { id: 4, title: '1984', author: 'George Orwell', price: 180, image: 'assets/images/books/book4.jpg', category: 'fiction', rating: 4.6, reviews: 1650 },
        { id: 5, title: 'The Power of Habit', author: 'Charles Duhigg', price: 280, image: 'assets/images/books/book5.jpg', category: 'non-fiction', rating: 4.3, reviews: 750 },
        { id: 6, title: 'Becoming', author: 'Michelle Obama', price: 350, image: 'assets/images/books/book6.jpg', category: 'biography', rating: 4.9, reviews: 3200 },
        { id: 7, title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', price: 450, image: 'assets/images/books/book7.jpg', category: 'fantasy', rating: 4.8, reviews: 2800 },
        { id: 8, title: 'Atomic Habits', author: 'James Clear', price: 260, image: 'assets/images/books/book8.jpg', category: 'non-fiction', rating: 4.4, reviews: 1100 }
    ];

    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartSummary = document.getElementById('cart-summary');
    const emptyCartMessage = document.getElementById('empty-cart-message');

    const getFromStorage = (key) => JSON.parse(localStorage.getItem(key)) || [];
    const saveToStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));

    let cart = getFromStorage('cart');

    const getStarRating = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars);
    };

    const updateCartDisplay = () => {
        if (cart.length === 0) {
            if (cartItemsContainer) cartItemsContainer.style.display = 'none';
            if (cartSummary) cartSummary.style.display = 'none';
            if (emptyCartMessage) emptyCartMessage.style.display = 'block';
            return;
        }

        if (cartItemsContainer) cartItemsContainer.style.display = 'block';
        if (cartSummary) cartSummary.style.display = 'block';
        if (emptyCartMessage) emptyCartMessage.style.display = 'none';

        renderCartItems();
        updateCartSummary();
    };

    const renderCartItems = () => {
        if (!cartItemsContainer) return;

        const cartItemsHTML = cart.map(item => {
            const book = allBooks.find(b => b.id === item.id);
            if (!book) return '';

            return `
                <div class="cart-item" data-id="${item.id}">
                    <div class="row align-items-center">
                        <div class="col-md-2">
                            <img src="${book.image}" alt="${book.title}" class="cart-item-img">
                        </div>
                        <div class="col-md-4">
                            <h5 class="cart-item-title">${book.title}</h5>
                            <p class="cart-item-author">by ${book.author}</p>
                            <div class="book-rating">
                                <span class="rating-stars">${getStarRating(book.rating)}</span>
                                <span class="rating-text">(${book.reviews} reviews)</span>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <p class="cart-item-price">₹${book.price}</p>
                        </div>
                        <div class="col-md-2">
                            <div class="quantity-controls">
                                <button class="btn btn-sm btn-outline-secondary quantity-btn" data-action="decrease">-</button>
                                <span class="quantity-display">${item.quantity}</span>
                                <button class="btn btn-sm btn-outline-secondary quantity-btn" data-action="increase">+</button>
                            </div>
                        </div>
                        <div class="col-md-1">
                            <p class="cart-item-total">₹${book.price * item.quantity}</p>
                        </div>
                        <div class="col-md-1">
                            <button class="btn btn-sm btn-outline-danger remove-item-btn">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        cartItemsContainer.innerHTML = cartItemsHTML;
    };

    const updateCartSummary = () => {
        if (!cartSummary) return;

        const subtotal = cart.reduce((sum, item) => {
            const book = allBooks.find(b => b.id === item.id);
            return sum + (book ? book.price * item.quantity : 0);
        }, 0);

        const shipping = subtotal > 500 ? 0 : 50;
        const total = subtotal + shipping;

        cartSummary.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Order Summary</h5>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Subtotal:</span>
                        <span>₹${subtotal}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Shipping:</span>
                        <span>${shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                    </div>
                    <hr>
                    <div class="d-flex justify-content-between mb-3">
                        <strong>Total:</strong>
                        <strong class="text-primary">₹${total}</strong>
                    </div>
                    <button class="btn btn-primary w-100" id="checkout-btn">
                        <i class="fas fa-credit-card me-2"></i>Proceed to Checkout
                    </button>
                    <button class="btn btn-outline-secondary w-100 mt-2" id="continue-shopping-btn">
                        <i class="fas fa-arrow-left me-2"></i>Continue Shopping
                    </button>
                </div>
            </div>
        `;
    };

    const updateQuantity = (itemId, action) => {
        const item = cart.find(item => item.id === itemId);
        if (!item) return;

        if (action === 'increase') {
            item.quantity++;
        } else if (action === 'decrease') {
            item.quantity--;
            if (item.quantity <= 0) {
                removeFromCart(itemId);
                return;
            }
        }

        saveToStorage('cart', cart);
        updateCartDisplay();
    };

    const removeFromCart = (itemId) => {
        cart = cart.filter(item => item.id !== itemId);
        saveToStorage('cart', cart);
        updateCartDisplay();
        
        // Show toast notification
        showToast('Item removed from cart', 'info');
    };

    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
            ${message}
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    };

    // Event Listeners
    document.body.addEventListener('click', (e) => {
        const cartItem = e.target.closest('.cart-item');
        if (!cartItem) return;

        const itemId = parseInt(cartItem.dataset.id);

        if (e.target.classList.contains('quantity-btn')) {
            const action = e.target.dataset.action;
            updateQuantity(itemId, action);
        }

        if (e.target.classList.contains('remove-item-btn') || e.target.closest('.remove-item-btn')) {
            removeFromCart(itemId);
        }
    });

    // Checkout button
    document.body.addEventListener('click', (e) => {
        if (e.target.id === 'checkout-btn') {
            showToast('Checkout functionality coming soon!', 'info');
        }
        
        if (e.target.id === 'continue-shopping-btn') {
            window.location.href = 'shop.html';
        }
    });

    // Initialize
    updateCartDisplay();
}); 