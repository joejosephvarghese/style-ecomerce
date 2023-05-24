const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name:{
    type: String,
    require: true,
    unique: true
  },
  descripton:{
    type: String,
  },
  parent:{
    type: String,
  },
  child:[
    {
      type: mongoose.Types.ObjectId
    }
  ],
  status: {
    type: Boolean,
    default: true
  },
  createdAt:{
    type: Date,
    default: Date.now()
  }
})


const Category = mongoose.model('category', categorySchema);

module.exports = Category