const express = require("express");
const router = express.Router();
const Profile = require("../model/profile.model");
const middleware = require("../middleware");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  //the path where its to be stored
  //cb callback function
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  //filename of the uploades image
  filename: (req, file, cb) => {
    cb(null, req.decoded.username + ".jpg");
  },

});

const fileFilter = (req, file, cb) => {
  if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

//multer package instage
const upload = multer({
  //it defines the path where we will store the image 
  //instance for the storage
  storage: storage,
  //limiting the size of the file
  limits: {
    fileSize: 1024 * 1024 * 6,
  },
  //fileFilter: fileFilter,
});



//adding and update profile image
router
  .route("/add/image")
  //patch method is used becos we have have already used defined img url for the profile
  //model as an empty string
  //middelware is used check for the user 
  //upload.single is used to upload a single image
  .patch(middleware.checkToken, upload.single("img"), async (req, res) => {
    await Profile.findOneAndUpdate(
      { username: req.decoded.username },
      { //setting the img value
        $set: {
          //this instance is gotten from our mutter instance
          img: req.file.path,
        },
      },
      { new: true },
      (err, profile) => {
        if (err) return res.status(500).send(err);
        const response = {
          message: "image added successfully updated",
          data: profile,
        };
        return res.status(200).send(response);
      }
    );
  });

router.route("/checkProfile").get(middleware.checkToken, (req, res) => {
  //finding the profile data of the user from mongodb database
    Profile.findOne({ username: req.decoded.username }, (err, result) => {
      if (err) return res.json({ err: err });
      else if (result == null) {
        return res.json({ status: false, username: req.decoded.username });
      } else {
        return res.json({ status: true, username: req.decoded.username });
      }
    });
  });


router.route("/getData").get(middleware.checkToken, (req, res) => {
    //finding the profile data of the user from mongodb database
    Profile.findOne({ username: req.decoded.username }, (err, result) => {
      if (err) return res.json({ err: err });
      if (result == null) return res.json({ data: [] });
      else return res.json({ data: result });
    });
  });

router.route("/add").post(middleware.checkToken, (req, res) => {
    const profile = Profile({
      //username is sent from the request becos this request is made only after we login
      username: req.decoded.username,
      //sent from the body
      name: req.body.name,
      profession: req.body.profession,
      DOB: req.body.DOB,
      titleline: req.body.titleline,
      about: req.body.about,
    });
    //stroing the profile in mongodb
    profile
      .save()
      .then(() => {
        return res.json({ msg: "profile successfully stored" });
      })
      .catch((err) => {
        return res.status(400).json({ err: err });
      });
  });
  
  //updating the fields in profile 
  router.route("/update").patch(middleware.checkToken, async (req, res) => {
    let profile = {};
    try{
    await Profile.findOne({ username: req.decoded.username }, (err, result) => {
         profile = result;
          Profile.findOneAndUpdate(
          { username: req.decoded.username },
          {
            $set: {
              name: req.body.name ? req.body.name : profile.name,
              profession: req.body.profession
                ? req.body.profession
                : profile.profession,
              DOB: req.body.DOB ? req.body.DOB : profile.DOB,
              titleline: req.body.titleline ? req.body.titleline : profile.titleline,
              about: req.body.about ? req.body.about : profile.about, //about:""
            },
          },
          { new: true },
          (err, result) => {
            if (err) return res.json({ err: err });
            if (result == null) return res.json({ data: [] });
            else return res.json({ data: result });
          }
        );
    }
    )}
    catch (error) { 
            profile = {};
    }     
    
  });

  module.exports  = router;