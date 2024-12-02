const chatModel = require("../models/chatModel");
const userModel = require("../models/userModel");
const mongoose = require('mongoose');

async function getAllUser(req,res) {
  const users = await userModel.find({});
  return res.status(200).send({ 
      status: 1,
      message: 'data load successful!', 
      users});
}

async function fetchOldMessages(req,res) {
  // const users = await userModel.find({});
  // return res.status(200).send({ 
  //   status: 1,
  //   message: 'data load successful!', 
  //   users});

  const { user_id } = req.body; 
  console.log("Received user_id:", user_id);
  console.log("Converted user_id:", new mongoose.Types.ObjectId(user_id));

  try {
    const old_messages = await chatModel.aggregate([
      {
        $match: { user2: new mongoose.Types.ObjectId(user_id) },
      },
      {
        $lookup: {
          from: "users", // The collection to join with
          localField: "user1", // The local field to match
          foreignField: "_id", // The foreign field to match
          as: "user1_info", // The name of the output array
        },
      },
      {
        $unwind: "$user1_info", // Deconstruct user1_info array into individual documents
      },
      {
        $project: {
          _id: 1, // Include the fields you need from the chatModel
          user1: 1,
          user2: 1,
          message: 1,
          status: 1,
          timestamp: 1,
          user_name: "$user1_info.name",
          user_image: "$user1_info.user_image", 
        },
      },
    ]);


    console.log("Old Messages with User Info:", old_messages);

    res.status(200).json({ success: true, messages: old_messages });
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch messages", error: error.message });
  }
}

module.exports = {
    fetchOldMessages,
    getAllUser
};