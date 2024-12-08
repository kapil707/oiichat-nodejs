const chatModel = require("./models/chatModel");
const userModel = require("./models/userModel");
const admin = require("./firebase_token/firebase");
const mongoose = require('mongoose');

const {insert_user_online_status} = require("./controllers/userController");


async function sendNotificationToDevice(token, title, body) {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: token, // Firebase token of the target device
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Notification sent successfully:", response);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

const users = {}; // Keep track of connected users

function initializeSocket(io) {
  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Register user
    socket.on("register", (user1) => {
      const username = user1;
      if (users[username] && users[username] === socket.id) {
        console.log(`${username} is already registered with ID: ${socket.id}`);
        return; // Prevent duplicate registration
      }

      // Register the user
      users[username] = socket.id; // Map username to socket ID
      console.log(`${username} registered with socket ID: ${socket.id}`);
      //update online status
      insert_user_online_status(user1,"Online");

      socket.emit('get_user_info_response', {
        status: "Online",
        user_id: user1
      });
    });

    // Handle manual disconnect
    socket.on("manual_disconnect", (username) => {
      console.log(`${username} manually disconnected.`);
      delete users[username];
      insert_user_online_status(username,"offline");
    });

    // Disconnect user
    socket.on("disconnect", () => {
      for (const [username, socketId] of Object.entries(users)) {
        if (socketId === socket.id) {
          delete users[username];
          console.log(`${username} disconnected`);
          insert_user_online_status(username,"offline");
          break;
        }
      }
    });

    // Handle message sending
    socket.on("sendMessage", async ({ user1, user2, message, token,messageId }) => {
      try {
        // insert new chat
        const newMessage = new chatModel({ 
          user1:new mongoose.Types.ObjectId(user1), 
          user2:new mongoose.Types.ObjectId(user2),
          message });
        await newMessage.save();
        
        //status return dayta ha chatroom ko ki message sent hua kya nahi
        socket.emit('messageSent', {
          status: 'success',
          message: 'Message sent successfully',
          token:token,
          messageId:messageId
        });

        const recipientSocketIds = users[user2];
        if (recipientSocketIds) {
          // jab user online ha or chat room me ha to oss ko osi time chat mil jati ha iss say
          const user1_dt = await userModel.findOne({ _id: user1 });
          var user_image = "";
          if(user1_dt.user_image){
            user_image = user1_dt.user_image;
          }
          io.to(recipientSocketIds).emit("receiveMessage", {
            user1, // The sender of the message
            user2, // The recipient of the message
            message, // The content of the message
            user_name:user1_dt.name,
            user_image:user_image,
          });
          //update hota ha ki message user ko recive ho gaya 
          newMessage.status = 1;
          await newMessage.save();
        } else {
          //jab user online nahi ha to firebase say notification jata ha user ko 
          const user1_dt = await userModel.findOne({ _id: user1 });
          const user2_dt = await userModel.findOne({ _id: user2 });
          if(user1_dt && user2_dt){
            var user_name = user1_dt.name;
            var firebaseToken = user2_dt.firebase_token;
            sendNotificationToDevice(firebaseToken,user_name,message);
          }
        }
      } catch (error) {
        console.error("Error saving message:", error.message);
        socket.emit("error", { message: "Failed to save message in the database." });
      }
    });

    // iss say user to user typing ka status jata ha
    socket.on("userTyping", async ({ user1, user2, status }) => {
        const recipientSocketIds = users[user2];
        if (recipientSocketIds) {
          console.log('userTyping');
          io.to(recipientSocketIds).emit("receiveTyping", {
            status:status
          });
        }
    });

    // jab chatroom open hota ha to user ka status yaha say pata chalta ha online yha offline
    socket.on("get_user_info", async (user_id) => {
      const user_dt = await userModel.findOne({ _id: user_id });

      var user_image = "";
      if(user_dt.user_image){
        user_image = user_dt.user_image;
      }
      socket.emit('get_user_info_response', {
        status: user_dt.user_online_time,
        user_id: user_dt._id,
        user_name: user_dt.name,
        user_image: user_image
      });
    });

    //jab user app open karta ha to jo message os ke pass nahi aya yaha say aty ha sabhi unread message
    socket.on("get_old_message", async (user_id) => {
      try {
        console.log("get_old_message call");
    
        const old_messages = await chatModel.aggregate([
          {
            $match: { 
              user2: new mongoose.Types.ObjectId(user_id),
              status:0
            },
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
    
        if (old_messages.length === 0) {
          console.log("No messages found.");
          return socket.emit("get_old_message_response", { messages: [] });
        }

        //jab message user ke pass recive ho jata ha to status 1 ho jata ha 
        await chatModel.updateMany({ user2: user_id, status: 0 }, { $set: { status: 1 } });
    
        // Send the messages back to the client
        socket.emit('get_old_message_response', {
          messages: old_messages // Return all messages as an array
        });
    
        console.log("get_old_message_response sent");
      } catch (error) {
        console.error("Error fetching old messages:", error.message);
        socket.emit('error', { message: 'Failed to fetch old messages.' });
      }
    });

      // call only
      // Listen for signaling data and forward it to the target peer
      // Handle signaling data
      socket.on('signal', (data) => {
        const {your_id, target, signal } = data;
        if (target) {
            console.log(`Signal from ${users[your_id]} to ${target}`);
            io.to(target).emit('signal', { signal, sender: users[your_id] });
        } else {
            console.log(`Target not found: ${target}`);
        }
      });

    //new

    socket.on('calling', (data) => {
      const {user1, user2, signal } = data;
      if (user2) {
          console.log(`Signal from ${users[user1]} to ${user2}`);
          io.to(user2).emit('incoming_call', { signal, sender: users[user1] });
      } else {
          console.log(`user2 not found: ${user2}`);
      }
    });

    socket.on('incoming_call_answer', (data) => {
      const {user1, target, signal } = data;
      if (target) {
          console.log(`incoming_call_answer from ${users[user1]} to ${target}`);
          io.to(target).emit('incoming_call_answer_done', { signal, sender: users[user1] });
      } else {
          console.log(`user2 not found: ${target}`);
      }
    });

    socket.on("get_user_2_socket_id", (user2) => {
      console.log(`${user2} get_user_2_socket_id`);
      const recipientSocketIds = users[user2];
      socket.emit('get_user_2_socket_id_response', {
        user2:recipientSocketIds
      });
    });
  });
}

module.exports = initializeSocket;
