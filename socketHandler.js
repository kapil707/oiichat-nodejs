const chatModel = require("./models/chatModel");
const admin = require("./firebase_token/firebase"); // Import initialized Firebase Admin

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
    });

    // Handle manual disconnect
    socket.on("manual_disconnect", (username) => {
      console.log(`${username} manually disconnected.`);
      delete users[username];
    });

    // Disconnect user
    socket.on("disconnect", () => {
      for (const [username, socketId] of Object.entries(users)) {
        if (socketId === socket.id) {
          delete users[username];
          console.log(`${username} disconnected`);
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

        // Example usage
        const firebaseToken = "e5dLRzmvRoGYGp5-dG8hur:APA91bHNgVSGNxg6VK7kzlg5dryzJsW3frZ3B43GVVC6fz49APsvRsEUaOkVLhOOfnGrzoGK4RNHWXi0w1HiuPV3xF6z-VQYWbiULOdStjxovXdCjhZnDO8";
        sendNotificationToDevice(firebaseToken, "Hello", "This is a test notification");

        //console.log(`user2: ${user2}`);

        const recipientSocketIds = users[user2];
        if (recipientSocketIds) {
          io.to(recipientSocketIds).emit("receiveMessage", {
            user1, // The sender of the message
            user2, // The recipient of the message
            message, // The content of the message
          });
          // Update status to Delivered (1)
          newMessage.status = 1;
          await newMessage.save();
          //console.log(`receiveMessage: ${recipientSocketIds}`);
        } else {
          socket.emit("user_offline", {
            user2,
            message: `User ${user2} is offline.`,
          });
        }
      } catch (error) {
        console.error("Error saving message:", error.message);
        socket.emit("error", { message: "Failed to save message in the database." });
      }
    });
  });
}

module.exports = initializeSocket;
