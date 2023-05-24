const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  contact: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    unique: true,
  },

  wallet: {
    type: Number,
    default: 0
},
  dob:{
    type: Date,
  },
  address:{
    type:[
        {
            type : mongoose.Types.ObjectId,
        }
    ],
    ref: 'Addresses',
    default:[]
  },
  
  createdAt: {
    type: Date,
    default: new Date()
},
  status: {
    type: Boolean,
    required: true,
  },
});
UserSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(this.password, salt);
    this.password = hashPassword;
    next();
  } catch (error) {
    next(error);
  }
});


//const bcrypt = require('bcrypt');



const User = mongoose.model("User", UserSchema);

module.exports = User;
