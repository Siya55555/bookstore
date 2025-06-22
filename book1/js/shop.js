document.addEventListener('DOMContentLoaded', () => {
    // This script will be specific to the shop page functionality.

    // --- Product Data (could be fetched from an API in a real application) ---
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

    const shopGrid = document.getElementById('shop-grid');
    const authorFilter = document.getElementById('author-filter');
    const priceFilter = document.getElementById('price-filter');
    const priceValue = document.getElementById('price-value');
    const sortFilter = document.getElementById('sort-filter');
    const resultsCount = document.getElementById('results-count');
    const clearFiltersBtn = document.getElementById('clear-filters');

    let currentFilters = {
        category: 'all',
        author: 'all',
        maxPrice: 500,
        minRating: 0,
        sortBy: 'default'
    };

    // --- Render Functions ---
    const renderBooks = (books) => {
        if (!shopGrid) return;
        
        if (books.length === 0) {
            shopGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h4>No books found</h4>
                    <p class="text-muted">Try adjusting your filters or search criteria.</p>
                </div>
            `;
            return;
        }

        shopGrid.innerHTML = books.map(book => `
            <div class="col-lg-4 col-md-6 col-sm-6 mb-4">
                <div class="book-card" data-id="${book.id}">
                    <a href="book.html?id=${book.id}" class="book-card-link">
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

    const populateAuthors = () => {
        if (!authorFilter) return;
        const authors = [...new Set(allBooks.map(book => book.author))];
        authors.forEach(author => {
            const option = document.createElement('option');
            option.value = author;
            option.textContent = author;
            authorFilter.appendChild(option);
        });
    };

    // --- Filtering and Sorting Logic ---
    const applyFilters = () => {
        let filteredBooks = [...allBooks];

        // Filter by category
        if (currentFilters.category !== 'all') {
            filteredBooks = filteredBooks.filter(book => book.category === currentFilters.category);
        }

        // Filter by author
        if (currentFilters.author !== 'all') {
            filteredBooks = filteredBooks.filter(book => book.author === currentFilters.author);
        }

        // Filter by price
        filteredBooks = filteredBooks.filter(book => book.price <= currentFilters.maxPrice);

        // Filter by rating
        if (currentFilters.minRating > 0) {
            filteredBooks = filteredBooks.filter(book => book.rating >= currentFilters.minRating);
        }

        // Sort books
        switch (currentFilters.sortBy) {
            case 'price-asc':
                filteredBooks.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filteredBooks.sort((a, b) => b.price - a.price);
                break;
            case 'title-asc':
                filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'title-desc':
                filteredBooks.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'rating-desc':
                filteredBooks.sort((a, b) => b.rating - a.rating);
                break;
        }

        // Update results count
        if (resultsCount) {
            resultsCount.textContent = filteredBooks.length;
        }

        renderBooks(filteredBooks);
    };

    const clearAllFilters = () => {
        // Reset radio buttons
        document.querySelectorAll('input[name="category"]').forEach(radio => {
            radio.checked = radio.value === 'all';
        });
        document.querySelectorAll('input[name="rating"]').forEach(radio => {
            radio.checked = radio.value === 'all';
        });

        // Reset selects
        if (authorFilter) authorFilter.value = 'all';
        if (sortFilter) sortFilter.value = 'default';

        // Reset price range
        if (priceFilter) {
            priceFilter.value = 500;
            if (priceValue) priceValue.textContent = '₹500';
        }

        // Reset filters object
        currentFilters = {
            category: 'all',
            author: 'all',
            maxPrice: 500,
            minRating: 0,
            sortBy: 'default'
        };

        applyFilters();
    };

    // --- Event Listeners ---

    // Category filter
    document.querySelectorAll('input[name="category"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentFilters.category = e.target.value;
            applyFilters();
        });
    });

    // Author filter
    if (authorFilter) {
        authorFilter.addEventListener('change', (e) => {
            currentFilters.author = e.target.value;
            applyFilters();
        });
    }

    // Price filter
    if (priceFilter) {
        priceFilter.addEventListener('input', (e) => {
            currentFilters.maxPrice = parseInt(e.target.value);
            if (priceValue) priceValue.textContent = `₹${currentFilters.maxPrice}`;
            applyFilters();
        });
    }

    // Rating filter
    document.querySelectorAll('input[name="rating"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentFilters.minRating = parseInt(e.target.value) || 0;
            applyFilters();
        });
    });

    // Sort filter
    if (sortFilter) {
        sortFilter.addEventListener('change', (e) => {
            currentFilters.sortBy = e.target.value;
            applyFilters();
        });
    }

    // Clear filters
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }

    // --- Initializations ---
    populateAuthors();
    applyFilters(); // Initial render of all books
}); 