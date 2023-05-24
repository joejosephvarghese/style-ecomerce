const CATAGORIES = require("../model/catagory-model");

module.exports = {

  catagorycheck: (cata) => {
    return new Promise(async (resolve, reject) => {
      try {
        const catagory = await CATAGORIES.findOne({ Catagory: cata  });

        if (catagory){


        resolve(catagory);
        }else{


            resolve(null)
        }


      } catch (err) {
        console.error(err);
        reject(new Error('Server error'));
      }
    });
  },

  saveCatagory: (catagory) => {
    // console.log(catagory);
    return new Promise(async (resolve, reject) => {
      try {
        const catagoryDetails = new CATAGORIES({
          Description: catagory.Description,
          Catagory: catagory.Catagory,
          status: true,
        });
        await catagoryDetails.save();
        resolve(catagoryDetails);
      } catch (err) {
        console.error(err);
        reject(new Error('Server error'));
      }
    });
  },

  getallCatagory:()=>{
  
    return new Promise(async (resolve,reject)=>{
  let Allcata=await CATAGORIES.find();
  //  console.log(Allcata);
  resolve(Allcata);
    });

},

DeleteCatagory:(cataId)=>{
 
  return new Promise(async(resolve, reject) => {
    try {
      const cat = await CATAGORIES.updateOne({_id:cataId}, {$set:{status:false}});
      console.log(cat);
      if(cat){
        resolve(cat);
      } else {
        resolve();
      }
    } catch (error) {
      reject(error);
    }
  });
},


    relistcatagory:(listID)=>{

      return new Promise(async(resolve,reject)=>{
        const list=await CATAGORIES.updateOne({_id:listID},{$set:{status:true}})

         if(list){
          resolve(list)
         }else{
          resolve()
         }
      })
    },


    find_catagory:(editedcata,catID)=>{
      return new Promise(async(resolve,reject)=>{
         try {
           const data=  await CATAGORIES.updateOne({_id:catID},{$set:{name:editedcata}})
           if(data){
             resolve(data)
           }else{
             resolve();
           }
         } catch (err) {
           reject(err);
         }
      })
 },


 
  
  
}
  

    
            
            