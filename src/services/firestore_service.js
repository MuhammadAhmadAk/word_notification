const admin = require("firebase-admin");

const db = admin.firestore();

const saveDeviceToken = async (mobileId, deviceToken) => {
  try {
    console.log(`Saving device token for mobileId: ${mobileId}`);
    const result = await db.collection("devices").doc(mobileId).set(
      {
        deviceToken,
        notificationCount: 0,
        currentWordIndex: 0, // This will now be based on daysLearning
        lastNotificationDate: null,
        words: [], // Only store current day's words
        daysLearning: 0,
        lastLearningDate: null,
        wordsLearned: 0, // Total words learned across all days
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isValid: true,
      },
      { merge: true }
    );
    console.log(`Device token saved successfully for mobileId: ${mobileId}`);
    return { success: true };
  } catch (error) {
    console.error(`Error saving device token for mobileId ${mobileId}:`, error);
    throw error;
  }
};

const saveWordToSummaryCollection = async (mobileId, word, dayNumber, wordNumber) => {
  try {
    const summaryRef = db.collection("word_summaries").doc(mobileId);
    const summaryDoc = await summaryRef.get();
    
    const now = new Date();
    const wordEntry = {
      portuguese: word.portuguese,
      french: word.french,
      learningDate: now.toISOString(),
      dayNumber: dayNumber,
      wordNumber: wordNumber,
      timestamp: now.toISOString()  // Changed from serverTimestamp to ISO string
    };

    if (!summaryDoc.exists) {
      await summaryRef.set({
        mobileId: mobileId,
        totalWordsLearned: 1,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        wordHistory: [wordEntry]
      });
    } else {
      await summaryRef.update({
        totalWordsLearned: admin.firestore.FieldValue.increment(1),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        wordHistory: admin.firestore.FieldValue.arrayUnion(wordEntry)
      });
    }

    console.log(`Word saved to summary collection for mobileId: ${mobileId}`);
    return true;
  } catch (error) {
    console.error(`Error saving word to summary for mobileId ${mobileId}:`, error);
    throw error;
  }
};

const getWordSummaryHistory = async (mobileId) => {
  try {
    const summaryRef = db.collection("word_summaries").doc(mobileId);
    const doc = await summaryRef.get();
    
    if (!doc.exists) {
      return {
        totalWordsLearned: 0,
        wordHistory: [],
        lastUpdated: null
      };
    }

    const data = doc.data();
    return {
      totalWordsLearned: data.totalWordsLearned || 0,
      wordHistory: data.wordHistory || [],
      lastUpdated: data.lastUpdated
    };
  } catch (error) {
    console.error(`Error getting word summary history for mobileId ${mobileId}:`, error);
    throw error;
  }
};

const updateDeviceNotificationStatus = async (
  mobileId,
  notificationCount,
  currentWordIndex,
  word
) => {
  try {
    console.log(`Updating notification status for mobileId: ${mobileId}`);
    const deviceRef = db.collection("devices").doc(mobileId);
    const deviceDoc = await deviceRef.get();
    
    if (!deviceDoc.exists) {
      console.error(`Device ${mobileId} not found in database`);
      return { success: false, error: 'DEVICE_NOT_FOUND' };
    }

    const deviceData = deviceDoc.data();
    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).toISOString();

    let daysLearning = deviceData.daysLearning || 0;
    const lastLearningDate = deviceData.lastLearningDate;
    let wordsLearned = deviceData.wordsLearned || 0;

    // Check if it's a new day
    if (!lastLearningDate || new Date(lastLearningDate).toISOString() !== today) {
      daysLearning += 1;
      // Reset words array for the new day
      await deviceRef.update({ words: [] });
    }

    // Calculate the starting word index based on days learning
    const baseWordIndex = (daysLearning - 1) * 15;
    currentWordIndex = baseWordIndex + (notificationCount - 1);

    const updateData = {
      notificationCount,
      currentWordIndex,
      lastNotificationDate: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      daysLearning,
      lastLearningDate: today,
      wordsLearned: wordsLearned + 1,
      words: admin.firestore.FieldValue.arrayUnion({
        portuguese: word.portuguese,
        french: word.french,
        sentAt: now.toISOString(),
        dayNumber: daysLearning,
        wordNumber: notificationCount
      }),
    };

    await deviceRef.update(updateData);

    // Save word to summary collection
    await saveWordToSummaryCollection(mobileId, word, daysLearning, notificationCount);

    console.log(`Successfully updated notification status for mobileId: ${mobileId}`);
    return { success: true };
  } catch (error) {
    console.error(`Error updating device notification status for mobileId ${mobileId}:`, error);
    throw error;
  }
};

const getDeviceStatus = async (mobileId) => {
  try {
    console.log(`Getting device status for mobileId: ${mobileId}`);
    const doc = await db.collection("devices").doc(mobileId).get();
    if (!doc.exists) {
      console.log(`No device found for mobileId: ${mobileId}`);
      return null;
    }
    const data = doc.data();
    console.log(`Device status retrieved for mobileId: ${mobileId}`, data);
    return data;
  } catch (error) {
    console.error(`Error getting device status for mobileId ${mobileId}:`, error);
    throw error;
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
  getWordSummaryHistory,
};




