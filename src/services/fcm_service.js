const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
const serviceAccount = require(process.env.FIREBASE_CONFIG_PATH);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const sendNotification = async (deviceToken, title, body, data = {}) => {
  try {
    // Convert all data values to strings
    const stringifiedData = Object.keys(data).reduce((acc, key) => {
      acc[key] =
        typeof data[key] === "object"
          ? JSON.stringify(data[key])
          : String(data[key]);
      return acc;
    }, {});

    const message = {
      token: deviceToken,
      notification: {
        title,
        body,
      },
      data: stringifiedData, // Use the stringified data
    };

    const response = await admin.messaging().send(message);
    console.log("Notification sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw new Error("Failed to send notification.");
  }
};

module.exports = {
  sendNotification,
};
