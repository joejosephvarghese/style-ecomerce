const voucherCode = require('voucher-code-generator')
const couponModel= require('../model/coupenmodel')
const user =require('../model/user-model')
const ObjectId = require("mongodb").ObjectId;

module.exports = {

    /* GET Generate Coupon Code Page. */
    generatorCouponCode: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let couponCode = voucherCode.generate({
                    length: 6,
                    count: 1,
                    charset: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
                    prefix: "Promo-",
                });
                resolve({ status: true, couponCode: couponCode[0] });
            } catch (err) {
                throw new Error(err)
            }
        });
    },

    /* Post Add Coupone Page. */
    postaddCoupon: (data) => {
 
        try {
            return new Promise((resolve, reject) => {
                couponModel.findOne({ couponCode: data.couponCode }).then((coupon) => {
                    if (coupon) {
                        resolve({ status: false })
                    } else {
                        couponModel(data).save().then((response) => {
                            console.log(response,"responsssse");
                            resolve({ status: true })
                        })
                    }
                })
            })
        } catch (error) {
            console.log(error.message);
        }
    },

    /* GET Coupon List Page. */
    getCouponList:()=>{
        try {
            return new Promise((resolve,reject)=>{
                couponModel.find().then((coupons)=>{
                    resolve(coupons)
                })
            })
        } catch (error) {
            console.log(error.message);
        }
    },

     // to verify the coupon code

    verifyCoupon: (userId, couponCode) => {
        console.log(userId, couponCode);
      
        try {
          return new Promise((resolve, reject) => {
            couponModel.find({ couponCode: couponCode }).then(async (couponExist) => {
              console.log(couponExist, 'validity');
              console.log(couponExist[0].userId);
              console.log(new ObjectId(userId));
              
              if (couponExist.length > 0) {
                if (new Date(couponExist[0].validity) - new Date() > 0) {
                  if (couponExist[0].userId.indexOf(userId) !== -1) {
                    resolve({ status: false, message: "Coupon already used by the user" });
                  } else {
                    resolve({ status: true, message: "Coupon added successfully" });
                  }
                } else {
                  resolve({ status: false, message: "Coupon has expired" });
                }
              } else {
                resolve({ status: false, message: "Coupon doesn't exist" });
              }
            });
          });
        } catch (error) {
          console.log(error.message);
        }
      },
      







   
  
    applyCoupon: (couponCode, total, userId) => {
        console.log(userId,"frst");
        try {
          return new Promise((resolve, reject) => {
            couponModel.findOne({ couponCode: couponCode }).then((couponExist) => {
              if (couponExist) {
         
                if (new Date(couponExist.validity) - new Date() > 0) {
                  if (total >= couponExist.minAmount) {
                    if (couponExist.userId && couponExist.userId === userId) {
                      resolve({
                        status: false,
                        message: "Coupon is already used.",
                      });
                    } else {
                      let discountAmount = (total * couponExist.minDiscountPercentage) / 100;
                    
                      if (discountAmount > couponExist.maxDiscountValue) {
                        discountAmount = couponExist.maxDiscountValue;
                      }
                      resolve({
                        status: true,
                        discountAmount: discountAmount,
                        discount: couponExist.minDiscountPercentage,
                        couponCode: couponCode,
                      });
              
                    }
                  } else {
                    resolve({
                      status: false,
                      message: `Minimum purchase amount is ${couponExist.minAmount}`,
                    });
                  }
                } else {
                  resolve({
                    status: false,
                    message: "Coupon expired",
                  });
                }
              } else {
                resolve({
                  status: false,
                  message: "Coupon doesn't exist",
                });
              }
            });
          });
        } catch (error) {
          console.log(error.message);
        }
      },
      
}