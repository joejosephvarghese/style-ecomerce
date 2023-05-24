
const mongoose = require('mongoose')
const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },

    orders: [
        {
            fname: { type: String },
            lname: { type: String },
            phone: { type: Number },
            paymentMethod: { type: String },
            paymentStatus: { type: String },
            totalPrice: { type: Number },
            totalQuantity: { type: Number },
            productDetails: { type: Array },
            shippingAddress: { type: Object },
            paymentMethod: String,
            hashedId:String,
            status: {
                type: Boolean,
                default: true
            },
            paymentType: String,
            createdAt: {
                type: Date,
                default: new Date()
            },
            orderConfirm: { type: String, default: "ordered" }
        }
    ]
})

const order = mongoose.model('order', orderSchema);

module.exports = order