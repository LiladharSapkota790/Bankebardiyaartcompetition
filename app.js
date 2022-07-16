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
const flash = require('connect-flash');

const passportLocalMoongoose = require("passport-local-mongoose");



/*here multer is for file uploading*/
const multer = require('multer');


const app = express();
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine", "ejs");
// Connect flash
app.use(flash());

// Session always before mongodb

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true
}));


/*initialize the passport */
app.use(passport.initialize());
app.use(passport.session());







/*<>connecting to db<>*/
/*const dburi = process.env.MONGO_URL_CLOUD;*/
/*const dburi = process.env.LOCALMONGOURL;*/
/*/*console.log(dburi);*/
/*mongoose.connect(dburi, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}, err => {
  console.log('connected to dB')
});
*/

/*mongoose.connect(
  process.env.MONGO_URL_CLOUD,
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
  () => {
    console.log('Connected to MongoDB');
  }
);
*/
/*connecting mongoatlas*/

const dburi = process.env.MONGO_URL;

mongoose.connect('dburi', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },


  () => {
    console.log("Connected to live database BAnkebd");
  }
);





/*mongoose.connect("mongodb://localhost:27017/BankebardiyaDB", {
  useNewUrlParser: true
});*/

/*Requiring imagemodel here*/
const imgModel = require('./model/imagemodel');

const User = require('./model/usermodel');









/*this is initial configuration of session*/

console.log(process.env.SECRET);





// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});


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



// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));


app.get('/upload', (req, res) => {
  res.render("uploadform");

  /*This is new code added This code to verify user */
  /*  if (req.isAuthenticated()) {
      res.render("uploadform");
    } else {
      res.render("login");
    }*/
});










app.post('/upload', upload.single('image'), (req, res, next) => {

  //  const User = require('./model/usermodel');
  //   app.use('/users', require('./routes/users.js'));
  //   console.log(req.user);
  //   console.log(req.user._id);



  var newImage = {
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
    },
    date: Date.now()
  }



  imgModel.create(newImage, (err, item) => {
    /*    console.log(obj);*/
    if (err) {
      console.log(err);
    } else {
      res.redirect("/thanks");
      // /*  User.findById(req.user._id, function(err, founduser) {
      // founduser.newImage = newImage;
      // founduser.save(function(){
      //   res.render("thanks");
      // })
      //   })*/



      /*      // item.save();
            console.log(req.user);
            console.log(req.item)
              res.render("thanks");
          ;*/
    }
  });
});







app.get("/thanks", (req, res) => {
  res.render("thanks");
})




app.get("/uploads/:uploadId", (req, res) => {
  const requestImageID = req.params.uploadId;
  imgModel.findOne({
    _id: requestImageID
  }, function(err, foundItem) {
    console.log(foundItem.wardno);
    console.log(foundItem.fullname);
    console.log("Ddate: " + foundItem.date);
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



// To catcha an error and send a not found page

app.get("*", (req, res) =>{
  res.status(404).render('error');
})




// Sending alert message


const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const msg = {
  to: 'sapkotaliladhar12417@gmail.com', // Change to your recipient
  from: 'officialliladhar2314@gmail.com', // Change to your verified sender
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js'

}

sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })


// Step 9 - configure the server's port

const port = process.env.PORT ? process.env.PORT : 33000;

/*if (port == null || port == "") {
  port = 3000;
}*/



app.listen(port, err => {
  if (err)
    throw err
  console.log('Server listening on port', port)
})
