const admin = require("./firebase"); // Import initialized Firebase Admin

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
