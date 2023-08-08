const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        ref: 'User',
        required: true
    }
}, { timestamps: true })

const Review = mongoose.model('Review', ReviewSchema)

const ProductSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    desc: { type: String, required: true, },
    img: { type: String, required: true },
    categories: { type: Array },
    size: { type: Array },
    color: { type: Array },
    price: { type: Number, required: true },
    inStock: { type: Boolean, default: true },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, { timestamps: true })

const Product = mongoose.model('Product', ProductSchema)

module.exports = {
    Product,
    Review
}
