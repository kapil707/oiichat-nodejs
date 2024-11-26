const mongoose = require("mongoose");

//Scheme
const blogSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },description:{
        type:String,
    },image:{
        type:String,
    },
},{timestamps:true});

const Blog = mongoose.model("blog",blogSchema);

module.exports = Blog;