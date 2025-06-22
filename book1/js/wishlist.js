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

    const wishlistContainer = document.getElementById('wishlist-container');
    const emptyWishlistMessage = document.getElementById('empty-wishlist-message');

    const getFromStorage = (key) => JSON.parse(localStorage.getItem(key)) || [];
    const saveToStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));

    let wishlist = getFromStorage('wishlist');

    const getStarRating = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars);
    };

    const updateWishlistDisplay = () => {
        if (wishlist.length === 0) {
            if (wishlistContainer) wishlistContainer.style.display = 'none';
            if (emptyWishlistMessage) emptyWishlistMessage.style.display = 'block';
            return;
        }

        if (wishlistContainer) wishlistContainer.style.display = 'block';
        if (emptyWishlistMessage) emptyWishlistMessage.style.display = 'none';

        renderWishlistItems();
    };

    const renderWishlistItems = () => {
        if (!wishlistContainer) return;

        const wishlistHTML = wishlist.map(bookId => {
            const book = allBooks.find(b => b.id === bookId);
            if (!book) return '';

            return `
                <div class="wishlist-item" data-id="${book.id}">
                    <div class="row align-items-center">
                        <div class="col-md-2">
                            <img src="${book.image}" alt="${book.title}" class="wishlist-item-img">
                        </div>
                        <div class="col-md-4">
                            <h5 class="wishlist-item-title">${book.title}</h5>
                            <p class="wishlist-item-author">by ${book.author}</p>
                            <div class="book-rating">
                                <span class="rating-stars">${getStarRating(book.rating)}</span>
                                <span class="rating-text">(${book.reviews} reviews)</span>
                            </div>
                            <small class="text-muted">
                                <i class="fas fa-tag me-1"></i>${book.category.charAt(0).toUpperCase() + book.category.slice(1)}
                            </small>
                        </div>
                        <div class="col-md-2">
                            <p class="wishlist-item-price">₹${book.price}</p>
                        </div>
                        <div class="col-md-4">
                            <div class="wishlist-actions">
                                <button class="btn btn-primary btn-sm move-to-cart-btn">
                                    <i class="fas fa-shopping-cart me-1"></i>Move to Cart
                                </button>
                                <button class="btn btn-outline-danger btn-sm remove-from-wishlist-btn">
                                    <i class="fas fa-trash me-1"></i>Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        wishlistContainer.innerHTML = wishlistHTML;
    };

    const moveToCart = (bookId) => {
        // Remove from wishlist
        wishlist = wishlist.filter(id => id !== bookId);
        saveToStorage('wishlist', wishlist);

        // Add to cart
        let cart = getFromStorage('cart');
        const existingItem = cart.find(item => item.id === bookId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id: bookId, quantity: 1 });
        }
        saveToStorage('cart', cart);

        updateWishlistDisplay();
        showToast('Book moved to cart! 🛒', 'success');
    };

    const removeFromWishlist = (bookId) => {
        wishlist = wishlist.filter(id => id !== bookId);
        saveToStorage('wishlist', wishlist);
        updateWishlistDisplay();
        showToast('Removed from wishlist 💔', 'info');
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
        const wishlistItem = e.target.closest('.wishlist-item');
        if (!wishlistItem) return;

        const bookId = parseInt(wishlistItem.dataset.id);

        if (e.target.classList.contains('move-to-cart-btn') || e.target.closest('.move-to-cart-btn')) {
            moveToCart(bookId);
        }

        if (e.target.classList.contains('remove-from-wishlist-btn') || e.target.closest('.remove-from-wishlist-btn')) {
            removeFromWishlist(bookId);
        }
    });

    // Continue shopping button
    document.body.addEventListener('click', (e) => {
        if (e.target.id === 'continue-shopping-btn') {
            window.location.href = 'shop.html';
        }
    });

    // Initialize
    updateWishlistDisplay();
}); 