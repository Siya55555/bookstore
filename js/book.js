document.addEventListener('DOMContentLoaded', () => {

    const allBooks = [
        { id: 1, title: 'The Alchemist', author: 'Paulo Coelho', price: 199, image: 'assets/images/books/book1.jpg', category: 'fiction', rating: 4.5, reviews: 1250, description: 'A classic novel about a shepherd boy named Santiago who travels from his homeland in Spain to the Egyptian desert in search of a treasure buried near the Pyramids. Along the way, he learns about the essential wisdom of listening to his heart and following his dreams.' },
        { id: 2, title: 'Sapiens', author: 'Yuval Noah Harari', price: 299, image: 'assets/images/books/book2.jpg', category: 'non-fiction', rating: 4.7, reviews: 890, description: 'A thought-provoking book that explores the history of humankind, from the Stone Age to the present day. Harari challenges everything we thought we knew about being human and offers a fresh perspective on our species.' },
        { id: 3, title: 'To Kill a Mockingbird', author: 'Harper Lee', price: 249, image: 'assets/images/books/book3.jpg', category: 'fiction', rating: 4.8, reviews: 2100, description: 'A powerful story of justice and racial inequality in the American South, told through the eyes of a young girl named Scout Finch. This Pulitzer Prize-winning novel explores themes of racism, justice, and growing up.' },
        { id: 4, title: '1984', author: 'George Orwell', price: 180, image: 'assets/images/books/book4.jpg', category: 'fiction', rating: 4.6, reviews: 1650, description: 'A dystopian novel set in a totalitarian society where Big Brother is always watching. A chilling exploration of surveillance and control, this book remains as relevant today as when it was first published.' },
        { id: 5, title: 'The Power of Habit', author: 'Charles Duhigg', price: 280, image: 'assets/images/books/book5.jpg', category: 'non-fiction', rating: 4.3, reviews: 750, description: 'An engaging book that delves into the science of habit formation, explaining how habits are formed and how they can be changed. Duhigg combines research with real-world examples to show how understanding habits can transform our lives.' },
        { id: 6, title: 'Becoming', author: 'Michelle Obama', price: 350, image: 'assets/images/books/book6.jpg', category: 'biography', rating: 4.9, reviews: 3200, description: 'The inspiring memoir of the former First Lady of the United States, Michelle Obama. A story of resilience, determination, and hope that chronicles her journey from the South Side of Chicago to the White House.' },
        { id: 7, title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', price: 450, image: 'assets/images/books/book7.jpg', category: 'fantasy', rating: 4.8, reviews: 2800, description: 'An epic high-fantasy novel. A hobbit named Frodo Baggins inherits a powerful ring and must embark on a perilous journey to destroy it. This masterpiece of fantasy literature has captivated readers for generations.' },
        { id: 8, title: 'Atomic Habits', author: 'James Clear', price: 260, image: 'assets/images/books/book8.jpg', category: 'non-fiction', rating: 4.4, reviews: 1100, description: 'A practical guide to building good habits and breaking bad ones. Learn how small, incremental changes can lead to remarkable results. Clear provides actionable strategies for transforming your habits and achieving your goals.' }
    ];

    const bookDetailsContainer = document.getElementById('book-details-container');
    const relatedBooksGrid = document.getElementById('related-books-grid');

    const getBookIdFromURL = () => {
        const params = new URLSearchParams(window.location.search);
        return parseInt(params.get('id'));
    };

    const getStarRating = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars);
    };

    const renderBookDetails = (book) => {
        if (!bookDetailsContainer) return;

        document.title = `${book.title} - Bookworld India`;

        bookDetailsContainer.innerHTML = `
            <div class="col-md-5">
                <img src="${book.image}" alt="${book.title}" class="book-details-img">
            </div>
            <div class="col-md-7 book-details-content">
                <h1 class="text-gradient">${book.title}</h1>
                <p class="lead">by ${book.author}</p>
                <div class="book-rating mb-3">
                    <span class="rating-stars">${getStarRating(book.rating)}</span>
                    <span class="rating-text ms-2">${book.rating} (${book.reviews} reviews)</span>
                </div>
                <p class="price">₹${book.price}</p>
                <p class="mb-4">${book.description}</p>
                <div class="d-flex gap-2 mt-4">
                    <button class="btn btn-primary btn-lg add-to-cart-btn" data-id="${book.id}">
                        <i class="fas fa-shopping-cart me-2"></i>Add to Cart
                    </button>
                    <button class="btn btn-outline-danger btn-lg add-to-wishlist-btn" data-id="${book.id}">
                        <i class="far fa-heart"></i> Add to Wishlist
                    </button>
                </div>
                <div class="mt-4">
                    <small class="text-muted">
                        <i class="fas fa-tag me-1"></i>Category: ${book.category.charAt(0).toUpperCase() + book.category.slice(1)}
                    </small>
                </div>
            </div>
        `;
    };

    const renderRelatedBooks = (relatedBooks) => {
        if (!relatedBooksGrid) return;
        relatedBooksGrid.innerHTML = relatedBooks.map(book => `
            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
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
                </div>
            </div>
        `).join('');
    };

    const displayNotFound = () => {
        if (!bookDetailsContainer) return;
        bookDetailsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x text-muted mb-3"></i>
                <h2>Book not found!</h2>
                <p class="text-muted">Sorry, the book you are looking for does not exist.</p>
                <a href="shop.html" class="btn btn-primary">Back to Shop</a>
            </div>
        `;
    };

    // --- Page Initialization ---
    const bookId = getBookIdFromURL();
    const book = allBooks.find(b => b.id === bookId);

    if (book) {
        renderBookDetails(book);
        const related = allBooks.filter(b => b.category === book.category && b.id !== book.id).slice(0, 4);
        renderRelatedBooks(related);
    } else {
        displayNotFound();
    }
}); 