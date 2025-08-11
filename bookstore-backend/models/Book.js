const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    book_id: {
        type: Number,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    cover_image_url: {
        type: String,
        required: true
    },
    stock_quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Index for faster queries
bookSchema.index({ book_id: 1 });
bookSchema.index({ title: 1 });

module.exports = mongoose.model('Book', bookSchema);