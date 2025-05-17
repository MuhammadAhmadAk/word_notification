const admin = require("firebase-admin");
const db = admin.firestore();
const MAX_WORD_NOTIFICATIONS = 15;

const calculateNextDayStart = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(7, 30, 0, 0);
  return tomorrow;
};

const saveDeviceToken = async (mobileId, deviceToken) => {
  try {
    console.log(`Saving device token for mobileId: ${mobileId}`);
    const result = await db
      .collection("devices")
      .doc(mobileId)
      .set(
        {
          deviceToken,
          notificationCount: 0,
          currentWordIndex: 0,
          lastNotificationDate: null,
          words: [],
          daysLearning: 1, // Start with day 1
          lastLearningDate: null,
          wordsLearned: 0,
          notificationScheduleStatus: {
            isRunning: false,
            lastScheduleStart: null,
            lastNotificationSent: null,
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          isValid: true,
        },
        { merge: true }
      );
    return result;
  } catch (error) {
    console.error("Error saving device token:", error);
    throw error;
  }
};

const saveWordToSummaryCollection = async (
  mobileId,
  word,
  dayNumber,
  wordNumber
) => {
  try {
    const summaryRef = db.collection("word_summaries").doc(mobileId);
    const summaryDoc = await summaryRef.get();

    const now = new Date(); // System time
    console.log(
      `Saving word at ${now.toLocaleString()} for mobileId: ${mobileId}`
    );

    const wordEntry = {
      portuguese: word.portuguese,
      french: word.french,
      learningDate: now,
      dayNumber: dayNumber,
      wordNumber: wordNumber,
      timestamp: now,
    };

    if (!summaryDoc.exists) {
      await summaryRef.set({
        mobileId: mobileId,
        totalWordsLearned: 1,
        lastUpdated: now,
        wordHistory: [wordEntry],
      });
      console.log(`Created new summary document for mobileId: ${mobileId}`);
    } else {
      await summaryRef.update({
        totalWordsLearned: admin.firestore.FieldValue.increment(1),
        lastUpdated: now,
        wordHistory: admin.firestore.FieldValue.arrayUnion(wordEntry),
      });
      console.log(
        `Updated existing summary document for mobileId: ${mobileId}`
      );
    }

    console.log(`Word saved successfully: ${JSON.stringify(wordEntry)}`);
    return true;
  } catch (error) {
    console.error(
      `Error saving word to summary for mobileId ${mobileId} at ${new Date().toLocaleString()}:`,
      error
    );
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
        lastUpdated: null,
      };
    }

    const data = doc.data();
    return {
      totalWordsLearned: data.totalWordsLearned || 0,
      wordHistory: data.wordHistory || [],
      lastUpdated: data.lastUpdated,
    };
  } catch (error) {
    console.error(
      `Error getting word summary history for mobileId ${mobileId}:`,
      error
    );
    throw error;
  }
};

const updateDeviceNotificationStatus = async (
  mobileId,
  notificationCount,
  nextWordIndex,
  word
) => {
  const deviceRef = db.collection("devices").doc(mobileId);
  const now = new Date();

  try {
    const deviceData = (await deviceRef.get()).data();
    let daysLearning = deviceData.daysLearning || 1;
    const lastNotificationDate = deviceData.lastNotificationDate?.toDate();

    // Check if it's a new day
    const isSameDay =
      lastNotificationDate &&
      lastNotificationDate.getDate() === now.getDate() &&
      lastNotificationDate.getMonth() === now.getMonth() &&
      lastNotificationDate.getFullYear() === now.getFullYear();

    if (!isSameDay && deviceData.notificationCount >= MAX_WORD_NOTIFICATIONS) {
      daysLearning += 1;
      notificationCount = 1; // Reset notification count for new day
      console.log(
        `New day started. Incrementing to day ${daysLearning} for mobileId: ${mobileId}`
      );
    }

    // Update device status
    await deviceRef.update({
      notificationCount,
      currentWordIndex: nextWordIndex,
      daysLearning,
      lastNotificationDate: now,
      updatedAt: now,
      "notificationScheduleStatus.lastScheduleStart": now,
      words: admin.firestore.FieldValue.arrayUnion({
        ...word,
        sentAt: now,
        dayNumber: daysLearning,
        wordNumber: notificationCount,
      }),
    });
  } catch (error) {
    console.error("Error updating device notification status:", error);
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
    console.error(
      `Error getting device status for mobileId ${mobileId}:`,
      error
    );
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
    console.error(
      `Error getting device summary for mobileId ${mobileId}:`,
      error
    );
    throw error;
  }
};

const resetNotificationCounts = async () => {
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

const CheckRuningStatue = async (mobileId) => {
  try {
    const statusRef = db.collection("device_status").doc(mobileId);
    const statusDoc = await statusRef.get();
    const statusData = statusDoc.data();
    return statusData.isRunning;
  } catch (error) {
    console.error("Error checking if schedule is running:", error);
    throw error;
  }
};

const createOrUpdateDeviceStatus = async (mobileId, deviceToken = null) => {
  try {
    const deviceRef = db.collection("devices").doc(mobileId);
    const deviceDoc = await deviceRef.get();
    const now = new Date();

    // Prepare base device data
    const deviceData = {
      mobileId,
      deviceToken,
      isValid: true,
      notificationCount: 0,
      currentWordIndex: 0,
      daysLearning: 1,
      lastDayCompleted: null,
      nextDayStart: null,
      autoRestart: true, // Add auto-restart flag
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      notificationScheduleStatus: {
        isRunning: false,
        lastUpdate: admin.firestore.FieldValue.serverTimestamp(),
      },
    };

    if (!deviceDoc.exists) {
      await deviceRef.set(deviceData);
    } else {
      const existingData = deviceDoc.data();
      const nextDayStart = existingData.nextDayStart?.toDate();

      // Check if we've passed the next day start time
      if (nextDayStart && now >= nextDayStart) {
        // Reset for new day, but keep word index progression and increment day
        await deviceRef.update({
          notificationCount: 16, // Start from 16 for new day
          currentWordIndex:
            (existingData.currentWordIndex + 15) % wordDatabase.length, // Move to next set of words
          daysLearning: (existingData.daysLearning || 1) + 1, // Increment day
          lastDayCompleted: existingData.nextDayStart,
          nextDayStart: null,
          updatedAt: now,
          "notificationScheduleStatus.isRunning": false,
          "notificationScheduleStatus.lastUpdate": now,
        });
      }
    }

    const statusRef = db.collection("device_status").doc(mobileId);
    const statusDoc = await statusRef.get();

    if (!statusDoc.exists) {
      await statusRef.set({
        mobileId,
        currentDate: now.toISOString().split("T")[0],
        dailyCompleted: false,
        notificationsStarted: now,
        lastUpdated: now,
        notificationCount: 0,
        maxNotifications: MAX_WORD_NOTIFICATIONS,
        nextDayStart: null,
        isRunning: false,
      });
      return { isNewDay: true, dailyCompleted: false, isRunning: false };
    }

    const statusData = statusDoc.data();
    const nextDayStart = statusData.nextDayStart?.toDate();

    // Check if we're past the next day start time
    if (nextDayStart && now >= nextDayStart) {
      await statusRef.update({
        dailyCompleted: false,
        notificationCount: 16, // Start from 16 for new day
        lastUpdated: now,
        currentDate: now.toISOString().split("T")[0],
        nextDayStart: null,
        isRunning: false,
      });
      return { isNewDay: true, dailyCompleted: false, isRunning: false };
    }

    return {
      isNewDay: false,
      dailyCompleted: statusData.dailyCompleted || false,
      notificationCount: statusData.notificationCount || 0,
      isRunning: statusData.isRunning || false,
    };
  } catch (error) {
    console.error("Error in createOrUpdateDeviceStatus:", error);
    throw error;
  }
};

const markDailyNotificationsComplete = async (mobileId) => {
  try {
    const nextStart = calculateNextDayStart();
    const statusRef = db.collection("device_status").doc(mobileId);
    const deviceRef = db.collection("devices").doc(mobileId);
    const now = new Date();

    await Promise.all([
      statusRef.update({
        dailyCompleted: true,
        lastUpdated: now,
        notificationCount: MAX_WORD_NOTIFICATIONS,
        completedAt: now,
        nextDayStart: nextStart,
        isRunning: false,
      }),
      deviceRef.update({
        nextDayStart: nextStart,
        lastDayCompleted: now,
        "notificationScheduleStatus.isRunning": false,
        "notificationScheduleStatus.lastUpdate": now,
      }),
    ]);

    return true;
  } catch (error) {
    console.error("Error marking notifications complete:", error);
    throw error;
  }
};

const updateNotificationCount = async (mobileId, count) => {
  try {
    const statusRef = db.collection("device_status").doc(mobileId);
    const now = new Date();

    await statusRef.update({
      notificationCount: count,
      lastUpdated: now,
    });

    return true;
  } catch (error) {
    console.error("Error updating notification count:", error);
    throw error;
  }
};

const updateScheduleStatus = async (
  mobileId,
  isRunning,
  additionalData = {}
) => {
  try {
    const deviceRef = db.collection("devices").doc(mobileId);
    const statusRef = db.collection("device_status").doc(mobileId);
    const now = new Date();

    // Update device collection
    await deviceRef.update({
      "notificationScheduleStatus.isRunning": isRunning,
      "notificationScheduleStatus.lastUpdate": now,
      updatedAt: now,
    });

    // Update status collection
    await statusRef.update({
      isRunning,
      lastUpdated: now,
      ...additionalData,
    });

    return true;
  } catch (error) {
    console.error("Error updating schedule status:", error);
    throw error;
  }
};

const canStartNotifications = async (mobileId) => {
  try {
    const statusRef = db.collection("device_status").doc(mobileId);
    const deviceRef = db.collection("devices").doc(mobileId);

    const [statusDoc, deviceDoc] = await Promise.all([
      statusRef.get(),
      deviceRef.get(),
    ]);

    if (!statusDoc.exists || !deviceDoc.exists) {
      return { canStart: true, reason: null };
    }

    const statusData = statusDoc.data();
    const deviceData = deviceDoc.data();
    const now = new Date();

    // First check if it's a new day compared to last update
    const lastUpdate = statusData.lastUpdated?.toDate();
    if (lastUpdate) {
      const isNewDay =
        now.getDate() !== lastUpdate.getDate() ||
        now.getMonth() !== lastUpdate.getMonth() ||
        now.getFullYear() !== lastUpdate.getFullYear();

      if (isNewDay) {
        // Reset for new day
        await statusRef.update({
          dailyCompleted: false,
          notificationCount: 0,
          lastUpdated: now,
          isRunning: false,
        });
        await deviceRef.update({
          "notificationScheduleStatus.isRunning": false,
          "notificationScheduleStatus.lastUpdate": now,
          updatedAt: now,
        });
        return { canStart: true, reason: null };
      }
    }

    // Then check if notifications are running
    if (
      statusData.isRunning ||
      deviceData.notificationScheduleStatus?.isRunning
    ) {
      return {
        canStart: false,
        reason: "ALREADY_RUNNING",
        currentStatus: {
          dailyCompleted: statusData.dailyCompleted,
          notificationCount: statusData.notificationCount,
          maxNotifications: MAX_WORD_NOTIFICATIONS,
        },
      };
    }

    // Finally check daily limit
    if (
      statusData.dailyCompleted &&
      statusData.notificationCount >= MAX_WORD_NOTIFICATIONS
    ) {
      const nextStart = calculateNextDayStart();
      // Schedule the status reset for next day
      const timeUntilNextDay = nextStart.getTime() - now.getTime();
      setTimeout(async () => {
        try {
          await statusRef.update({
            dailyCompleted: false,
            notificationCount: 0,
            lastUpdated: nextStart,
            isRunning: false,
          });
        } catch (error) {
          console.error("Error resetting status for next day:", error);
        }
      }, timeUntilNextDay);

      return {
        canStart: false,
        reason: "DAILY_LIMIT_REACHED",
        scheduleStatus: {
          isRunning: false,
          dailyCompleted: true,
          nextScheduleStart: nextStart.toISOString(),
          notificationCount: MAX_WORD_NOTIFICATIONS,
          maxNotifications: MAX_WORD_NOTIFICATIONS,
        },
      };
    }

    return { canStart: true, reason: null };
  } catch (error) {
    console.error("Error checking notification start status:", error);
    throw error;
  }
};

module.exports = {
  saveDeviceToken,
  updateDeviceNotificationStatus,
  getDeviceStatus,
  getDeviceSummary,
  getWordSummaryHistory,
  updateScheduleStatus,
  createOrUpdateDeviceStatus,
  markDailyNotificationsComplete,
  updateNotificationCount,
  saveWordToSummaryCollection,
  canStartNotifications,
};
