
const mongoose = require('mongoose');


const wishListSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    wishList: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product'
            },

            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
})

const Wishlist = mongoose.model('wishlist', wishListSchema);

module.exports =  Wishlist