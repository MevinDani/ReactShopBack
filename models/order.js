const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    customerId: { type: String },
    paymentInentId: { type: String },
    products: [
        {
            id: { type: String },
            title: { type: String },
            desc: { type: String },
            img: { type: String },
            color: { type: String },
            size: { type: String },
            price: { type: String },
            quantity: { type: Number },
        }
    ],
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    shipping: { type: Object, required: true },
    delivery_status: { type: String, default: 'pending' },
    payment_status: { type: String, required: true },
}, { timestamps: true })

module.exports = mongoose.model('Order', OrderSchema)