class BookstoreCart {
    constructor() {
        this.cartItems = this.loadCartFromStorage();
        this.books = []; // Will be loaded from database
        this.initializeCart();
    }

    // Load cart from localStorage
    loadCartFromStorage() {
        const saved = localStorage.getItem('bookstore_cart');
        return saved ? JSON.parse(saved) : [];
    }

    // Save cart to localStorage
    saveCartToStorage() {
        localStorage.setItem('bookstore_cart', JSON.stringify(this.cartItems));
    }

    // Initialize cart on page load
    async initializeCart() {
        await this.loadBooksFromDatabase();
        this.updateCartCount();
        this.updateCartTotal();
    }

    // Load books from database - UPDATED FOR MONGODB BACKEND
    async loadBooksFromDatabase() {
        try {
            const response = await fetch('http://localhost:5000/api/books');
            const books = await response.json();
            this.books = books;
            console.log('Books loaded from MongoDB:', books);
        } catch (error) {
            console.error('Error loading books:', error);
            // Fallback to hardcoded books if API fails
            this.books = [
                {
                    book_id: 1,
                    title: 'Jannat Kai Pattay',
                    author: 'Namrah Ahmed',
                    price: 1200.00,
                    cover_image_url: 'https://zanjabeelbookstore.com/cdn/shop/files/WhatsAppImage2025-04-16at19.36.34_720x.jpg?v=1744874103',
                    stock_quantity: 10
                },
                {
                    book_id: 2,
                    title: 'Mala',
                    author: 'Nimra Ahmed',
                    price: 1500.00,
                    cover_image_url: 'https://zanjabeelbookstore.com/cdn/shop/files/KHA00445_de16d2e2-622b-4846-ad84-37f1e444fe8f_720x.jpg?v=1737531798',
                    stock_quantity: 10
                }
            ];
        }
    }

    addToCart(bookId, quantity = 1) {
        const book = this.books.find(b => b.book_id === bookId);
        if (!book) {
            alert('Book not found!');
            return false;
        }

        // Check stock
        if (book.stock_quantity < quantity) {
            alert('Insufficient stock!');
            return false;
        }

        const existingItem = this.cartItems.find(item => item.book_id === bookId);
        
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > book.stock_quantity) {
                alert('Cannot add more items than available stock!');
                return false;
            }
            existingItem.quantity = newQuantity;
        } else {
            this.cartItems.push({
                book_id: bookId,
                title: book.title,
                author: book.author,
                price: book.price,
                quantity: quantity,
                cover_image_url: book.cover_image_url,
                added_at: new Date().toISOString()
            });
        }

        this.saveCartToStorage();
        this.updateCartCount();
        this.updateCartTotal();

        return true;
    }

    // Update item quantity
    updateQuantity(bookId, change) {
        const item = this.cartItems.find(item => item.book_id === bookId);
        const book = this.books.find(b => b.book_id === bookId);
        
        if (item && book) {
            const newQuantity = item.quantity + change;
            
            if (newQuantity <= 0) {
                this.removeItem(bookId);
                return;
            }
            
            if (newQuantity > book.stock_quantity) {
                alert('Cannot exceed available stock!');
                return;
            }
            
            item.quantity = newQuantity;
            this.saveCartToStorage();
            this.renderCartItems();
            this.updateCartCount();
        }
    }

    // Remove item from cart
    removeItem(bookId) {
        this.cartItems = this.cartItems.filter(item => item.book_id !== bookId);
        this.saveCartToStorage();
        this.renderCartItems();
        this.updateCartCount();
    }

    // Get item quantity
    getItemQuantity(bookId) {
        const item = this.cartItems.find(item => item.book_id === bookId);
        return item ? item.quantity : 0;
    }

    // Clear entire cart
    clearCart() {
        this.cartItems = [];
        this.saveCartToStorage();
        this.renderCartItems();
        this.updateCartCount();
    }

    // Render cart items in sidebar
    renderCartItems() {
        const cartContent = document.getElementById('cartContent');
        
        if (this.cartItems.length === 0) {
            cartContent.innerHTML = `
                <div class="cart-empty">
                    <i class="fa-solid fa-cart-shopping"></i>
                    <p>Your cart is empty</p>
                </div>
            `;
            this.updateCartTotal();
            return;
        }

        let html = '';
        this.cartItems.forEach(item => {
            html += `
                <div class="cart-item">
                    <div class="item-image" style="background-image: url('${item.cover_image_url}'); background-size: cover; background-position: center;">
                    </div>
                    <div class="item-details">
                        <div class="item-name">${item.title}</div>
                        <div class="item-author" style="font-size: 12px; color: #888;">by ${item.author}</div>
                        <div class="item-price">Rs${item.price.toFixed(2)}</div>
                        <div class="quantity-controls">
                            <button class="qty-btn" onclick="cart.updateQuantity(${item.book_id}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" onclick="cart.updateQuantity(${item.book_id}, 1)">+</button>
                            <button class="qty-btn" onclick="cart.removeItem(${item.book_id})" style="margin-left: 10px; color: red;">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        cartContent.innerHTML = html;
        this.updateCartTotal();
    }

    // Update cart count badge
    updateCartCount() {
        const count = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('count').textContent = count;
    }

    // Update cart total
    updateCartTotal() {
        const total = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        document.getElementById('cartTotal').textContent = `Rs${total.toFixed(2)}`;
    }

    // CHECKOUT METHOD - UPDATED FOR MONGODB BACKEND
    async checkout() {
        if (this.cartItems.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        // Get customer details
        const customerName = prompt('Please enter your name:');
        const customerEmail = prompt('Please enter your email:');
        
        if (!customerName || !customerEmail) {
            alert('Name and email are required for checkout');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerEmail)) {
            alert('Please enter a valid email address');
            return;
        }

        try {
            // Prepare order data for MongoDB backend
            const orderData = {
                customerName: customerName.trim(),
                customerEmail: customerEmail.trim().toLowerCase(),
                cartItems: this.cartItems.map(item => ({
                    book_id: item.book_id,
                    quantity: item.quantity
                }))
            };

            console.log('Sending checkout data:', orderData);

            const response = await fetch('http://localhost:5000/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();
            
            if (response.ok) {
                alert(`Order placed successfully!\n\nOrder ID: ${result.orderId}\nTotal: Rs${result.order.totalAmount}\n\nThank you for your purchase!`);
                this.clearCart();
                closeCart();
                
                // Optionally reload books to get updated stock
                await this.loadBooksFromDatabase();
            } else {
                alert('Error placing order: ' + result.error);
                console.error('Checkout error:', result);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Error processing checkout. Please try again.');
        }
    }
}

// Initialize cart system
const cart = new BookstoreCart();

// EXISTING FUNCTIONS - UNCHANGED

// Open cart sidebar
function openCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.querySelector('.cart-overlay');
    
    sidebar.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    cart.renderCartItems();
}

// Close cart sidebar
function closeCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.querySelector('.cart-overlay');
    
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Updated openView function
let currentBook = {};

function openView(title, imageSrc, price, author, description) {
    // Find the book in our database
    const book = cart.books.find(b => b.title === title);
    if (book) {
        currentBook = book;
    } else {
        // Fallback for hardcoded data
        currentBook = { 
            book_id: title === 'Jannat Kai Pattay' ? 1 : 2,
            title, 
            cover_image_url: imageSrc, 
            price: parseFloat(price.replace('Rs ', '').replace(',', '')), 
            author 
        };
    }
    
    // Update modal content
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalAuthor').textContent = `بذریعہ:${author}`;
    document.getElementById('modalPrice').textContent = price;
    document.getElementById('modalDescription').textContent = description;
    document.getElementById('modalBookImage').src = imageSrc;
    
    // Show modal
    const modal = document.getElementById('bookModal');
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    document.body.style.overflow = 'hidden';
}

// Updated addToCart function for modal
function addToCart() {
    const success = cart.addToCart(currentBook.book_id, 1);
    if (success) {
        alert(`"${currentBook.title}" added to cart!`);
        closeModal();
    }
}

// Updated checkout function
function checkout() {
    cart.checkout();
}

// Close modal function
function closeModal(event) {
    if (event && event.target !== event.currentTarget && !event.target.classList.contains('close-btn')) {
        return;
    }
    
    const modal = document.getElementById('bookModal');
    modal.classList.remove('active');
    
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
}

// Close cart/modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeCart();
        closeModal();
    }
});

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Bookstore cart system initialized with MongoDB backend');
});