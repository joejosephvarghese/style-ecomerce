const PRODUCTS = require("../model/Product-model");
const CATAGORIES = require("../model/catagory-model");

module.exports = {
  getcatagory_LIST: () => {
    return new Promise(async (resolve, reject) => {
      const data = await CATAGORIES.find().lean().exec();
      resolve(data);
    });
  },

  // add_product: async(data) => {
  //   console.log(data);
  //   try {
  //     const product = new PRODUCTS({
  //       productTitle : data.productTitle, 
  //       description : data.description,
  //       catagory : data.catagory,
  //       cost : data.cost,
  //     }); 
  //     await product.save();
  //     console.log(product);
  //     return(product);
  //   } catch (err) {
  //     console.log(err);
  //     return err;
  //   }
  // },

  list_product: (pagenum,perPage) => {
    return new Promise(async (resolve, reject) => {
      const data = await PRODUCTS.find().skip((pagenum-1)*perPage).limit(perPage);
      console.log(data,"resttttttttttttttttttttttttttttttttttttttttttttttt");

      if (data) {
        resolve(data);
      } else {
        reject();
      }
    });
  },

  find:(proID)=>{
    return new Promise(async (resolve, reject) => {
      const data = await PRODUCTS.updateOne({_id:proID},{$set:{status: false}});
      console.log(data);


      if(data){
        resolve(data)
      }else{
        reject()
      }
    })
  },
  
  prodcuctfind:(proID)=>{
    return new Promise(async (resolve, reject) => {
      const data = await PRODUCTS.updateOne({_id:proID},{$set:{status: true}});
      console.log(data);


      if(data){
        resolve(data)
      }else{
        reject()
      }
    })
  },

   findall: async(pagenum,perPage)=>{
  
      const data= await PRODUCTS.find().skip((pagenum-1)*perPage).limit(perPage);
       return data

  
   
   },

   findproduct:(productid,data)=>{
    return new Promise(async (resolve, reject) => {
      const pro = await PRODUCTS.updateOne({_id:productid},{$set:{name:data.name,description:data.description,price:data.cost}});
      console.log(pro);


      if(pro){
        resolve(pro)
      }else{
        reject()
      }
    })

   }
};
