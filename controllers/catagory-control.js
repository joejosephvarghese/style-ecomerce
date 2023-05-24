const catagoryHelper = require("../helpers/catagoryHelper");
const Category = require("../model/catagory-model");

module.exports = {
  get_catagories: async (req, res) => {
    try {
      const categories = await Category.find();
      res
        .status(200)
        .render("admin/catagories", {
          layout: "admin-layout",
          admin: true,
          datas: categories,
        });
    } catch (error) {
      res.status(500).json({ message: "Internal sever error" });
    }
  },


  add_catagory: async (req, res) => {
    console.log(req.body, "fghjklsdfg");
    try {
      const existingCategory = await Category.findOne({ name: req.body.name });
      if (existingCategory) {
        // Category already exists
        res.status(200).json({ status: false });
      } else {
        // Create and save new category
        const category = new Category(req.body);
        await category.save();
        res.status(200).json({ status: true });
      }
    } catch (error) {
      console.log(error.code);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  


  
  Delete_cata: (req, res) => {
    // console.log(req.params.id);
    const cataId = req.params.id;
    console.log("id is", cataId);

    catagoryHelper
      .DeleteCatagory(cataId)
      .then(res.redirect("/admin/catagories"));
  },

  list_cata: (req, res) => {
    const listID = req.params.id;
    console.log("lst id$$$$$$", listID);
    catagoryHelper
      .relistcatagory(listID)
      .then(res.redirect("/admin/catagories"));
  },

  getEditcatagory_page:async (req, res) => {
    CATID = req.params.id;

    const categories = await Category.find({ _id:CATID });
  console.log(categories,"lllll");
    res.render("../views/admin/edit-catagory", {
      layout: "admin-layout",
      admin: true,
      CATID,categories
    });
  },

  edit_catagory: (req, res) => {
    const catID = req.params.id;
    const editedcata = req.body.Catagory;
    console.log(editedcata, "cataaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    // const editeddescri = req.body.Description;

    catagoryHelper
      .find_catagory(editedcata, catID)
      .then(res.redirect("/admin/catagories"));
  },
};
