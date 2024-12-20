const mongoose = require("mongoose");

//Scheme
const chatSchema = new mongoose.Schema({
  user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: String,
  status: {
    type: Number,
    default: 0, // Default status is "0" (Sent)
    enum: [0, 1, 2], // Allowed values: 0 (Sent), 1 (Delivered), 2 (Read)
  },
  timestamp: { type: Date, default: Date.now },
});

const Chat = mongoose.model("chat",chatSchema);

module.exports = Chat;