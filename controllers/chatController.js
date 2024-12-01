const chatModel = require("../models/chatModel");
const userModel = require("../models/userModel");

async function getAllUser(req,res) {
  const users = await userModel.find({});
  return res.status(200).send({ 
      status: 1,
      message: 'data load successful!', 
      users});
}

async function fetchOldMessages(req,res) {
  console.log("Old Messages call");
    try {
       const { user_id } = req.body;
      const old_messages = await chatModel.aggregate([
        {
          $match: { 
            user2: user_id, 
            status: 0 
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
  
      return old_messages;
    } catch (error) {
      console.error("Error fetching messages:", error.message);
    }
  }

module.exports = {
    fetchOldMessages,
    getAllUser
};