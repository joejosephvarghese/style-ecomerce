const mongoose = require('mongoose')

const cartSchema =new mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    
  },
  cartItems: [{
    
                    productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
                    quantity: { type: Number, default: 1 },
                    price: { type: Number },
                },
            ],

        })





const Cart = mongoose.model('cart', cartSchema);

module.exports = Cart




// const cartSchema = new mongoose.Schema({

//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "user"
//     },

//     products: [
//         {
//             productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
//             quantity: { type: Number, default: 1 },
//             price: { type: Number },
//         },
//     ],

