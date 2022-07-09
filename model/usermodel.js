const mongoose = require("mongoose");

const findOrCreate = require('mongoose-findorcreate');
const passportLocalMoongoose = require("passport-local-mongoose");
const passport = require("passport");

const userSchema = new mongoose.Schema({
  username: String,
  password:String

});


/*using session on userSChema using plugin*/
userSchema.plugin(passportLocalMoongoose);

/*for findorcreate google auh*/

userSchema.plugin(findOrCreate);
const User = new mongoose.model("User", userSchema);



passport.use(User.createStrategy());
/*passport.use(new LocalStrategy(User.authenticate()));*/

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});




module.exports = User;
