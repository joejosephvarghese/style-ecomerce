const users = require("../model/user-model");
const bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectId;
const PRODUCTS = require("../model/Product-model");
const CART = require("../model/cart_model");
const ADDRESS=require('../model/adressmodel')
const ORDER =require('../model/ordermodel')
const Razorpay = require('razorpay');
const { log } = require("console");
const crypto= require("crypto")


require('dotenv').config();

const keyId = process.env.key_id
const keySecret = process.env.key_secret

var instance = new Razorpay({
    key_id:'rzp_test_dT2hX9gH8hyKFB',
    key_secret: 'VTe4tcPjxXRWHLbvpysPjnMJ',
});

module.exports = {


    getAddress: (userId) => {
        return new Promise((resolve, reject) => {
            ADDRESS.findOne({ user: userId }).then((response) => {
                resolve(response)
            })

        })
    },

      /* POST Address Page */
      postAddress: (data, userId) => {
        try {
            return new Promise((resolve, reject) => {
                let addressInfo = {
                    fname: data.fname,
                    lname: data.lname,
                    street: data.Street,
                    appartment: data.Appartment,
                    city: data.City,
                    state: data.State,
                    zipcode: data.zipcode,
                    phone: data.phone,
                    email: data.email
                }

                ADDRESS.findOne({ user: userId }).then(async (ifAddress) => {
                    if (ifAddress) {
                        ADDRESS.updateOne(
                            { user: userId },
                            {
                                $push: { Address: addressInfo }
                            }
                        ).then((response) => {
                            resolve(response)
                        })
                    } else {
                        let newAddress = ADDRESS({ user: userId, Address: addressInfo })

                        await newAddress.save().then((response) => {
                            resolve(response)
                        })
                    }
                })
            })
        } catch (error) {
            console.log(error.message);
        }
    },
    findProduct: (userId,orderId, ) => {
       

        try {
            return new Promise((resolve, reject) => {
                ORDER.aggregate([
                    {
                        $match: {
                            "orders._id": new objectId(orderId),
                            user: new objectId(userId)
                        }
                    },
                    {
                        $unwind: "$orders"
                    },



                ]).then((response) => {
                    let product = response.filter((element) => {
                        if (element.orders._id == orderId) {

                            return true;
                        }
                        return false;
                    }).map((element) => element.orders.productDetails);
                    resolve(product)
                })
            })
        } catch (error) {
            console.log(error.message);
        }
    },

     

      /* GET Orders Page */
      getOrders: (userId) => {
        try {
            return new Promise((resolve, reject) => {
                ORDER.findOne({ user: userId }).then((user) => {
                    resolve(user)
                   
                })
            })
        } catch (error) {
            console.log(error.message);
        }
    },
    findOrder: async (orderId, userId) => {
        
        try {
            const result = await ORDER.aggregate([
                {
                  $match: {
                    "user": new objectId(userId),
                    "orders": {
                      $elemMatch: {
                        "_id": new objectId(orderId)
                      }
                    }
                  }
                },
                {
                    $project: {
                      order: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$orders",
                              as: "order",
                              cond: { $eq: [ "$$order._id",new objectId(orderId) ] }
                            }
                          },
                          0
                        ]
                      }
                    }
                  },
                {
                  $unwind: "$order.productDetails"
                },
                {
                  $lookup: {
                    from: 'products',
                    localField: "order.productDetails.productId",
                    foreignField: "_id",
                    as: "productDetails"
                  }
                },
                {
                  $addFields: {
                    "productDetails": {
                      $arrayElemAt: ["$productDetails", 0]
                    }
                  }
                },
                {
                  $group: {
                    _id: "$_id",
                    orders: {
                      $push: "$productDetails"
                    }
                  }
                }
              ])    
              
              
              
           
            
               return result;
               
               


        } catch (error) {
            console.log(error.message);
        }
    },



      //Post Check Out Page
    placeOrder: (data) => {
   
        try {
            return new Promise(async (resolve, reject) => {
                let productDetails = await CART.aggregate([
                    {
                        $match: {
                            userId: new objectId(data.user)
                        }
                    },
                    {
                        $unwind: '$cartItems'
                    },
                    {
                        $project: {
                            item: "$cartItems.productId",
                            quantity: "$cartItems.quantity"
                        }
                    },
                    {
                        $lookup: {
                            from: "products",
                            localField: "item",
                            foreignField: "_id",
                            as: "productDetails"
                        }
                    },
                    {
                        $unwind: "$productDetails"

                    },
                    {
                        $project: {

                            productId: "$productDetails._id",
                            productName: "$productDetails.name",
                            productPrice: "$productDetails.price",
                            quantity: "$quantity",
                            category: "$productDetails.category",
                            image: "$productDetails.images"
                        }
                    }
                ])

                let Address = await ADDRESS.aggregate([
                    
                    {
                        $match: { user: new objectId(data.user) }
                    },
                    {
                        $unwind: "$Address"
                    },
                    {
                        $match: { "Address._id": new objectId(data.billing_address) }
                    },
                    {
                        $project: { item: "$Address" }
                    }
                ])
            

                let status, orderStatus;
                if (data.payment_method === "cod") {
                    status = "placed",
                        orderStatus = "success"
                } else {
                    status = "pending",
                        orderStatus = "pending"
                }

                let orderData = {
                    name: Address[0].item.fname,
                    paymentStatus: status,
                    paymentMethod: data.payment_method,
                    productDetails: productDetails,
                    shippingAddress: Address,
                    orderStatus: orderStatus,
                    totalPrice: data.coupon_total,
                    _id: new objectId()
                }
               
                let id=orderData._id 
                console.log("oooooooooooooo",id);
                const hash= crypto.createHash('sha256');
                hash.update(id.toString());
                const userHashId=hash.digest('hex').slice(0,6);
                orderData.hashedId=userHashId

                let order = await ORDER.findOne({ user: data.user })

                if (order) {
                    await ORDER.updateOne(
                        { user: data.user },
                        {
                            $push: { orders: orderData }
                        }
                    ).then((response) => {
           
                        resolve({response,id})
                    })
                } else {
                    let newOrder = ORDER({
                        user: data.user,
                        orders: orderData
                    })
                    await newOrder.save().then((response) => {
                      
                        resolve({response,id})
                    })
                }
                await CART.deleteMany({ userId: data.user }).then(() => {
                    resolve()
                })
            })
        } catch (error) {
            console.log(error.message);
        }
    },
    generateRazorpay(userId, total) {
        try {
            return new Promise(async (resolve, reject) => {
                let orders = await ORDER.find({ user: userId })

                let order = orders[0].orders.slice().reverse();
                let orderId = order[0]._id;

                var options = {
                    amount: total * 100,  // amount in the smallest currency unit
                    currency: "INR",
                    receipt: "" + orderId
                };
                instance.orders.create(options, function (err, order) {
                    if (err) {
                        console.log(err);
                    } else {
                        resolve(order)
                    }
                });

            })
        } catch (error) {
            console.log(error.message);
        }
    },
    // verify payment of razorpay
    verifyPayment: (details) => {
        console.log("suharaajoeeeeeeeeeeeee",details);
        try {
         
            return new Promise((resolve, reject) => {
                const crypto = require("crypto");
                let hmac = crypto.createHmac("sha256",'VTe4tcPjxXRWHLbvpysPjnMJ');
                hmac.update(
                    details["payment[razorpay_order_id]"] +
                    "|" +
                    details["payment[razorpay_payment_id]"]
                );
                hmac = hmac.digest("hex");
                if (hmac == details["payment[razorpay_signature]"]) {
                    console.log(details ["order[receipt]"]);
                    resolve({status:true,orderId: details ["order[receipt]"]});
                } else {
                    reject({status:false,orderId: details ["order[receipt]"]});
                }
            })
        } catch (error) {
            console.log(error.message);
        }
    },
       // change payment status
       changePaymentStatus: (userId, orderId) => {
        try {
            return new Promise(async (resolve, reject) => {
               await ORDER.updateOne(
                    {"orders._id": orderId },
                    {
                        $set: {
                            "orders.$.orderConfirm": "success",
                            "orders.$.paymentStatus": "paid"
                        }
                    }
                ),
                    CART.deleteMany({ user: userId }).then(() => {
                        resolve()
                    })
            })
        } catch (error) {
            console.log(error.message);
        }
    },

     // to get the total of a certain product by multiplying with the quantity
     getTotal: (orderId, userId) => {
        try {
            return new Promise((resolve, reject) => {
                ORDER.aggregate([
                    {
                        $match: {
                            "user": new objectId(userId)
                        }
                    },
                    {
                        $unwind: "$orders"
                    },
                    {
                        $match: {
                            "orders._id": new objectId(orderId)
                        }
                    },
                    {
                        $unwind: "$orders.productDetails"
                    },
                    {
                        $project: {
                            "productDetails": "$orders.productDetails",

                            "totalPrice": { $multiply: ["$orders.productDetails.productPrice", "$orders.productDetails.quantity"] }
                        }
                    }
                ]).then((response) => {
                    resolve(response)
                })
            })
        } catch (error) {
            console.log(error.message);
        }
    },

    //to find the total of the order
    getOrderTotal: (orderId, userId) => {
        try {
            return new Promise((resolve, reject) => {
               ORDER.aggregate([
                    {
                        $match: {
                            "user": new objectId(userId)
                        }
                    },
                    {
                        $unwind: "$orders"
                    },
                    {
                        $match: {
                            "orders._id": new objectId(orderId)
                        }
                    },
                    {
                        $unwind: "$orders.productDetails"
                    },
                    {
                        $group: {
                            _id: "$orders._id",
                            totalPrice: { $sum: "$orders.productDetails.productPrice" }
                        }
                    }

                ]).then((response) => {
                    if (response && response.length > 0) {
                        const orderTotal = response[0].totalPrice
                        resolve(orderTotal)
                    }
                })
            })
        } catch (error) {
            console.log(error.message);
        }
    },
      //to get the current order
      getSubOrders: (orderId, userId) => {
        try {
            return new Promise((resolve, reject) => {
                ORDER.aggregate([
                    {
                        $match: {
                            'user': new objectId(userId)
                        }
                    },
                    {
                        $unwind: '$orders'

                    },
                    {
                        $match: {
                            'orders._id': new objectId(orderId)
                        }
                    }

                ]).then((order) => {
                    resolve(order)
                })
            })
        } catch (error) {
            console.log(error.message);
        }
    },

      //to change the order status by admin
    changeOrderStatus:async (orderId, status) => {
        console.log(orderId,"string");

        console.log(status,"ashhjhh");
        try {
            const result = await  ORDER.updateOne(
                { 'orders._id': orderId },
                {
                    $set: { 'orders.$.orderConfirm': status }
                })
                return result
            // return new Promise((resolve, reject) => {
          
            // })
        } catch (error) {
            console.log(error.message);
        }
    
     

},

      //cancel order
      cancelOrder: (orderId) => {
        try {
            return new Promise((resolve, reject) => {
              ORDER.find({ 'orders._id': orderId }).then((orders) => {

                    let orderIndex = orders[0].orders.findIndex(
                        (orders) => orders._id == orderId
                    );

                    let order = orders[0].orders.find((order) => order._id == orderId);

                    if (order.paymentMethod === 'razorpay' && order.paymentStatus === 'paid') {

                        ORDER.updateOne(
                            { 'orders._id': orderId },
                            {

                                $set: {
                                    ['orders.' + orderIndex + '.orderConfirm']: 'Canceled',
                                    ['orders.' + orderIndex + '.paymentStatus']: 'Refunded'
                                }
                            }
                        ).then((orders) => {
                            console.log(orders, '000');
                            resolve(orders)
                        })
                    } else if (order.paymentMethod === 'COD' && order.orderConfirm === 'Delivered' && order.paymentStatus === 'paid') {
                        ORDER.updateOne(
                            { 'orders._id': orderId },
                            {
                                $set: {
                                    ['orders.' + orderIndex + '.orderConfirm']: 'Canceled',
                                    ['orders.' + orderIndex + '.paymentStatus']: 'Refunded'
                                }
                            }
                        ).then((orders) => {
                            console.log(orders, '111');
                            resolve(orders)
                        })
                    } else {
                      ORDER.updateOne(
                            { 'orders._id': orderId },
                            {
                                $set: {
                                    ['orders.' + orderIndex + '.orderConfirm']: 'Canceled'

                                }
                            }
                        ).then((orders) => {
                            console.log(orders, '222');
                            resolve(orders)
                        })
                    }

                })

            })
        } catch (error) {
            console.log(error.message);
        }
    },
     

      // return order
    returnOrder: (orderId) => {
        try {
            return new Promise((resolve, reject) => {
                ORDER.find({ 'orders._id': orderId }).then((orders) => {

                    let orderIndex = orders[0].orders.findIndex(
                        (orders) => orders._id == orderId
                    );

              ORDER.updateOne(
                        { 'orders._id': orderId },
                        {
                            $set: {
                                ['orders.' + orderIndex + '.orderConfirm']: 'Returned',
                                ['orders.' + orderIndex + '.paymentStatus']: 'Refunded'
                            }
                        }
                    ).then((orders) => {
                        console.log(orders, '1');
                        resolve(orders)
                    })
                })
            })
        } catch (error) {
            console.log(error.message);
        }
    },
    addWallet: (userId, total) => {
        try {
            return new Promise((resolve, reject) => {
                console.log(userId, total, '--------');
                users.updateOne({ _id: userId },
                    {
                        $inc: { wallet: total }
                    }).then((response) => {
                        resolve(response)
                    })
            })
        } catch (error) {
            console.log(error.message);
        }
    },
    get_EditAddress: (ADDID, userId) => {
        console.log(ADDID,userId);
        return new Promise((resolve, reject) => {
          try {
   
            ADDRESS.findOne({ user: new objectId(userId)},{ Address: { $elemMatch: { _id: new objectId(ADDID)} } })
              .then((response) => {
                resolve(response);
              })
              .catch((err) => {
                reject(err);
              });
          } catch (error) {
            reject(error);
          }
        });
      },


      delete_Address:(deleteId,user)=>{
        console.log(deleteId,user);
        try {
            return new Promise((resolve, reject) => {
                ADDRESS.updateOne(
                    { user: user },
                    {
                        $pull: { Address: { _id: deleteId } }
                    }).then((response) => {
                        resolve(response)
                    })
            })
        } catch (error) {
            console.log(error.message);
        }
      },


    
      post_EditedAddress: (data, user, addressId) => {
        console.log(data, user, addressId);
        const id = user._id;
        try {
            return new Promise((resolve, reject) => {
                ADDRESS.updateOne(
                    { user: id, "Address._id": addressId },
                    { $set: { "Address.$": data } }
                ).then((response) => {
                    resolve(response);
                });
            });
        } catch (error) {
            console.log(error.message);
        }
    },


    //find all orders


    findings: (pagenum, perPage) => {
        console.log(pagenum, perPage, "jiee");
    
        return new Promise(async (resolve, reject) => {
            let orders = await ORDER.aggregate([
                {
                    $unwind: "$orders"
                },
                {
                    $skip: (pagenum - 1) *  perPage
                },
                {
                    $limit:  perPage
                }
            ]);
    
            resolve(orders);
        });
    },
    
      getOrderByDate: () => {
        return new Promise(async (resolve, reject) => {
          const startDate = new Date();
          await ORDER
            .find({ createdAt: { $gte: startDate } })
            .then((response) => {
              resolve(response);
            });
        });
      },
      getOrderByCategory:()=>
  {
    return new Promise(async (resolve, reject) => {
      await ORDER.aggregate([
        { $unwind: "$orders"},
      ]).then((response)=>
      { 
        const productDetails = response.map(order => order.orders.productDetails);
        resolve(productDetails)

      })
    })
  }, 

  getAllOrders: () => {
    return new Promise(async (resolve, reject) => {
      let order = await ORDER
        .aggregate([{ $unwind: "$orders" },
        { $sort: { "orders.createdAt": -1 } } 
      ])
        .then((response) => {
          resolve(response);
        });
    });
  },
//   saleOrders: () => {
//     return new Promise(async (resolve, reject) => {
//       try {
//         let orders = await ORDER.aggregate([
//           {
//             $unwind: "$orders"
//           }
//         ]);
//         resolve(orders);
//       } catch (error) {
//         reject(error);
//       }
//     });
//   }
getSalesReport: () => {
    try {
        return new Promise((resolve, reject) => {
            ORDER.aggregate([
                {
                    $unwind: '$orders'
                },
                {
                    $match: {
                        "orders.orderConfirm": "delivered"
                    }
                }
            ]).then((response) => {
                resolve(response)
            })
        })
    } catch (error) {
        console.log(error.message);
    }
},
  }
 



      
        
        