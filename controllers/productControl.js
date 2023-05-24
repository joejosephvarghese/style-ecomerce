const { Reject } = require("twilio/lib/twiml/VoiceResponse");
const productHelper = require("../helpers/productHelper");
const Product = require("../model/Product-model");
const Category = require("../model/catagory-model");
const Banner = require("../model/Bannermodel");

module.exports = {
  get_addproductpage: async (req, res) => {
    try {
      const categories = await Category.find({ status: true });
      res.status(200).render("admin/addProduct", {
        layout: "admin-layout",
        admin: true,
        categories,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  add_product: async (req, res) => {
    const { name, description, category, price,stock} = req.body
    try {
      if (req.files) {
        let i = 1;
        const result = req.files.reduce((acc, obj) => {
          const key = `image${i}`
          acc[`${key}`] = obj.path;
          i++;
          return acc;
        }, {});
        
        const newProduct = new Product({
          name: name,
          description: description,
          category: category,
          price: price,
          stock:stock,
          images: result
        });
        await newProduct.save();
      }
      res.status(200).redirect("/admin/addproduct");
    } catch (error) {
      res.status(500).send(error);
    }
  },

  delete_product:(req,res)=>{
    const proID = req.params.id;
    productHelper.find(proID).then(res.redirect("/admin/productlist"))
    },

  list_product:(req,res)=>{
      const proID = req.params.id;
      productHelper.prodcuctfind(proID).then(res.redirect("/admin/productlist"))
      },

      edit_product: async (req, res) => {
        const productid=req.params.id

        try {
          const categories = await Category.find({ status: true });
          const product= await  Product.findOne({_id:productid}).lean().exec();
          console.log(product);
          res.status(200).render("admin/editProduct", {layout: "admin-layout", admin: true, categories,product,});
        } catch (error) {
          res.status(500).json({ message: "Internal server error" });
        }
      },

      updateproduct:(req,res)=>{
       const productid=req.params.id
       console.log(req.file,"lkk")
       let data=req.body
      
        productHelper.findproduct(productid,data).then(res.redirect("/admin/productlist"));

        },
            
        add_banner: async (req, res) => {
          const { title, description} = req.body
          
          try {
            if (req.files) {
              let i = 1;
              const result = req.files.reduce((acc, obj) => {
                const key = `image${i}`
                acc[`${key}`] = obj.path;
                i++;
                return acc;
              }, {});
              
              const newProduct = new Banner({
                title: title,
               
                description: description,
                images: result,
                
              });
              await newProduct.save();
            }
            res.status(200).redirect("/admin/add-banner");
          } catch (error) {
            res.status(500).send(error);
          }
         
      },
    }
