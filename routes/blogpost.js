const express = require("express");
const router = express.Router();
const BlogPost = require("../model/blogpost.model");
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

router
  .route("/add/coverImage/:id")
  .patch(middleware.checkToken, upload.single("img"), (req, res) => {
    BlogPost.findOneAndUpdate(
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
  const blogpost = BlogPost({
    username: req.decoded.username,
    title: req.body.title,
    body: req.body.body,
  });//saves under the scehma under The name BlogPost
  blogpost
    .save()
    .then((result) => {
      // id is sent from automatically generated _id in mongo used as unique id to find the blog
      res.json({ data: result["_id"] });
    })
    .catch((err) => {
      console.log(err), res.json({ err: err });
    });
});

router.route("/getOwnBlog").get(middleware.checkToken, (req, res) => {
  BlogPost.find({ username: req.decoded.username }, (err, result) => {
    if (err) return res.json(err);
    return res.status(200).json({status:true, data: result });
  });
});

//response that is showen in the home page
router.route("/getOtherBlog").get(middleware.checkToken, (req, res) => {
  //$ne(not equalto) returns data expect the blog under username 
  BlogPost.find({ username: { $ne: req.decoded.username } }, (err, result) => {
    if (err) return res.json(err);
    return res.status(200).json({status:true, data: result });
  });
});


//deleting our BLog post
router.route("/delete/:id").delete(middleware.checkToken, (req, res) => {
  BlogPost.findOneAndDelete(
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
