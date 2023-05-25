const admins = require("../model/admin-model");
const bcrypt = require("bcrypt");
const users = require("../model/user-model");
const Category = require("../model/catagory-model");
const products = require("../model/Product-model");
const ORDER = require("../model/ordermodel");
const order = require("../model/ordermodel");
const Banner = require("../model/Bannermodel");

module.exports = {
  addAdmin: (admin) => {
    return new Promise(async (resolve, reject) => {
      let admindetails = new admins({
        email: admin.email,
        contact: admin.phone,
        password: admin.password,
        status: true,
      });
      admindetails.save();
      resolve();
    });
  },

  Blockuser: (Blockid) => {
    return new Promise(async (resolve, reject) => {
      const user = await users.updateOne(
        { _id: Blockid },
        { $set: { status: false } }
      );
      if (user) {
        resolve(user);
      } else {
        resolve();
      }
    });
  },
  Unblockuser: (Unblockid) => {
    return new Promise(async (resolve, reject) => {
      const user = await users.updateOne(
        { _id: Unblockid },
        { $set: { status: true } }
      );
      if (user) {
        resolve(user);
      } else {
        resolve();
      }
    });
  },

  getadmin: function (email, password) {
    console.log("pass", email);
    try {
      return new Promise(async (resolve, reject) => {
        const admin = await admins.findOne({ email: email });
     
        if (admin) {
          bcrypt.compare(password, admin.password, (err, result) => {
            if (result) {
         
              resolve(admin);
            } else {
              resolve(false);
            }
          });
        } else {
          resolve(false);
        }
      });
    } catch (err) {
      console.error(err);
      throw new Error("Server error");
    }
  },
  getUserList: (userId) => {
    try {
      return new Promise((resolve, reject) => {
        users.findOne({ _id: userId }).then((user) => {
          if (user) {
            resolve(user);
          } else {
            console.log("User not found");
          }
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  DocumentCount: () => {
    return new Promise(async (resolve, reject) => {
      await products
        .find()
        .countDocuments()
        .then((documents) => {
          resolve(documents);
        });
    });
  },

  DocumentCounts: () => {
    console.log("document count");
    return new Promise(async (resolve, reject) => {
      try {
        const orders = await ORDER.aggregate([
          { $unwind: "$orders" },
          { $group: { _id: null, count: { $sum: 1 } } },
        ]);

        if (orders[0] && orders[0].count) {
          resolve(orders[0].count);
        } else {
          reject("No documents found.");
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  deliverGraph: () => {
    return new Promise(async (resolve, reject) => {
      let result = await users.aggregate([
        {
          $match: {
            status: true,
          },
        },
        {
          $group: {
            _id: {
              $month: "$createdAt",
            },
            count: {
              $sum: 1,
            },
          },
        },
      ]);
      console.log("graphhhhhhhh", result);
      resolve(result);
    });
  },
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      await products.find().then((response) => {
        resolve(response);
      });
    });
  },

  getCodCount: () => {
    return new Promise(async (resolve, reject) => {
      let response = await ORDER.aggregate([
        {
          $unwind: "$orders",
        },
        {
          $match: {
            "orders.paymentMethod": "cod",
          },
        },
      ]);
      resolve(response);
    });
  },
  getOnlineCount: () => {
    return new Promise(async (resolve, reject) => {
      let response = await ORDER.aggregate([
        {
          $unwind: "$orders",
        },
        {
          $match: {
            "orders.paymentMethod": "razorpay",
          },
        },
      ]);
      resolve(response);
    });
  },
  getSalesReport: async () => {
    return new Promise(async (resolve, reject) => {
      let response = await ORDER.aggregate([
        {
          $unwind: "$orders",
        },
      ]);
      resolve(response);
    });
  },
  addBanner: (texts, Image) => {
    return new Promise(async (resolve, reject) => {
      let banner = Banner({
        title: texts.title,
        description: texts.description,
        image: Image,
      });
      await banner.save().then((response) => {
        resolve(response);
      });
    });
  },

  postReport: (date) => {
    
    try {
      let start = new Date(date.startdate);
      let end = new Date(date.enddate);
      return new Promise((resolve, reject) => {
        ORDER.aggregate([
          {
            $unwind: "$orders",
          },
          {
            $match: {
              $and: [
                { "orders.orderConfirm": "delivered" },
                { "orders.createdAt": { $gte: start, $lte: end } },
              ],
            },
          },
        ])
          .exec()
          .then((response) => {
            console.log(response, "response---");
            resolve(response);
          });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  getBannerList: () => {
    return new Promise((resolve, reject) => {
      Banner.find().then((banner) => {
        resolve(banner);
      });
    });
  },

  deleteBanner: (bannerId) => {
    return new Promise((resolve, reject) => {
      Banner.deleteOne({ _id: bannerId }).then(() => {
        resolve();
      });
    });
  },
};
