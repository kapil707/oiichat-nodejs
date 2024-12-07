const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require("../models/userModel");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// async function getAllUserKapil() {
//     return await userModel.find({});
// }

async function profile_upload(req,res) {
    try {
        // Check if file is uploaded
        if (!req.file) {
          return res.status(400).send({
            status: 0,
            message: 'No file uploaded!',
          });
        }
    
        // Get file details
        const filePath = req.file.path;
    
        // Optionally save the file path to your database
        // Example: Save to user's profile in MongoDB
        const { user_id } = req.body;
        console.log('user_id:', user_id);
        const result = await userModel.findByIdAndUpdate(user_id, { user_image: filePath });
    
        res.status(200).send({
          status: 1,
          message: 'File uploaded successfully!',
          filePath: filePath, // Return file path or URL
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send({
          status: 0,
          message: 'File upload failed!',
          error: error.message,
        });
      }
    }

async function getAllUser(req,res) {
    // const users = await userModel.find({});
    // return res.status(200).send({ 
    //     status: 1,
    //     message: 'data load successful!', 
    //     users});

    const users = await userModel.find({}, '_id name user_image');
    return res.status(200).send({
      status: 1,
      message: 'Data load successful!',
      users,
    }); 

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
    
        user_image = "default.png";
        if(user.user_image){
          user_image = user.user_image;
        }
        res.status(200).send({ 
            status: 1,
            message: 'Login successful!', 
            users:{
                user_id:user._id,
                user_email:user.email,
                user_name:user.name,
                user_image:user_image,
            }
        });
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
}

async function registerUserOrLoginUser(req, res) {
  try {
    const { uid, type, name, email, user_image, firebase_token } = req.body;

    // Check if the user already exists
    let user = await userModel.findOne({ email });

    if (!user) {
      // If the user doesn't exist, create a new user
      user = new userModel({
        uid,
        type,
        name,
        email,
        user_image: user_image || "default.png", // Use default image if not provided
      });
      await user.save();
    }

    // Update the user's Firebase token
    await userModel.updateOne(
      { email }, // Find user by email
      { $set: { firebase_token: firebase_token } } // Update Firebase token
    );

    // Ensure `user_image` has a fallback
    const finalUserImage = user.user_image || "default.png";

    // Send response
    res.status(200).send({
      status: 1,
      message: "Login successful!",
      users: {
        user_id: user._id,
        user_email: user.email,
        user_name: user.name,
        user_image: finalUserImage,
      },
    });
  } catch (error) {
    console.error("Error in registerUserOrLoginUser:", error.message);

    res.status(500).send({
      status: 0,
      message: "An error occurred. Please try again!",
      error: error.message, // Optional: Send error details for debugging
    });
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

async function insert_user_online_status(user1,status) {
  
  const result = await userModel.findByIdAndUpdate(
    user1, // User ID (_id)
    { user_online_time: status }, // Update field
    { new: true } // Option to return the updated document
  );
  
  //console.log("Updated User:", result);
}

module.exports = {
    loginUser,
    registerUser,
    getAllUser,
    profile_upload,
    insert_user_online_status,
    registerUserOrLoginUser
};