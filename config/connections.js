const mongoose = require("mongoose");
const dbPass = process.env.DB_PASS;
mongoose.set("strictQuery", false);
const dbConnect = () => {
  try {
    mongoose.connect(`mongodb+srv://joejosephvarghese94:mg7tJ54WjsNPK22F@cluster0.rcescxu.mongodb.net/`, {
      useNewUrlParser: true,

      useUnifiedTopology: true,
    });
    console.log("database connected"); 
  } catch (error) {
    console.log("database error");
  }
};

module.exports = dbConnect;
