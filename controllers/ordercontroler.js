const adminhelper = require("../helpers/adminhelper");
const productHelper = require("../helpers/productHelper");
const userhelper = require("../helpers/userhelper");
const Product = require("../model/Product-model");
const Category = require("../model/catagory-model");
const Session = require("../sessions/Session");
const productControl = require("./productControl");
const orderHelpers = require("../helpers/orderhelper");
const Coupon = require("../model/coupenmodel");
const { response } = require("express");
const objectId = require("mongodb").ObjectId;
const wishListHelpers = require("../helpers/wishlisthelper");

module.exports = {
  getAddress: async (req, res) => {
    var count = null;
    let user = req.session.user;
    if (user) {
      const count = await userhelper.getcartcount(user._id);
      const wishlistCount = await wishListHelpers.getWishListCount(user._id);
      let Address = await orderHelpers.getAddress(user._id);
      let orders = await orderHelpers.getOrders(user._id);

      res.render("../views/user/myaccount", {
        Address,
        count,
        orders,
        user,
        wishlistCount,
      });
    }
  },

  /* POST Address Page */
  postAddress: (req, res) => {
    let data = req.body;
    console.log(data);
    let userId = req.session.user._id;
    orderHelpers.postAddress(data, userId).then((response) => {
      response
        ? res
            .status(200)
            .json({ status: true, Message: "Successfully added address" })
        : res
            .status(200)
            .json({ status: false, Message: "Failed to add address" });
    });
  },
  //get checkout
  getcheckoutpage: async (req, res) => {
    var count = null;
    let user = req.session.user;
    if (user) {
      const wishlistCount = await wishListHelpers.getWishListCount(user._id);
      const coupons = await Coupon.find({ status: true });
      var count = await userhelper.getCartCount(user._id);
      let Address = await orderHelpers.getAddress(user._id);
      let orders = await userhelper.getCartItems(user._id);
      let total = await userhelper.totalCheckOutAmount(user._id);

      console.log("hahaaaaaaaaaaaaaaaa", coupons);

      res.render("../views/user/checkoutpage", {
        user,
        count,
        Address,
        total,
        orders,
        coupons,
        wishlistCount,
      });
    }
  },

  //post checkout
  postCheckOut: async (req, res) => {
    let userId = req.session.user._id;

    try {
      const couponId = req.params.id;
      let data = req.body;
      let total = data.coupon_total;
     console.log(req.body.billing_address,"adressaa");
     if (!req.body.billing_address) {
      console.log('address not found');
      // If billing_address does not exist in req.body, handle the case here
      return res.json({ error: "Billing address is missing" });
    }
      // Check if coupon exists in the collection
      const coupon = await Coupon.findOne({ couponCode: couponId });
      // checking the coupon have been already used
      if (coupon) {
        if (!coupon.userId.includes(userId)) coupon?.userId?.push(userId);
        await coupon.save();
      }
      await orderHelpers.placeOrder(data).then(async (result) => {
        let response = {};
        orderid = result.id;

        if (data.payment_method === "cod") {
          response.codStatus = true;
          response.orderid = new objectId(orderid);
          res.json(response);
        } else if (data.payment_method === "razorpay") {
          await orderHelpers
            .generateRazorpay(req.session.user._id, total)
            .then((order) => {
              console.log(order, "jjjj");
              response.Razorpay = true;
              res.json(order);
            });
        } else if (data.payment_method === "wallet") {
          res.json({ orderStatus: true, message: "Order placed successfully" });
        }
      });
    } catch (error) {
      res.json({ error: error.message });
    }
  },
  //get product
  getProduct: (req, res) => {
    let userId = req.session.user._id;
    let orderId = req.params.id;
    orderHelpers.findProduct(orderId, userId).then((product) => {
      res.send(product);
    });
  },

  //varify payment
  verifyPayment: (req, res) => {
    orderHelpers.verifyPayment(req.body).then((response) => {
      orderHelpers
        .changePaymentStatus(req.session.user._id, req.body["order[receipt]"])
        .then(() => {
          res.json(response);
        })
        .catch((err) => {
          res.json({ status: false });
        });
    });
  },
  //order details
  orderDetails: async (req, res) => {
    let user = req.session.user;

    let userId = req.session.user._id;
    let orderId = req.params.id;
    const wishlistCount = await wishListHelpers.getWishListCount(userId);
    const count = await userhelper.getcartcount(userId);
    orderHelpers.getSubOrders(orderId, userId).then((orderDetails) => {
      orderHelpers.findOrder(orderId, userId).then((productorder) => {
        let products = productorder[0].orders;

        res.render("../views/user/orderdetails", {
          user,
          productorder,
          products,
          orderDetails,
          count,
          wishlistCount,
        });
      });
    });
  },
  //to change order Status
  changeOrderStatus: (req, res) => {
    let orderId = String(req.body.orderId);

    let status = req.body.status;

    console.log(orderId, "strng1");

    orderHelpers.changeOrderStatus(orderId, status).then((response) => {
      console.log(response);
      res.send(response);
    });
  },

  //cancel order
  cancelOrder: (req, res) => {
    let orderId = req.query.id;
    let total = req.query.total;
    let userId = req.session.user._id;
    console.log(orderId, req.query.total, req.session.user._id);
    orderHelpers.cancelOrder(orderId).then((canceled) => {
      orderHelpers.addWallet(userId, total).then((walletStatus) => {
        res.send(canceled);
      });
    });
  },
  //return order
  returnOrder: (req, res) => {
    let orderId = req.query.id;
    let total = req.query.total;
    let userId = req.session.user._id;
    orderHelpers.returnOrder(orderId, userId).then((returnOrderStatus) => {
      orderHelpers.addWallet(userId, total).then((walletStatus) => {
        console.log(walletStatus, "wallet");
        res.send(returnOrderStatus);
      });
    });
  },
  // delete address
  delete_Address: async (req, res) => {
    try {
      let userId = req.session.user._id;

      const deletedata = req.params.id;

      await orderHelpers.delete_Address(deletedata, userId).then((response) => {
        res.send(response);
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  },
};
