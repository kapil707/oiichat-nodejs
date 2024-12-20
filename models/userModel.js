const mongoose = require("mongoose");

//Scheme
const userSchema = new mongoose.Schema({
    uid:{
        type:String,
        required:true,
    },
    type:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },email: {
        type: String,
        required: true,
        unique: true, // Email will be unique
    },password:{
        type:String,
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