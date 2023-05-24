const express = require("express");
var userController = require("../controllers/usercontrol");

module.exports = {

userCheck: (req, res, next) =>{
    if (req.session.user) {
        res.redirect('/');
    } else {
        next();
    }


    
},

 logoutcheck:(req,res,next)=>{
    if(req.session.user){
        next();
    }else{
      
        res.redirect("/")
    }
 },

     

   


    admincheck: (req,res,next)=>{
        if(req.session.admin){
            next();   
        }else{
         
            res.redirect('/admin/adminlogin')
        }
    },


    cartuser:(req,res,next)=>{
        if(req.session.user===true){
            res.redirect('/shopproduct')
        }else{
            next()
        }
    },

    ifusercheck:(req,res,next)=>{
        if(req.session.user){
          next()
        }else{
         res.redirect('/login')
        }
    }

    
};
