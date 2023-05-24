const mongoose= require("mongoose");
const bcrypt=require("bcrypt")

 const adminSchema = new mongoose.Schema({
    
    
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


 })
 adminSchema.pre("save", async function (next) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(this.password, salt);
      this.password = hashPassword;
      next();
    } catch (error) {
      next(error);
    }
  });

  const adminpanel = mongoose.model("adminpanel", adminSchema);

  module.exports = adminpanel;
  