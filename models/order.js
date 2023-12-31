const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    customerId: { type: String },
    paymentInentId: { type: String },
    products: [],
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    shipping: { type: Object, required: true },
    delivery_status: { type: String, default: 'pending' },
    payment_status: { type: String, required: true },
}, { timestamps: true })

const Order = mongoose.model('Order', OrderSchema)

module.exports = {
    Order
}