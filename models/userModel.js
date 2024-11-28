const mongoose = require("mongoose");

//Scheme
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },email: {
        type: String,
        required: true,
        unique: true, // Email will be unique
    },password:{
        type:String,
        required:true,
    },user_image:{
        type:String,
    },firebase_token:{
        type:String,
    },user_online_time:{
        type:String,
    }
},{timestamps:true});

const User = mongoose.model("user",userSchema);

module.exports = User;