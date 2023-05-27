const adminhelper = require("../helpers/adminhelper");
const userhelper = require("../helpers/userhelper");
const swal = require("sweetalert");
const productControl = require("./productControl");
const productHelper = require("../helpers/productHelper");
const orderHelpers = require("../helpers/orderhelper");
const usercontrol = require("../controllers/usercontrol");
const couponHelpers = require("../helpers/couponhelpers");

module.exports = {


  adminlogin: (req, res) => {
    res.render("admin/adminlogin", { layout: "admin-layout" });
  },

  adminlogout: (req, res) => {
    req.session.admin = null;
    res.redirect("/admin/adminlogin");
  },

  loginformsubmit: async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    try {
      let admin = await adminhelper.getadmin(email, password);
      console.log(admin);
      // Authentication logic here
      if (admin) {
        console.log(admin);
        req.session.admin = admin;
        res.redirect("/admin");
      
      } else {
        res.redirect("/admin/adminlogin");
      }
    } catch (error) {
      res.status(401).json({ message: "Invalid username or password" });
    }
  },
  getadminsignup: (req, res) => {
    res.render("admin/adminsignup", { layout: "admin-layout" });
  },

  postadminsignup: (req, res) => {
    console.log(req.body);
    let data = req.body;
    adminhelper.addAdmin(data).then(() => {
      res.redirect("/admin/adminlogin");
    });
  },
//get  productlist
  getproductList: async (req, res) => {
    try {
      const pagenum = req.query.page;
    
      const currentPage = pagenum;
      const perPage = 5;
  
      const documentCount = await adminhelper.DocumentCount();
      let pages2 = Math.ceil(parseInt(documentCount) / perPage);
      console.log(pages2);
  
      productHelper.list_product(pagenum, perPage).then((result) => {
        const data = JSON.parse(JSON.stringify(result));
  
        console.log(data);
  
        res.render("../views/admin/productlist", {
          layout: "admin-layout",
          admin: true,
          data,
          pages2,
        });
      });
    } catch (error) {
      console.log(error);
      // Handle the error appropriately (send an error response, log the error, etc.)
      res.status(500).send("Internal Server Error");
    }
  },
  //get userlist
  getUserList: async (req, res) => {
    try {
      const pagenum = req.query.page;
  
      const currentPage = pagenum;
      const perPage = 5;
      const documentCount = await adminhelper.DocumentCount();
      let pages2 = Math.ceil(parseInt(documentCount) / perPage);
  
      userhelper.findUser(pagenum, perPage).then((result) => {
        const data = JSON.parse(JSON.stringify(result));
        res.render("../views/admin/UsersList", {
          layout: "admin-layout",
          admin: true,
          data,
          result,
          pages2,
        });
      });
    } catch (error) {
      console.log(error);
      // Handle the error appropriately (send an error response, log the error, etc.)
      res.status(500).send("Internal Server Error");
    }
  },
  

  getBlockData: (req, res) => {
    let Blockid = req.params.id;

    adminhelper.Blockuser(Blockid).then(res.redirect("/admin/userlist"));
  },

  getUnblockdata: (req, res) => {
    let Unblockid = req.params.id;

    adminhelper.Unblockuser(Unblockid).then(res.redirect("/admin/userlist"));
  },

  /* GET Order List Page. */
  getOrderList: (req, res) => {
    try {
      let userId = req.params.id;
      console.log(userId);
      let admin = req.session.admin;
  
      adminhelper.getUserList(userId).then((user) => {
        orderHelpers.getOrders(userId).then((order) => {
          console.log(order, "workinggggggg");
          res.render("../views/admin/orderlist", {
            layout: "admin-layout",
            admin: true,
            order,
            user,
          });
        });
      });
    } catch (error) {
      console.log(error);
      // Handle the error appropriately (send an error response, log the error, etc.)
      res.status(500).send("Internal Server Error");
    }
  },
  

  /* GET Order Details Page. */
  getOrderDetails: async (req, res) => {
    try {
      let admin = req.session.admin;
      let orderId = req.query.orderId;
      let userId = req.query.userId;
      let userDetails = await usercontrol.getDetails(userId);
  
      orderHelpers.findOrder(orderId, userId).then((order) => {
        orderHelpers.getSubOrders(orderId, userId).then((orderDetails) => {
          orderHelpers.getTotal(orderId, userId).then((productTotalPrice) => {
            orderHelpers
              .getOrderTotal(orderId, userId)
              .then((orderTotalPrice) => {
                console.log(orderDetails[0], "worling");
  
                res.render("admin/orderDetails", {
                  layout: "admin-layout",
                  admin: true,
                  order,
                  userDetails,
                  productTotalPrice,
                  orderTotalPrice,
                  orderDetails,
                });
              });
          });
        });
      });
    } catch (error) {
      console.log(error);
      // Handle the error appropriately (send an error response, log the error, etc.)
      res.status(500).send("Internal Server Error");
    }
  },
  

  /* GET Add Coupon Page. */
  getAddCoupon: (req, res) => {
    res.render("admin/addCoupon", { layout: "admin-layout", admin: true });
  },

  /* GET Generate Coupon Code Page. */
  generatorCouponCode: (req, res) => {
    try {
      couponHelpers.generatorCouponCode().then((couponCode) => {
        console.log(couponCode, "-----");
        res.send(couponCode);
      });
    } catch (error) {
      res
        .status(500)
        .json({ statusCode: 500, message: "Internal server error.." });
    }
  },

  /* Post Add Coupone Page. */
  postaddCoupon: (req, res) => {
    try {
      console.log(req.body, "data working");
      let data = {
        couponCode: req.body.coupon,
        validity: req.body.validity,
        minAmount: req.body.minAmount,
        minDiscountPercentage: req.body.minDiscountPercentage,
        maxDiscountValue: req.body.maxDiscount,
        description: req.body.description,
        status: true,
      };
      couponHelpers.postaddCoupon(data).then((response) => {
        console.log(response, "ressssss");
        res.send(response);
      });
    } catch (error) {
      console.log(error);
      // Handle the error appropriately (send an error response, log the error, etc.)
      res.status(500).send("Internal Server Error");
    }
  },
  

  /* GET Coupon List Page. */
  getCouponList: (req, res) => {
    let admin = req.session.admin;
    couponHelpers.getCouponList().then((couponList) => {
      res.render("../views/admin/couponlist", {
        layout: "admin-layout",
        admin: true,
        couponList,
      });
    });
  },

  getorderslist: async (req, res) => {
    console.log("all order route called");
    console.log(req.query);
    const pagenum = req.query?.page;

    const currentPage = pagenum;
    const perPage = 5;
    const documentCount = await adminhelper.DocumentCounts();
    console.log(documentCount, "yyyyyyyyyyyyyyyyyyyyyyyyyyy");
    let pages2 = Math.ceil(parseInt(documentCount) / perPage);
    console.log(pages2, "oooooooooooyyyyyyyyyyy");
    const order = await orderHelpers.findings(pagenum ?? 1, perPage);

    console.log(order, "workingddddd");
    res.render("../views/admin/allorders", {
      layout: "admin-layout",
      admin: true,
      order,
      pages2,
    });
  },
  chartDetails: async (req, res) => {
    let delivers = await adminhelper.deliverGraph();
    console.log(delivers);
    res.json({ delivers });
  },

  getDashboard: async (req, res) => {
    admins = req.session.admin;
    let totalProducts,
      days = [];
    let ordersPerDay = {};
    let paymentCount = [];

    let Products = await adminhelper.getAllProducts();
    totalProducts = Products.length;

    await orderHelpers.getOrderByDate().then((response) => {
      let result = response;
      for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[i].orders.length; j++) {
          let ans = {};
          ans["createdAt"] = result[i].orders[j].createdAt;
          days.push(ans);
        }
      }

      days.forEach((order) => {
        let day = order.createdAt.toLocaleDateString("en-US", {
          weekday: "long",
        });
        ordersPerDay[day] = (ordersPerDay[day] || 0) + 1;
      });
    });

    let getCodCount = await adminhelper.getCodCount();

    let codCount = getCodCount.length;

    let getOnlineCount = await adminhelper.getOnlineCount();
    let onlineCount = getOnlineCount.length;

    paymentCount.push(onlineCount);
    paymentCount.push(codCount);

    let orderByCategory = await orderHelpers.getOrderByCategory();

    let NIKE = 0,
      ADIDAS = 0,
      PUMA = 0,
      SUPREEM = 0;
    orderByCategory.forEach((Products) => {
      console.log(Products);
      if (Products[0]?.category == "NIKE") NIKE++;
      if (Products[0]?.category == "ADIDAS") ADIDAS++;
      if (Products[0]?.category == "PUMA") PUMA++;
      if (Products[0]?.category == "SUPREEM") SUPREEM++;
    });
    let category = [];
    category.push(NIKE);
    category.push(ADIDAS);
    category.push(PUMA);
    category.push(SUPREEM);

    await orderHelpers.getAllOrders().then((response) => {
      var length = response.length;

      let total = 0;

      for (let i = 0; i < length; i++) {
        total += response[i].orders.totalPrice;
      }

      res.render("../views/admin/adminhomepage", {
        layout: "admin-layout",
        admin: true,
        length,
        total,
        totalProducts,
        ordersPerDay,
        paymentCount,
        category,
      });
    });
  },
  getSalesReport: async (req, res) => {
    await orderHelpers.getAllOrders().then(async (response) => {
      var length = response.length;

      let total = 0;

      for (let i = 0; i < length; i++) {
        total += response[i].orders.totalPrice;
      }

      let report = await orderHelpers.getSalesReport();
 
      let details = [];
      const getDate = (date) => {
        let orderDate = new Date(date);
        let day = orderDate.getDate();
        let month = orderDate.getMonth() + 1;
        let year = orderDate.getFullYear();
        return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${
          isNaN(year) ? "0000" : year
        }`;
      };

      report.forEach((orders) => {
        details.push(orders.orders);
      });

      res.render("../views/admin/salesreport", {
        layout: "admin-layout",
        admin: true,
        report,
        details,
        getDate,
        total,
        length,
      });
    });
  },

  getAddBanner: (req, res) => {
    const admin = req.session.admin;
    res.render("../views/admin/addBanner", {
      layout: "admin-layout",
      admin: true,
    });
  },

  postAddBanner: (req, res) => {
    console.log(req.body, req.file.filename, "working on it");
    adminhelper.addBanner(req.body, req.file.filename).then((response) => {
      if (response) {
        console.log(response, "000");
        res.redirect("/admin/add-banner");
      } else {
        res.status(505);
      }
    });
  },
  postSalesReport: (req, res) => {
    const admin = req.session.admin;
    let details = [];
    const getDate = (date) => {
      let orderDate = new Date(date);
      let day = orderDate.getDate();
      let month = orderDate.getMonth() + 1;
      let year = orderDate.getFullYear();
      return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${
        isNaN(year) ? "0000" : year
      }`;
    };

    adminhelper.postReport(req.body).then((orderData) => {
      console.log(orderData, "orderData");
      orderData.forEach((orders) => {
        details.push(orders.orders);
      });

      res.render("../views/admin/salesreport", {
        layout: "admin-layout",
        admin: true,
        details,
        getDate,
      });
    });
  },
  getBannerList: (req, res) => {
    let admin = req.session.admin;
    adminhelper.getBannerList().then((banner) => {
      console.log(banner, "banner");

      res.render("../views/admin/bannerlisit", {
        layout: "admin-layout",
        admin: true,
        banner,
      });
    });
  },

  deleteBanner: (req, res) => {
    adminhelper.deleteBanner(req.params.id).then((response) => {
      res.send(response);
    });
  },
};
