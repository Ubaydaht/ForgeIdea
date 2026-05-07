const mongoose = require("mongoose")


let userSchema = mongoose.Schema({
  firstname: {type: String, required: true},
  lastname: {type: String, required: true},
  email: {type: String, required: true, unique:[true, "Email has been taken, please choose another one"]},
  password: {type: String, required: true},
  profilePicture: {
    type: String,
    default: "",
  },

})




const User = mongoose.model('User', userSchema);
module.exports = User;


 