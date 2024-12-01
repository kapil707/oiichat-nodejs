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

  try {
    const { user_id } = req.body;
    const old_messages = await chatModel.aggregate([
      {
        $match: { 
          user2: user_id, 
        },
      },
      {
        $lookup: {
          from: "users", // Ensure this matches your collection name
          localField: "user1",
          foreignField: "_id",
          as: "user1_info",
        },
      },
      {
        $unwind: "$user1_info",
      },
    ]);

    console.log("Old Messages with User Info:", old_messages);

    return res.status(200).send({ old_messages:old_messages });
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch messages", error: error.message });
  }
}

module.exports = {
    fetchOldMessages,
    getAllUser
};