const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require("../models/userModel")

// async function getAllUserKapil() {
//     return await userModel.find({});
// }

async function getAllUser(req,res) {
    const users = await userModel.find({});
    return res.status(200).send({ 
        status: 1,
        message: 'data load successful!', 
        users});
}

// async function insertUser(req,res) {
//     const body = req.body;
//     if(!body){
//         return res.status(400).json({msg:'enter all enters'});
//     }else{
//        const result = await userModel.create({
//             firstName:body.firstName,
//             lastName:body.lastName
//         });
//         return res.status(201).json({msg:'sucess',id:result.id});
//     }
// }

// async function deleteUser(req,res) {
//     const result = await User.findByIdAndDelete(req.params.id);
//     return res.status(200).json({msg:'sucess'});
// }

async function loginUser(req,res) {
    try {
        const { email, password, firebase_token } = req.body;
        //console.log("firebase_token : "+firebase_token);
        // Find user by email
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(200).send({
                status:0,
                message: 'User not found!'
            });
        }
    
        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(200).send({ 
                status:0,
                message: 'Invalid credentials!'
            });
        }

        // Update the user's Firebase token in the database
        await userModel.updateOne(
            { email }, // Find user by email
            { $set: { firebase_token: firebase_token } } // Update Firebase token
        );
    
        // Generate JWT token
        /*const token = jwt.sign({ id: user._id, email: user.email }, 'SECRET_KEY', {
          expiresIn: '1h',
        });*/
    
        res.status(200).send({ 
            status: 1,
            message: 'Login successful!', 
            users:{
                user_id:user._id,
                user_email:user.email,
                user_name:user.name
            }
        });
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
}

async function registerUser(req,res) {
    try {
        const { name, email, password } = req.body;
    
        // Password hashing
        const hashedPassword = await bcrypt.hash(password, 10);
    
        const user = new userModel({
          name,
          email,
          password: hashedPassword,
        });
    
        await user.save();
        res.status(201).send({ 
            status:1,
            message: 'User registered successfully!' 
        });
      } catch (error) {
        res.status(201).send({ 
            status:0,
            message: 'this email id already exists!' 
        });
      }
}

module.exports = {
    loginUser,
    registerUser,
    getAllUser
};