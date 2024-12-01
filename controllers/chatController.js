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
  const users = await userModel.find({});
  return res.status(200).send({ 
    status: 1,
    message: 'data load successful!', 
    users});
}

module.exports = {
    fetchOldMessages,
    getAllUser
};