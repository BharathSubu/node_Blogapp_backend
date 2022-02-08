const express = require("express")
const User = require("../model/user.model")
const Profile = require("../model/profile.model");
const config = require("../config");
const jwt = require("jsonwebtoken");
//java web token generated for every idividual user
const router = express.Router();
//routes is used from the index page
// Use the express.Router class to create modular, mountable route handlers.
// A Router instance is a complete middleware and routing system;
//  for this reason, it is often referred to as a “mini-app”.
const fs = require('fs');

const middleware = require("../middleware")

router.route("/").get((req,res)=> res.json("Your User Page Got it"));

router.route("/:username").get(middleware.checkToken , (req, res) => {
    User.findOne({ username: req.params.username }, (err, result) => {
      if (err) return res.status(500).json({ msg: err });
      return res.json({
        data: result,
        username: req.params.username,
      });
    });
  });

router.route("/checkusername/:username").get((req, res) => {
    User.findOne({ username: req.params.username }, (err, result) => {
      if (err) return res.status(500).json({ msg: err });
      if (result !== null) {
        return res.json({
          Status: true,//if found return true 
        });
      } else
        return res.json({
          Status: false,// if not found return false
        });
    });
  });

  router.route("/checkEmail/:mail").get((req, res) => {
    User.findOne({ email: req.params.mail }, (err, result) => {
      if (err) return res.status(500).json({ msg: err });
      if (result !== null) {
        console.log(result["username"])
        return res.json({
          Status: true,
          username :result["username"] ,//if found return true 
        });
      } else
        return res.json({
          Status: false,// if not found return false
        });
    });
  });

router.route("/login").post((req, res) => {
    User.findOne({ username: req.body.username }, (err, result) => {
      if (err) return res.status(500).json({ msg: err });
      if (result === null) {
        return res.status(403).json("Username incorrect");
      }
      if (result.password === req.body.password) {
        // here we implement the JWT token functionality
        let token = jwt.sign({ username: req.body.username }, config.key, {
          //  expiresIn:"24h" //token expiring duration
        });
        res.json({
          token: token,
          msg: "success",
        });
      } else {
        res.status(403).json("password is incorrect");
      }
    });
  });
  
router.route("/register").post((req, res) => {
    console.log("inside the register");// checking our entry

    //exported from user.model to create a user object that follows the schema
    //this is being saved in the user database of the mongo db 
    const user = new User({ 
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
    }); //object created from the schema 
    user
      .save() // saving to mongoose
      .then(() => {
        console.log("user registered");
        res.status(200).json({ msg: "User Successfully Registered" });
      })
      .catch((err) => {
        res.status(403).json({ msg: err }); // checeking for the error
      });
  });
  
  router.route("/update/:username").patch( (req, res) => {
    //using patch method to update password
    console.log(req.params.username,"function calling");


       User.findOneAndUpdate( // to find the user and update the password from the collections
      { username: req.params.username },//user name remains the same
      { $set: { password: req.body.password },
      // password is set from the postman body
     },{ new: true },
      (err, result) => {
      
        if (err) return res.json({ msg: err });
        else{
        const msg = {
          msg: "password successfully updated",
          username: req.params.username,
        };
        return res.status(200).json(msg);}
      }
    );

   });
  
  router.route("/delete/:username").delete(middleware.checkToken ,(req, res) => {
    User.findOneAndDelete( //to find the user and delete it from the collections
      { username: req.params.username }, (err, result) => {
      if (err) return res.status(500).json({ msg: err });
      const msg = {
        msg: "User deleted",
        username: req.params.username,
      };
      return res.json(msg);
    });
  });

  router.route("/deletephoto").delete(middleware.checkToken, (req, res) => {
    User.findOne(
      { username: req.decoded.username }
      ,
      (err, result) => {
        if (err) {console.log("deleted"); return res.json(err);}
        else if (result) {
          console.log(result);
          const deleteFile = "uploads/"+result["username"]+".jpg";
          console.log(deleteFile);
          if (fs.existsSync(deleteFile)) {
            fs.unlink(deleteFile, (err) => {
                if (err) {
                    console.log(err);
                  }
                console.log('Image deleted');
                //making the changes in profile
                Profile.findOneAndUpdate(
                  { username: req.decoded.username },
                  {
                    $set: {
                      img:""
                    },
                  },
                  { new: true },
                  (err, result) => {
                    if (err) console.log("Error Updating");
                    if (result == null)  console.log("Profile data not found");
                    else  console.log("Img updated to Null");
                  }
                );
                 })
          }
          console.log(result);
          return res.status(200).json("Blog deleted");
        }
        else{
        return res.json("Blog not deleted");}
      }
    );
  });

  module.exports = router