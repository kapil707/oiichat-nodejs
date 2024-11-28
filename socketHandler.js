const chatModel = require("./models/chatModel");
const userModel = require("./models/userModel");
const admin = require("./firebase_token/firebase"); // Import initialized Firebase Admin

async function insert_user_online_status(user1,status) {
  
  const result = await userModel.findByIdAndUpdate(
    user1, // User ID (_id)
    { user_online_time: status }, // Update field
    { new: true } // Option to return the updated document
  );
  
  //console.log("Updated User:", result);
}

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
        const newMessage = new chatModel({ user1, user2, message });
        await newMessage.save();
        
        socket.emit('messageSent', {
          status: 'success',
          message: 'Message sent successfully',
          token:token,
          messageId:messageId
        });

        const recipientSocketIds = users[user2];
        if (recipientSocketIds) {
          //jab user active ha
          const user1_dt = await userModel.findOne({ _id: user1 });
          io.to(recipientSocketIds).emit("receiveMessage", {
            user1, // The sender of the message
            user2, // The recipient of the message
            message, // The content of the message
            user_name:user1_dt.name,
            user_image:user1_dt.user_image,
          });
          console.log(`user1_dt.user_image: ${user1_dt.user_image}`);
          // Update status to Delivered (1)
          newMessage.status = 1;
          await newMessage.save();
          //console.log(`receiveMessage: ${recipientSocketIds}`);
        } else {
          //jab user offline ha to
          //const userId = mongoose.Types.ObjectId(user2); // Convert string to ObjectId
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

    // Handle message sending
    socket.on("get_user_info", async ({ user_id }) => {
      socket.emit('get_user_info_response', {
        status: 'online',
        user_id: user_id
      });
    });
  });
}

module.exports = initializeSocket;
