const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Import Models
const Book = require('./models/Book');
const Order = require('./models/Order');

// Routes

// Get all books
app.get('/api/books', async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

// Get single book
app.get('/api/books/:id', async (req, res) => {
    try {
        const book = await Book.findOne({ book_id: parseInt(req.params.id) });
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json(book);
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ error: 'Failed to fetch book' });
    }
});

// Checkout - Create Order
app.post('/api/checkout', async (req, res) => {
    try {
        const { customerName, customerEmail, cartItems } = req.body;

        // Validate required fields
        if (!customerName || !customerEmail || !cartItems || cartItems.length === 0) {
            return res.status(400).json({ 
                error: 'Missing required fields: customerName, customerEmail, or cartItems' 
            });
        }

        // Calculate total and validate stock
        let totalAmount = 0;
        const orderItems = [];

        for (const item of cartItems) {
            const book = await Book.findOne({ book_id: item.book_id });
            
            if (!book) {
                return res.status(404).json({ 
                    error: `Book with ID ${item.book_id} not found` 
                });
            }

            if (book.stock_quantity < item.quantity) {
                return res.status(400).json({ 
                    error: `Insufficient stock for ${book.title}. Available: ${book.stock_quantity}` 
                });
            }

            const itemTotal = book.price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                book_id: book.book_id,
                title: book.title,
                author: book.author,
                price: book.price,
                quantity: item.quantity,
                subtotal: itemTotal
            });
        }

        // Create order
        const order = new Order({
            customerName,
            customerEmail,
            items: orderItems,
            totalAmount,
            orderDate: new Date(),
            status: 'pending'
        });

        const savedOrder = await order.save();

        // Update stock quantities
        for (const item of cartItems) {
            await Book.updateOne(
                { book_id: item.book_id },
                { $inc: { stock_quantity: -item.quantity } }
            );
        }

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            orderId: savedOrder._id,
            order: savedOrder
        });

    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ 
            error: 'Failed to process checkout',
            details: error.message 
        });
    }
});

// Get order by ID
app.get('/api/orders/:orderId', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// Initialize database with sample books
app.post('/api/init-books', async (req, res) => {
    try {
        // Check if books already exist
        const existingBooks = await Book.find();
        if (existingBooks.length > 0) {
            return res.json({ message: 'Books already initialized' });
        }

        // Sample books
        const sampleBooks = [
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

        await Book.insertMany(sampleBooks);
        res.json({ message: 'Sample books initialized successfully' });
    } catch (error) {
        console.error('Error initializing books:', error);
        res.status(500).json({ error: 'Failed to initialize books' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Bookstore API is running',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 Bookstore API ready at http://localhost:${PORT}`);
});