var express = require('express');
var router = express.Router();
const Session=require("../sessions/Session");
const usercontrol = require('../controllers/usercontrol');
const ordercontrol=require('../controllers/ordercontroler');

/* GET users listing. */

router.get('/', usercontrol.userHome);

//user login page
 router
.route('/login')
.get(Session.userCheck, usercontrol.getLoginPage)
.post(usercontrol.loginformSubmit);




//user signup page 
router.get('/signup',usercontrol.getsignupPage) 

router
.post('/signup',usercontrol.PostsignUp)

module.exports = router;


//logout Page

router
.route('/logout')
.get(Session.logoutcheck,usercontrol.logout);


 //shop product 

 router
 .route('/shopproduct/:id')

 .get(Session.ifusercheck ,usercontrol.getshop_product)



 //add to cart
 router
 .route('/addtocart/:id')
 .get(usercontrol.addtocart)


 //cart page

 router
 .route('/cartpage')
 .get(Session.ifusercheck,usercontrol.getcartpage)
//change quantity
 router
 .route('/change-product-quantity')
 .patch(usercontrol.updateQuantity)


 //delete product from cart

 router
 .route('/delete-product-cart')
 .delete(usercontrol.deleteProduct)


 
//get userprofile
router
.route('/get-profile')
.get(Session.ifusercheck,ordercontrol.getAddress)


//get checkoutpage

router
.route('/getcheckoutpage')
.get(Session.ifusercheck,ordercontrol.getcheckoutpage)


/* POST Address Page */
router
.route('/add-address')
.post(Session.ifusercheck,ordercontrol.postAddress)

//post checkout

router
.route('/check-out/:id')
.post(ordercontrol.postCheckOut)

router
.route('/order-product/:id')
.get(Session.ifusercheck,ordercontrol.getProduct)

//varify payment
router
.route('/verify_payment')
.post(Session.ifusercheck,ordercontrol.verifyPayment)

//get filte page
router
.route('/catagoryfilter/:name')
.get(Session.ifusercheck,usercontrol.getcatagorypage)

//get order details
router
.route('/order-details/:id')
.get(Session.ifusercheck,ordercontrol.orderDetails)
//cancel order
router
.route('/cancel-order/')
.post(ordercontrol.cancelOrder)

//return order
router
.route('/return-order/')
.post(ordercontrol.returnOrder)

//edit editaddress
router
.route('/edit-address/:id')
.get(usercontrol.Edit_Address)


//edit adress
router
.route('/edited-address/:id')
.put(usercontrol.Edited_Address)

//delete addres
router
.delete('/delete-address/:id',ordercontrol.delete_Address)


//apply coupon
router
.route('/coupon-verify/:id')
.get(usercontrol.verifyCoupon)

//apply coupon
router
.route('/apply-coupon/:id')
.get( usercontrol.applyCoupon)


//get wishlist
router
.route('/wish-list')
.get( Session.ifusercheck, usercontrol.getWishList)

//post wishlist
router
.route('/add-to-wishlist')
.post(Session.ifusercheck,usercontrol.addWishList)
 
//remove wishlist
router
.route('/remove-product-wishlist')
.delete(usercontrol.removeProductWishlist)

//update userpassword
router.post('/changeuserdata',Session.ifusercheck,usercontrol.updateUserPassword )



















    

