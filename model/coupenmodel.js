
// const mongoose = require('mongoose');

// const couponSchema = new mongoose.Schema({
//     couponCode: {
//         type: String
//     },
//     validity: {
//         type: Date,
//         default : new Date
//      },
//      minAmount : { type : Number },
//      minDiscountPercentage : { type : Number },
//      maxDiscountValue : { type : Number},
//      description : { type : String},
//      createdAt : {
//         type : Date,
//         default : new Date
//      },status: {
//         type: Boolean,
//         required: true,
//       },

     
// })

// const Coupon = mongoose.model('coupon', couponSchema);

// module.exports = Coupon


const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    couponCode: {
        type: String
    },
    validity: {
        type: Date,
        default: new Date()
    },
    minAmount: {
        type: Number
    },
    minDiscountPercentage: {
        type: Number
    },
    maxDiscountValue: {
        type: Number
    },
    description: {
        type: String
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    status: {
        type: Boolean,
        required: true
    },
    userId: {
        type: Array,
        default:[]
    }
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;

