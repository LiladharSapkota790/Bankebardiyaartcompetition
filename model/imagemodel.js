const mongoose = require("mongoose");
// Step 6 - load the mongoose model for Image



const imageSchema = new mongoose.Schema({
  name: String,
  desc: String,
  fullname: String,
  email: String,
  number: String,
  district: String,
  municipalityname: String,
  wardno: String,
  img: {
    data: Buffer,
    contentType: String
  },
  date:Date, 
  userid: {
        type: String,
        ref: "userModel" // Make a ref to UserModel, this is the mongoose model value
    },
});


const Image = new mongoose.model('Image', imageSchema);
module.exports = Image;
