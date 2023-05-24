var express = require('express');
var router = express.Router();
const admincontrol = require('../controllers/admincontrol');
const Session=require("../sessions/Session")
const catagoryControl=require('../controllers/catagory-control')
const productControl=require('../controllers/productControl')
const upload= require('../sessions/multercloudinary')
const ordercontrol=require('../controllers/ordercontroler')






/* GET home page. */
// router.get('/',Session.admincheck,admincontrol.adminHome);
router.get("/",Session.admincheck,admincontrol.getDashboard)


// Get adminlogin page

router
.route('/adminlogin')
.get(admincontrol.adminlogin)
.post(admincontrol.loginformsubmit)


// admin logout

router
.route('/adminlogout')
.get(Session.admincheck,admincontrol.adminlogout)


//get adminsignup page

router.get('/adminsignup', admincontrol.getadminsignup)


router.post('/adminsignup', admincontrol.postadminsignup)

module.exports = router;
  


//product list

 router
 .route('/productlist')
 .get(Session.admincheck,admincontrol.getproductList);

 //user List

 router
 .route('/userlist')
 .get(Session.admincheck,admincontrol.getUserList);
//Block user
 router
.route('/blockuser/:id')
.get (Session.admincheck,admincontrol.getBlockData);

//Unblock user
 router
 .route('/unblockuser/:id')
 .get(Session.admincheck,admincontrol.getUnblockdata)


 //get Catagories

 router
 .route('/catagories')
 .get(Session.admincheck,catagoryControl.get_catagories)
//  .post(catagoryControl.add_catagory)

router
.post('/addcategory',Session.admincheck,catagoryControl.add_catagory)




 //delete catagories

 router
 .route('/deletecatagory/:id')
 .get(Session.admincheck,catagoryControl.Delete_cata)


 //Relist the catagory

 router
 .route('/listcatagory/:id')
 .get(Session.admincheck,catagoryControl.list_cata)


 // get edit catagory

 router
 .route('/editcatagory/:id')
 .get(catagoryControl.getEditcatagory_page)
 .post(Session.admincheck,catagoryControl.edit_catagory)




 //add product

 router
 .route('/addproduct')
 .get(Session.admincheck,productControl.get_addproductpage)
 .post(upload,productControl.add_product)


 //delete product

 router
 .route('/deleteproduct/:id')
 .get(Session.admincheck,productControl.delete_product)


 //list product

 router
 .route('/listproduct/:id')
 .get(Session.admincheck,productControl.list_product)

 //edit product

 router
 .route('/editproduct/:id')
 .get(Session.admincheck,productControl.edit_product)
 .post(upload,productControl.updateproduct)



 /* GET Order List Page. */
router
.route('/order-list/:id')

.get(Session.admincheck, admincontrol.getOrderList)


/* GET Order Details Page. */
router
.route('/order-details')
.get(Session.admincheck, admincontrol.getOrderDetails)


/* POST Order Status Page. */
router
.route('/change-order-status')
.post(Session.admincheck,ordercontrol.changeOrderStatus)


/* GET Add Coupon Page. */
router
.route('/add-coupon')
.get(Session.admincheck,admincontrol.getAddCoupon)
.post(Session.admincheck,admincontrol.postaddCoupon)


/* GET Generate Coupon Code Page. */
router
.route('/generate-coupon-code')
.get(Session.admincheck,admincontrol.generatorCouponCode)



 /* GET Coupon List Page. */
router
.route('/coupon-list')
.get(Session.admincheck,admincontrol.getCouponList)

router
.route('/orderslist')
.get(Session.admincheck,admincontrol.getorderslist)

router.get('/chart-details',Session.admincheck,admincontrol.chartDetails);

router.get('/salesreport',Session.admincheck,admincontrol.getSalesReport)
router.post('/salesreport',Session.admincheck,admincontrol.postSalesReport)


//Banner
router
.route('/add-banner')
.get(Session.admincheck,admincontrol.getAddBanner)
.post(upload,productControl.add_banner)
router
.route('/banner-list')
.get(Session.admincheck, admincontrol.getBannerList)
// router
// .route('/edit-banner')
// .get(Session.admincheck, admincontrol.getEditBanner)

// router
// .route('/edit-banner')
// .post(upload,admincontrol.postEditBanner)


router
.route('/delete-banner/:id')
.delete(Session.admincheck,admincontrol.deleteBanner)












// router.get('/blockuser/:id', admincontrol.getBlockData)/
//Session.admincheck,