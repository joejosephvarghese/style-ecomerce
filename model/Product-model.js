const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
  name:{
    type: String,
    require: true
  },
  description: {
    type: String,
  },
  category: {
    type: String,
    require: true
  },
  price:{
    type: Number,
    require: true
  },

  stock:{
    type: Number,
    require: true
  },
  
  status:{
    type: Boolean,
    default: true
  },
   images:{
    type:Object,
    require:true
   },
  createdAt:{
    type:Date,
    default:Date.now()
  }
})

const Product = mongoose.model('product', productSchema);

module.exports = Product