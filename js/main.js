document.addEventListener('DOMContentLoaded', () => {

    // --- Sample Product Data ---
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

    // --- Core Functions for localStorage ---
    const getFromStorage = (key) => JSON.parse(localStorage.getItem(key)) || [];
    const saveToStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));

    let cart = getFromStorage('cart');
    let wishlist = getFromStorage('wishlist');

    // --- Toast Notification System ---
    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
            ${message}
        `;
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    };

    // --- UI Update Functions ---
    const updateCartCount = () => {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        }
    };

    const updateWishlistCount = () => {
        const wishlistCount = document.getElementById('wishlist-count');
        if (wishlistCount) {
            wishlistCount.textContent = wishlist.length;
        }
    };
    
    // --- Render Featured Books ---
    const renderFeaturedBooks = () => {
        const featuredGrid = document.getElementById('featured-books-grid');
        if (!featuredGrid) return;
        
        // Using first 4 books as featured
        const featuredBooks = allBooks.slice(0, 4); 

        featuredGrid.innerHTML = featuredBooks.map(book => `
            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <div class="book-card" data-id="${book.id}">
                    <a href="book.html?id=${book.id}">
                        <img src="${book.image}" alt="${book.title}" class="book-card-img">
                        <div class="book-card-body">
                            <h5 class="book-card-title">${book.title}</h5>
                            <p class="book-card-author">by ${book.author}</p>
                            <div class="book-rating">
                                <span class="rating-stars">${getStarRating(book.rating)}</span>
                                <span class="rating-text">(${book.reviews} reviews)</span>
                            </div>
                            <p class="book-card-price">₹${book.price}</p>
                        </div>
                    </a>
                    <div class="book-card-actions">
                        <button class="btn btn-primary btn-sm add-to-cart-btn">Add to Cart</button>
                        <button class="btn btn-outline-danger btn-sm add-to-wishlist-btn">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    };

    const getStarRating = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars);
    };

    // --- Event Listeners ---

    // Add to Cart / Wishlist
    document.body.addEventListener('click', (e) => {
        const bookCard = e.target.closest('.book-card');
        if (!bookCard) return;

        const bookId = parseInt(bookCard.dataset.id);

        if (e.target.classList.contains('add-to-cart-btn')) {
            addToCart(bookId);
        }
        if (e.target.classList.contains('add-to-wishlist-btn') || e.target.closest('.add-to-wishlist-btn')) {
            toggleWishlist(bookId, e.target.closest('.add-to-wishlist-btn').querySelector('i'));
        }
    });

    const addToCart = (bookId) => {
        const existingItem = cart.find(item => item.id === bookId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id: bookId, quantity: 1 });
        }
        saveToStorage('cart', cart);
        updateCartCount();
        showToast('Book added to cart! 🛒', 'success');
    };

    const toggleWishlist = (bookId, heartIcon) => {
        const index = wishlist.indexOf(bookId);
        if (index > -1) {
            wishlist.splice(index, 1); // Remove from wishlist
            if(heartIcon) heartIcon.classList.replace('fas', 'far');
            showToast('Removed from wishlist 💔', 'info');
        } else {
            wishlist.push(bookId); // Add to wishlist
            if(heartIcon) heartIcon.classList.replace('far', 'fas');
            showToast('Added to wishlist! ❤️', 'success');
        }
        saveToStorage('wishlist', wishlist);
        updateWishlistCount();
    };

    // --- Search Functionality ---
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    const performSearch = () => {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) return;

        const results = allBooks.filter(book => 
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query) ||
            book.category.toLowerCase().includes(query)
        );

        if (results.length > 0) {
            // Store search results and redirect to shop page
            sessionStorage.setItem('searchResults', JSON.stringify(results));
            sessionStorage.setItem('searchQuery', query);
            window.location.href = 'shop.html';
        } else {
            showToast('No books found for your search', 'error');
        }
    };

    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    // Back to Top Button
    const backToTopBtn = document.getElementById('back-to-top-btn');
    window.onscroll = () => {
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            backToTopBtn.style.display = "block";
        } else {
            backToTopBtn.style.display = "none";
        }
    };
    backToTopBtn.addEventListener('click', () => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    });

    // Newsletter Popup
    const newsletterPopup = document.getElementById('newsletter-popup');
    const closePopupBtn = document.querySelector('.popup-close-btn');
    
    if (newsletterPopup && !sessionStorage.getItem('popupShown')) {
        setTimeout(() => {
            newsletterPopup.style.display = 'flex';
            sessionStorage.setItem('popupShown', 'true');
        }, 5000); // Show after 5 seconds
    }
    
    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', () => {
            newsletterPopup.style.display = 'none';
        });
    }

    // Newsletter form submission
    const newsletterForm = document.querySelector('#newsletter-popup form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            if (email) {
                showToast('Thank you for subscribing! 📧', 'success');
                newsletterForm.reset();
                newsletterPopup.style.display = 'none';
            }
        });
    }

    // Search Bar Toggle
    const searchIcon = document.querySelector('.search-icon');
    const searchBar = document.querySelector('.search-bar-container');
    if (searchIcon && searchBar) {
        searchIcon.addEventListener('click', (e) => {
            e.preventDefault();
            searchBar.style.display = searchBar.style.display === 'none' ? 'block' : 'none';
            if (searchBar.style.display === 'block') {
                searchInput.focus();
            }
        });
    }

    // --- Scroll Animations ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // --- Initializations ---
    renderFeaturedBooks();
    updateCartCount();
    updateWishlistCount();

    // Check for search results on shop page
    if (window.location.pathname.includes('shop.html')) {
        const searchResults = sessionStorage.getItem('searchResults');
        const searchQuery = sessionStorage.getItem('searchQuery');
        
        if (searchResults && searchQuery) {
            // Clear the stored search data
            sessionStorage.removeItem('searchResults');
            sessionStorage.removeItem('searchQuery');
            
            // Show search results notification
            setTimeout(() => {
                showToast(`Showing results for "${searchQuery}"`, 'info');
            }, 1000);
        }
    }
}); 