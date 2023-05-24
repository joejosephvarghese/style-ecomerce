const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const dbConnect = () => {
  try {
    mongoose.connect("mongodb://127.0.0.1:27017/Style", {
      useNewUrlParser: true,

      useUnifiedTopology: true,
    });
    console.log("database connected");
  } catch (error) {
    console.log("database error");
  }
};

module.exports = dbConnect;
