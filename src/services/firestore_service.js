const admin = require("firebase-admin");

const db = admin.firestore();

const saveDeviceToken = async (mobileId, deviceToken) => {
  try {
    await db.collection("devices").doc(mobileId).set(
      {
        deviceToken,
        notificationCount: 0,
        currentWordIndex: 0,
        lastNotificationDate: null,
        words: [], // Array to store words sent to this device
        daysLearning: 0, // Initialize days counter
        lastLearningDate: null, // Track the last learning date
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return { success: true };
  } catch (error) {
    console.error("Error saving device:", error);
    throw new Error("Failed to save device");
  }
};

const updateDeviceNotificationStatus = async (
  mobileId,
  notificationCount,
  currentWordIndex,
  word
) => {
  try {
    const deviceRef = db.collection("devices").doc(mobileId);
    const deviceDoc = await deviceRef.get();
    const deviceData = deviceDoc.data();

    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).toISOString();

    // Check if this is the first notification of a new day
    let daysLearning = deviceData.daysLearning || 0;
    const lastLearningDate = deviceData.lastLearningDate;

    if (
      !lastLearningDate ||
      new Date(lastLearningDate).toISOString() !== today
    ) {
      daysLearning += 1;
    }

    await deviceRef.update({
      notificationCount,
      currentWordIndex,
      lastNotificationDate: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      daysLearning,
      lastLearningDate: today,
      // Add the new word to the words array with current timestamp
      words: admin.firestore.FieldValue.arrayUnion({
        portuguese: word.portuguese,
        french: word.french,
        sentAt: new Date().toISOString(),
      }),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating device notification status:", error);
    throw new Error("Failed to update device notification status");
  }
};

const getDeviceStatus = async (mobileId) => {
  try {
    const doc = await db.collection("devices").doc(mobileId).get();
    if (!doc.exists) {
      return null;
    }
    return doc.data();
  } catch (error) {
    console.error("Error getting device status:", error);
    throw new Error("Failed to get device status");
  }
};

const getDeviceSummary = async (mobileId) => {
  try {
    const doc = await db.collection("devices").doc(mobileId).get();
    if (!doc.exists) {
      return null;
    }
    const data = doc.data();
    return {
      totalWords: data.words?.length || 0,
      words: data.words || [],
      notificationCount: data.notificationCount,
      lastNotificationDate: data.lastNotificationDate,
      daysLearning: data.daysLearning || 0,
    };
  } catch (error) {
    console.error("Error getting device summary:", error);
    throw new Error("Failed to get device summary");
  }
};

// Reset notification counts and words array daily
const resetAllDevicesNotificationCount = async () => {
  try {
    const batch = db.batch();
    const devices = await db
      .collection("devices")
      .where("isValid", "!=", false)
      .get();

    devices.forEach((device) => {
      batch.update(device.ref, {
        notificationCount: 0,
        words: [], // Reset words array
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    console.log("Reset notification counts and words for all devices");
  } catch (error) {
    console.error("Error resetting notification counts:", error);
  }
};

module.exports = {
  saveDeviceToken,
  updateDeviceNotificationStatus,
  getDeviceStatus,
  getDeviceSummary,
};
