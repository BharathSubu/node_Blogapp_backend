const express = require("express");
const router = express.Router();
const Complaint = require("../model/complaint.model");
const middleware = require("../middleware");
const multer = require("multer");

const fs = require('fs')


//for image processing
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads"); 
  },
  filename: (req, file, cb) => {
    cb(null, req.params.id + ".jpg");
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 6,
  },
});
//for image processing

router.route("/").get( (req, res) => {
      return res.status(200).json({status:true, data: "hrlloo" });
  });

router
  .route("/add/coverImage/:id")
  .patch(middleware.checkToken, upload.single("img"), (req, res) => {
    Complaint.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          coverImage: req.file.path,
        },
      },
      { new: true },
      (err, result) => {
        if (err) return res.json(err);
        return res.status(200).json(result);
      }
    );
  });

router.route("/add").post(middleware.checkToken, (req, res) => {
  //decoded from the body of the request
  const complaint = Complaint({
    username: req.decoded.username,
    vechileNo: req.body.vechileNo,
    report: req.body.report,
  });//saves under the scehma under The name Complaint
  complaint
    .save()
    .then((result) => {
      // id is sent from automatically generated _id in mongo used as unique id to find the blog
      res.json({ data: result["_id"] });
    })
    .catch((err) => {
      console.log(err), res.json({ err: err });
    });
});

router.route("/getMyComplaint").get(middleware.checkToken, (req, res) => {
  Complaint.find({ username: req.decoded.username }, (err, result) => {
    if (err) return res.json(err);
    return res.status(200).json({status:true, data: result });
  });
});




//deleting our BLog post
router.route("/delete/:id").delete(middleware.checkToken, (req, res) => {
  Complaint.findOneAndDelete(
    {
      $and: [{ username: req.decoded.username }, { _id: req.params.id }],
    },
    (err, result) => {
      if (err) {console.log("deleted"); return res.json(err);}
      else if (result) {
        const deleteFile = result["coverImage"];
        if (fs.existsSync(deleteFile)) {
          fs.unlink(deleteFile, (err) => {
              if (err) {
                  console.log(err);
                }
              console.log('Image deleted');
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

module.exports = router;
