const express = require('express');

const mongoose = require("mongoose");

const router = express.Router();
const passport = require('passport');
const flash = require('connect-flash');

const passportLocalMoongoose = require("passport-local-mongoose");

// Load User model
const User = require('../model/usermodel');
const Image = require('../model/imagemodel');


// Login Page
router.get('/login', (req, res) => res.render('login'));

// Register Page
router.get('/register', (req, res) => res.render('register'));

// Register
router.post("/register", function(req, res) {

  User.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);

      res.render("register", {
        err: err
      });
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/users/login");
      });
    }
  });

});






// Login

router.post("/login", function(req, res) {

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        req.flash('success', 'Registration successfully, go ahead and login.')
        res.redirect("/");
      });
    }
  });

});



//for all  users

router.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req.user.id);
    /*User.find({}, (err, users) => {*/
    User.find({}, function(err, users) {


      if (err) {
        console.log(err);
        res.status(500).send('An error occurred', err);
      } else {
        console.log(users);


        res.render('admindashboard', {
          users: users
        });
      }
    });
  } else {
    res.redirect("/users/login");
  }
})


//to get individual user

router.get("/allusers/:userid", (req, res) => {

  console.log(req.params);
  res.send("I am working");
})


// Dashboard
router.get("/dashboard", (req, res) => {

  Image.find({}, (err, images) => {
    if (!err) {
      console.log(images);
      res.render("dashboard", {
        images: images
      });


    }
  })



})






/*router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});*/

// Logout
/*router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});*/


router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/users/login');
  });
});







module.exports = router;
