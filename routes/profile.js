const express = require("express");
const router = express.Router();
const Profile = require("../model/profile.model");
const middleware = require("../middleware");

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

  module.exports  = router;