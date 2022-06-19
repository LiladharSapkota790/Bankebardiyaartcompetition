require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const fs = require('fs');
const path = require('path');
const findOrCreate = require('mongoose-findorcreate');
const session = require("express-session");
const passport = require("passport");

const passportLocalMoongoose = require("passport-local-mongoose");



/*here multer is for file uploading*/
const multer = require('multer');


/*<>connecting to db<>*/
const dburi = process.env.MONGO_URL_CLOUD;
mongoose.connect(dburi, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, err => {
  console.log('connected to dB')
});


const app = express();
app.use(bodyParser.urlencoded({
  extended: false
}))

app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine", "ejs");



/*  settung up multer for storing uploaded files*/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now())
  }
});

const upload = multer({
  storage: storage
});









/*Requiring imagemodel here*/
const imgModel = require('./model/imagemodel');



const User = require('./model/usermodel');

/*this is initial configuration of session*/

console.log(process.env.SECRET);

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true
}));


/*initialize the passport */
app.use(passport.initialize());
app.use(passport.session());


passport.use(User.createStrategy());
/*passport.use(new LocalStrategy(User.authenticate()));*/

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});








app.get('/upload', (req, res) => {
  res.render("uploadform");

});



/*authentication */

app.get("/login", function(req, res) {
  res.render("login");
})


/*
handling Login*/
app.post("/login", function(req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err) {
    console.log(user);
    if (err) {
      console.log(err);
      res.redirect("/login");
    } else {
      passport.authenticate("local")(req, res, function() {
        /*  alert("you are logged in Successfully..");*/
        res.redirect("/gallery");
      })
    }
  })


})


app.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    alert("you are logged Out Successfully..");
    res.redirect('/');
  });
});



app.get("/register", function(req, res) {
  res.render("register");
})



/*handling register */
app.post("/register", function(req, res) {

  User.register({
      username: req.body.username
    }, req.body.password, function(err, user) {
      console.log(user + " found");
      if (err) {
        console.log(err);
        res.redirect("/register");

      } else {

        passport.authenticate("local")(req, res, function() {
          res.send("Your account has beeen created successfully..");
        })
      }

    }



  )


})









app.get("/", (req, res) => {
  res.render("index");
});


app.post('/', upload.single('image'), (req, res, next) => {
  var obj = {
    name: req.body.name,
    desc: req.body.desc,
    fullname: req.body.fullname,
    email: req.body.email,
    number: req.body.number,
    district: req.body.district,
    municipalityname: req.body.municipalityname,
    wardno: req.body.wardno,
    img: {
      data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
      contentType: 'image'
    }
  }
  imgModel.create(obj, (err, item) => {
    /*    console.log(obj);*/
    if (err) {
      console.log(err);
    } else {
      // item.save();
      res.render('thanks');
    }
  });
});



app.get("/gallery", (req, res) => {
  if (req.isAuthenticated()) {
    imgModel.find({}, (err, images) => {
      if (err) {
        console.log(err);
        res.status(500).send('An error occurred', err);
      } else {
        /*  console.log(images);*/

        res.render('gallery', {
          images: images
        });
      }
    });
  } else {
    res.redirect("/login");
  }
})









app.get("/uploads/:uploadId", (req, res) => {
  const requestImageID = req.params.uploadId;
  imgModel.findOne({
    _id: requestImageID
  }, function(err, foundItem) {
    console.log(foundItem.wardno);
    console.log(foundItem.fullname);
    if (!err) {
      const imagetype = foundItem.img.contentType;
      const imgdata = foundItem.img.data.toString('base64');

      if (req.isAuthenticated()) {
        res.render("image", {
          name: foundItem.name,
          desc: foundItem.desc,
          email: foundItem.email,
          number: foundItem.number,
          imagetype: imagetype,
          imgdata: imgdata,
          fullname: foundItem.fullname,
          district: foundItem.district,
          municipalityname: foundItem.municipalityname,
          wardno: foundItem.wardno
        });

      } else {
        res.render("login");
      }

    }

  });

});









// Step 9 - configure the server's port

const port = process.env.PORT ? process.env.PORT : 4000;

/*if (port == null || port == "") {
  port = 3000;
}*/



app.listen(port, err => {
  if (err)
    throw err
  console.log('Server listening on port', port)
})
