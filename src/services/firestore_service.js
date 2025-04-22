const admin = require("firebase-admin");

const db = admin.firestore();

const MAX_WORD_NOTIFICATIONS = 16;

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
    
    const now = new Date(); // System time
    console.log(`Saving word at ${now.toLocaleString()} for mobileId: ${mobileId}`);
    
    const wordEntry = {
      portuguese: word.portuguese,
      french: word.french,
      learningDate: now,
      dayNumber: dayNumber,
      wordNumber: wordNumber,
      timestamp: now
    };

    if (!summaryDoc.exists) {
      await summaryRef.set({
        mobileId: mobileId,
        totalWordsLearned: 1,
        lastUpdated: now,
        wordHistory: [wordEntry]
      });
      console.log(`Created new summary document for mobileId: ${mobileId}`);
    } else {
      await summaryRef.update({
        totalWordsLearned: admin.firestore.FieldValue.increment(1),
        lastUpdated: now,
        wordHistory: admin.firestore.FieldValue.arrayUnion(wordEntry)
      });
      console.log(`Updated existing summary document for mobileId: ${mobileId}`);
    }

    console.log(`Word saved successfully: ${JSON.stringify(wordEntry)}`);
    return true;
  } catch (error) {
    console.error(`Error saving word to summary for mobileId ${mobileId} at ${new Date().toLocaleString()}:`, error);
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
    const now = new Date();
    console.log(`Updating notification status at ${now.toLocaleString()} for mobileId: ${mobileId}`);
    
    const deviceRef = db.collection("devices").doc(mobileId);
    const deviceDoc = await deviceRef.get();
    
    if (!deviceDoc.exists) {
      console.error(`Device ${mobileId} not found in database at ${now.toLocaleString()}`);
      return { success: false, error: 'DEVICE_NOT_FOUND' };
    }

    const deviceData = deviceDoc.data();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    // Calculate days learning based on total words learned
    const totalWordsLearned = deviceData.wordsLearned || 0;
    const daysLearning = Math.floor(totalWordsLearned / MAX_WORD_NOTIFICATIONS) + 1;
    const lastLearningDate = deviceData.lastLearningDate;

    // Reset daily words array if it's a new day
    if (!lastLearningDate || new Date(lastLearningDate).getDate() !== today.getDate()) {
      console.log(`New day detected for mobileId: ${mobileId}. Current learning day: ${daysLearning}`);
      await deviceRef.update({ words: [] });
    }

    const updateData = {
      notificationCount,
      currentWordIndex,
      lastNotificationDate: now,
      updatedAt: now,
      daysLearning,
      lastLearningDate: today,
      wordsLearned: totalWordsLearned + 1,
      words: admin.firestore.FieldValue.arrayUnion({
        portuguese: word.portuguese,
        french: word.french,
        sentAt: now,
        dayNumber: daysLearning,
        wordNumber: notificationCount
      }),
    };

    await deviceRef.update(updateData);
    await saveWordToSummaryCollection(mobileId, word, daysLearning, notificationCount);

    console.log(`Successfully updated notification status at ${now.toLocaleString()} for mobileId: ${mobileId}`);
    return { success: true };
  } catch (error) {
    console.error(`Error updating device notification status for mobileId ${mobileId} at ${new Date().toLocaleString()}:`, error);
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








