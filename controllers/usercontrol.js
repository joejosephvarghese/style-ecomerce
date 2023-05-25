const { response, request } = require("express");
const adminhelper = require("../helpers/adminhelper");
const productHelper = require("../helpers/productHelper");
const userhelper = require("../helpers/userhelper");
const Product = require("../model/Product-model");
const Category = require("../model/catagory-model");
const Session = require("../sessions/Session");
const productControl = require("./productControl");
const users = require("../model/user-model");
const orderhelper = require("../helpers/orderhelper");
const couponmodel = require("../model/coupenmodel");
const couponHelpers = require("../helpers/couponhelpers");
const wishListHelpers = require("../helpers/wishlisthelper");
const cartHelpers = require("../helpers/carthelper");
const Banner = require("../model/Bannermodel");

module.exports = {
  userHome: async (req, res) => {
    const user = req.session.user;
    const userId = user?._id;
    const pagenum = req.query?.page;
    const currentPage = pagenum;
    const perPage = 6;
    const count = await userhelper.getcartcount(userId);
    const wishlistCount = await wishListHelpers.getWishListCount(userId);
    const documentCount = await userhelper.DocumentCount();
    let pages2 = Math.ceil(parseInt(documentCount) / perPage);
    const data = await productHelper.findall(pagenum, perPage);
    const categories = await Category.find().lean().exec();
    const banner = await Banner.find().lean().exec();
    console.log(banner, "ol");

    res.render("user/user-homepage", {
      user,
      data,
      categories,
      pages2,
      count,
      banner,
      wishlistCount,
    });
    // if(user){
    //     // if (!user || !user._id) {
    // //   return res.redirect("/login");
    // // }
    // const userId = user._id;
    // const pagenum = req.query.page;
    // const currentPage = pagenum;
    // const perPage = 6;
    // const count = await userhelper.getcartcount(userId);
    // const wishlistCount = await wishListHelpers.getWishListCount(userId);
    // const documentCount = await userhelper.DocumentCount();
    // let pages2 = Math.ceil(parseInt(documentCount) / perPage);
    // const data = await productHelper.findall(pagenum, perPage);
    // const categories = await Category.find().lean().exec();
    // const banner = await Banner.find().lean().exec();
    // console.log(banner, "ol");

    // res.render("user/user-homepage", {
    //   user,
    //   data,
    //   categories,
    //   pages2,
    //   count,
    //   banner,
    //   wishlistCount,
    // });
    // } else {
    //   res.redirect('/login')
    // } 
  
  },

  getLoginPage: (req, res) => {
    res.render("user/user-loginpage", {
      layout: "layout",
      login: true,
      loggnerr: req.session.logginerr,
    });
    req.session.logginerr = false;
  },

  loginformSubmit: async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    try {
      let user = await userhelper.getuser(email, password);

      //Authentication logic here
      if (user) {
        req.session.user = user;

        res.redirect("/");
      } else {
        req.session.logginerr = true;
        res.redirect("/login");
      }
    } catch (error) {
      // res.status(401).json({ message: "SERVER ISSUE" });
      res.redirect("/login");
    }
  },

  getsignupPage: (req, res) => {
    res.render("user/signup", { layout: "layout", signup: true });
  },

  PostsignUp: async (req, res) => {
    let data = req.body;
    userhelper.addUser(data).then(res.redirect("/login"));
  },

  logout: (req, res) => {
    req.session.user = null;
    res.redirect("/");
  },

  getshop_product: async (req, res) => {
    const proId = req.params.id;
    const user = req.session.user;
    const userId = user._id;
    const wishlistCount = await wishListHelpers.getWishListCount(userId);
    const count = await userhelper.getcartcount(userId);
    const product = await userhelper.prodetails(proId);
    try {
      res.status(200).render("../views/user/shop_product", {
        user,
        product,
        count,
        wishlistCount,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },
  addtocart: async (req, res) => {
    const proId = req.params.id;
    const userId = req.session.user;
    try {
      const quantity = await userhelper.getquantity(proId, userId._id);

      if (quantity?.totalQuantity) {
        var Q = quantity.totalQuantity;
      } else {
        var Q = 0;
      }
      const stock = await userhelper.getproducts(proId);
      let S = stock.stock;

      const result = S - Q;

      if (result > 0) {
        if (req.session.user) {
          userhelper.add_cart(proId, userId._id).then((result) => {
            res.status(200).json({ message: "successfull", login: true });
          });
        } else {
          res.status(200).json({ message: "Please login ", login: false });
        }
      } else {
        res.json({ outofstock: true });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getcartpage: async (req, res) => {
    const user = req.session.user;
    const userId = user._id;

    const wishlistCount = await wishListHelpers.getWishListCount(userId);
    console.log(wishlistCount, "klllopoo");
    let cartdetails = await userhelper.getCartItems(userId);
    const count = await userhelper.getcartcount(userId);
    let total = await userhelper.totalCheckOutAmount(userId);

    res.render("../views/user/cart-page", {
      user,
      cartdetails,
      total,
      wishlistCount,
      count,
    });
  },
  updateQuantity: (req, res) => {
    let userId = req.session.user._id;

    userhelper.updateQuantity(req.body).then(async (response) => {
      const total = await userhelper.totalCheckOutAmount(userId);
      console.log("change quantity-", total);
      // response.subTotal = await orderHelpers.getSubTotal(userId)
      res.json({
        newQuantity: response.newQuantity,
        status: true,
        total: total,
      });
    });
  },
  /* Delete product from cart*/
  deleteProduct: (req, res) => {
    userhelper.deleteProduct(req.body).then((response) => {
      res.send(response);
    });
  },

  //getcategorypage
  getcatagorypage: async (req, res) => {
    const user = req.session.user;
    const userId = user._id;
    const wishlistCount = await wishListHelpers.getWishListCount(userId);
    const count = await userhelper.getcartcount(userId);
    const categories = await Category.find().lean().exec();

    userhelper.getcatafilter(req.params).then((result) => {
      res.render("../views/user/filter", {
        user,
        result,
        categories,
        count,
        wishlistCount,
      });
    });
  },

  getDetails: (userId) => {
    try {
      return new Promise((resolve, reject) => {
        users.findOne({ _id: userId }).then((user) => {
          resolve(user);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  Edit_Address: async (req, res) => {
    try {
      const user = req.session.user;

      const editdata = req.params.id;

      await orderhelper.get_EditAddress(editdata, user._id).then((data) => {
        res.json({ address: data });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  },

  Edited_Address: async (req, res) => {
    try {
      const user = req.session.user;
      const data = req.body;

      const addressId = req.params.id;

      await orderhelper
        .post_EditedAddress(data, user, addressId)
        .then((data) => {
          console.log(data, "K");

          res.json({ address: data });
        });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  },

  verifyCoupon: (req, res) => {
    let couponCode = req.params.id;
    let userId = req.session.user._id;

    console.log(couponCode, "klklkl");
    couponHelpers.verifyCoupon(userId, couponCode).then((response) => {
      res.send(response);
    });
  },
  applyCoupon: async (req, res) => {
    let couponCode = req.params.id;
    let userId = req.session.user._id;
    let total = await userhelper.totalCheckOutAmount(userId);
    console.log(total);
    couponHelpers.applyCoupon(couponCode, total, userId).then((response) => {
      res.send(response);
    });
  },

  getWishList: async (req, res) => {
    let user = req.session.user;
    const userId = user._id;
    let count = await userhelper.getcartcount(userId);
    console.log(count, "call");
    const wishlistCount = await wishListHelpers.getWishListCount(userId);
    wishListHelpers.getWishListProducts(userId).then((wishlistProducts) => {
      console.log(wishlistProducts, "love");
      res.render("../views/user/whishlist", {
        user,
        count,
        wishlistProducts,
        wishlistCount,
      });
    });
  },

  addWishList: (req, res) => {
    let proId = req.body.proId;
    let userId = req.session.user._id;

    wishListHelpers.addWishList(userId, proId).then((response) => {
      res.send(response);
    });
  },

  removeProductWishlist: (req, res) => {
    let proId = req.body.proId;
    let wishListId = req.body.wishListId;
    wishListHelpers
      .removeProductWishlist(proId, wishListId)
      .then((response) => {
        res.send(response);
      });
  },

  getuserprofile: async (req, res) => {
    const user = req.session.user;
    const userId = user._id;
    const count = await userhelper.getcartcount(userId);

    res.render("../views/user/profile", { user, count });
  },

  updateUserPassword: (req, res) => {
    userhelper.setNewPassword(req.body).then(() => {
      res.redirect("/");
    });
  },
};
