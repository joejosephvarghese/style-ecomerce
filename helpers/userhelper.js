//const db=require("../config/connection")
//const User = require("../model/user-model")
const users = require("../model/user-model");
const bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectId;
const PRODUCTS = require("../model/Product-model");
const CART = require("../model/cart_model");
const COUPON= require("../model/coupenmodel")

module.exports = {
  finding: (pagenum,perPage) => {
    return new Promise(async (resolve, reject) => {
      let finduser = await  PRODUCTS.find().skip((pagenum-1)*perPage).limit(perPage)
      resolve(finduser);
    });
  },

  findUser: (pagenum,perPage) => {
    return new Promise(async (resolve, reject) => {
      let finduser = await users.find().skip((pagenum-1)*perPage).limit(perPage)
      resolve(finduser);
    });
  },
  addUser: (User) => {
    return new Promise(async (resolve, reject) => {
      let UserDetails = new users({
        firstName: User.firstname,
        email: User.email,
        contact: User.contact,
        password: User.password,
        status: true,
      });
      UserDetails.save();
      resolve(UserDetails);
    });
  },

  getuser: function (email, password) {
    try {
      return new Promise(async (resolve, reject) => {
        const user = await users.findOne({ email: email });

        if (user) {
          bcrypt.compare(password, user.password, (err, status) => {
            if (status) {
              const response = user;
              //response.status=true

              resolve(response);
            } else {
              reject("password not match");
            }
          });
          // email not match
        } else {
          reject("email s not match");
        }
      });
    } catch (err) {
      console.error(err);
      throw new Error("Server error");
    }
  },

  prodetails: (proId) => {
    return new Promise(async (resolve, reject) => {
      const product = await PRODUCTS.findOne({ _id: proId }).lean().exec();

      if (product) {
        resolve(product);
      }
    });
  },
  add_cart: (proId, userId) => {
    console.log(userId);
    let proObj = {
      productId: proId,
      quantity: 1,
    };
    try {
      return new Promise((resolve, reject) => {
        CART.findOne({ userId: userId }).then(async (result) => {

        
     
          if (result) {
            let productExist = result.cartItems.findIndex(
              (cartItems) => cartItems.productId == proId
            );
      
            if (productExist != -1) {
              CART.updateOne(
                { userId: userId, "cartItems.productId": proId },
                {
                  $inc: { "cartItems.$.quantity": 1 },
                }
              ).then((response) => {
                resolve({ response, status: false });
              });
            } else {
              CART.updateOne(
                { userId: userId },
                {
                  $push: {
                    cartItems: proObj,
                  },
                }
              ).then((response) => {
                resolve({ status: true });
              });
            }
          } else {
            let newCart = await CART({
              userId: userId,
              cartItems: proObj,
            });
            await newCart.save().then((response) => {
              resolve({ status: true });
            });
          }
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  getCartItems: (userId) => {
    try {
      return new Promise((resolve, reject) => {
        CART.aggregate([
          {
            $match: {
              userId: new objectId(userId),
            },
          },
          {
            $unwind: "$cartItems",
          },
          {
            $project: {
              item: "$cartItems.productId",
              quantity: "$cartItems.quantity",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "item",
              foreignField: "_id",
              as: "carted",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              carted: { $arrayElemAt: ["$carted", 0] },
              price: { $arrayElemAt: ["$carted.price", 0] },
              subtotal: { $multiply: ['$quantity', { $arrayElemAt: ["$carted.price", 0] }] },
           
            },
          },
        ]).then((cartItems) => {
          resolve(cartItems);
        }).catch((err) => {
          console.log(err.message);
          reject(err);
        });
      });
    } catch (error) {
      console.log(error.message);
      return error;
    }
  },
  

 

  getcartcount: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const cart = await CART.findOne({ userId: userId });
        if (cart) {
          const cartcount = cart.cartItems.length;
          console.log(cartcount);
          resolve(cartcount);
        } else {
          resolve(0);
        }
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  },


  //total checkout 

  totalCheckOutAmount: (userId) => {
    try {
        return new Promise((resolve, reject) => {
            CART.aggregate([
                {
                    $match: {
                        userId: new objectId(userId)
                    }
                },
                {
                    $unwind: "$cartItems"
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
                        as: "carted"
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ["$carted", 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ["$quantity", "$product.price"] } }
                    }
                }
            ])
                .then((total) => {
                  console.log(total,"mmmmmmmmmmmmm");
                    resolve(total[0]?.total)
                })
        })
    } catch (error) {
        console.log(error.message);
    }
},



  /* GET Cart Count Page */
    getCartCount: (userId) => {
    return new Promise((resolve, reject) => {
      let count = 0;
      CART.findOne({ userId: userId }).then((cart) => {
        if (cart) {
          count = cart.cartItems.length;
        }
        resolve(count);
      });
    });
  },
  /* Patch Update cart quantity Page */
  updateQuantity: (data) => {
    let cartId = data.cartId;
    let proId = data.proId;
    let userId = data.userId;
    let count = data.count;
    let quantity = data.quantity;
    try {
      return new Promise(async (resolve, reject) => {
        if (count == -1 && quantity == 1) {
          CART.updateOne(
            { _id: cartId },
            {
              $pull: { cartItems: { productId: proId } },
            }
          ).then(() => {
            resolve({ status: true });
          });
        } else {
          CART.updateOne(
            { _id: cartId, "cartItems.productId": proId },
            {
              $inc: { "cartItems.$.quantity": count },
            }
          ).then(() => {
            CART.findOne(
              { _id: cartId, "cartItems.productId": proId },
              { "cartItems.$": 1 }
            ).then((cart) => {
              const newQuantity = cart.cartItems[0].quantity;
              resolve({ status: true, newQuantity: newQuantity });
            });
          });
        }
      });
    } catch (error) {
      console.log(error.message);
    }
  },

  /* Delete product from cart*/
  deleteProduct: (data) => {
    let cartId = data.cartId;
    let proId = data.proId;

    try {
      return new Promise((resolve, reject) => {
        CART.updateOne(
          { _id: cartId },
          {
            $pull: { cartItems: { productId: proId } },
          }
        ).then(() => {
          resolve({ status: true });
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },

  getcatafilter:async(data)=>{
    const category=data.name
    
    
    console.log(category,"got cata");
    try {
      const product = await PRODUCTS.find(
        { category: category }
      )
       return product;
    
    } catch (error) {
      console.log(error.message);
    }
  },

  DocumentCount: () => {
    return new Promise(async (resolve, reject) => {
      await  PRODUCTS.find().countDocuments().then((documents) => {

        resolve(documents);
      })
    })
  },


   getquantity : async (proId, userId) => {
    const quantity = await CART.aggregate([
      { $match: { userId: new objectId(userId) } }, // match the user ID
      { $unwind: '$cartItems' }, // flatten the cartItems array
      { $match: { 'cartItems.productId': new objectId(proId) } }, // match the product ID
      { $group: {
          _id: '$userId',
          totalQuantity: { $sum: '$cartItems.quantity' } // aggregate the quantity of products in the cart
      }}
    ]);
  
    
    console.log(quantity[0], "working");
    return quantity[0]
  },
  getproducts:async(proId)=>{
    const stock = await PRODUCTS .findOne({_id:proId})
    console.log(stock,"stock kityyyy");
    return stock
  },

  setNewPassword:(userDetails)=>{
    return new Promise(async(resolve, reject)=>{
        let userMobile = Number(userDetails.dcontact);
        try{
            let userPassword = await bcrypt.hash(userDetails.npassword,10);
            console.log(userPassword,"uuuuuuuuuuu");
            users.updateOne({contact:userMobile},
                {
                    $set:{
                      password: userPassword
                    }
                })
                .then((response)=>{
                    resolve(response);
  
                    console.log(response,"8888888888");
                })
        }catch(err){
            console.log(err);
        }
    })
  }
}