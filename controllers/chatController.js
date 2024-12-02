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
        $match: { user2: user_id},
      },
      {
        $lookup: {
          from: "users",
          localField: "user1",
          foreignField: "_id",
          as: "user1_info",
        },
      },{
        $unwind: {
          path: "$user1_info",
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