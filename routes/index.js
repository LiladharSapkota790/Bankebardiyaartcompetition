const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const User = require('../model/usermodel');
const imgModel = require('../model/imagemodel');
/*const {
  ensureAuthenticated,
  forwardAuthenticated
} = require('../config/auth');*/

// Welcome Page
router.get("/", (req, res) => {
  res.render("index");
});



router.get("/gallery", (req, res) => {
    if (req.isAuthenticated()) {
      imgModel.find({}, (err, images) => {
        if (err) {
          console.log(err);
          res.status(500).send('An error occurred', err);
        } else {
          // console.log(images);

          res.render('gallery', {
            images: images
          });
        }
      });
    } else {
      res.redirect("/users/login");

    }

  }


)







module.exports = router;
