const { sendNotification } = require("../services/fcm_service");
const {
  createOrUpdateDeviceStatus,
  updateDeviceNotificationStatus,
  getDeviceStatus,
  updateScheduleStatus,
  saveWordToSummaryCollection,
  updateNotificationCount,
  markDailyNotificationsComplete,
  getDeviceSummary,
  getWordSummaryHistory,
} = require("../services/firestore_service");
const admin = require("firebase-admin");
const db = admin.firestore();

// Word database
const wordDatabase = [
  { portuguese: "Olá", french: "Bonjour" },
  { portuguese: "Casa", french: "Maison" },
  { portuguese: "Sol", french: "Soleil" },
  { portuguese: "Amor", french: "Amour" },
  { portuguese: "Água", french: "Eau" },
  { portuguese: "Comida", french: "Nourriture" },
  { portuguese: "Livro", french: "Livre" },
  { portuguese: "Céu", french: "Ciel" },
  { portuguese: "Flor", french: "Fleur" },
  { portuguese: "Rua", french: "Rue" },
  { portuguese: "Mar", french: "Mer" },
  { portuguese: "Noite", french: "Nuit" },
  { portuguese: "Dia", french: "Jour" },
  { portuguese: "Vida", french: "Vie" },
  { portuguese: "Amigo", french: "Ami" },
  { portuguese: "Obrigado", french: "Merci" },
  { portuguese: "Sim", french: "Oui" },
  { portuguese: "Não", french: "Non" },
  { portuguese: "Por favor", french: "S'il vous plaît" },
  { portuguese: "Eu", french: "Je" },
  { portuguese: "Você", french: "Tu" },
  { portuguese: "Estou", french: "Suis" },
  { portuguese: "Você está", french: "Tu es" },
  { portuguese: "Eu tenho", french: "J'ai" },
  { portuguese: "Você tem", french: "Tu as" },
  { portuguese: "Hora", french: "Heure" },
  { portuguese: "Hoje", french: "Aujourd'hui" },
  { portuguese: "Amanhã", french: "Demain" },
  { portuguese: "Ontem", french: "Hier" },
  { portuguese: "Comer", french: "Manger" },
  { portuguese: "Beber", french: "Boire" },
  { portuguese: "Trabalho", french: "Travail" },
  { portuguese: "Cansado", french: "Fatigué" },
  { portuguese: "Acordar", french: "Se réveiller" },
  { portuguese: "Adormecer", french: "S'endormir" },
  { portuguese: "Vestir-se", french: "S'habiller" },
  { portuguese: "Lavar-se", french: "Se laver" },
  { portuguese: "Apressar-se", french: "Se dépêcher" },
  { portuguese: "Passear", french: "Se promener" },
  { portuguese: "Rir", french: "Rire" },
  { portuguese: "Chorar", french: "Pleurer" },
  { portuguese: "Gritar", french: "Crier" },
  { portuguese: "Beijar", french: "Embrasser" },
  { portuguese: "Olhar", french: "Regarder" },
  { portuguese: "Pão", french: "Pain" },
  { portuguese: "Carro", french: "Voiture" },
  { portuguese: "Cidade", french: "Ville" },
  { portuguese: "País", french: "Pays" },
  { portuguese: "Praia", french: "Plage" },
  { portuguese: "Montanha", french: "Montagne" },
  { portuguese: "Floresta", french: "Forêt" },
  { portuguese: "Jardim", french: "Jardin" },
  { portuguese: "Árvore", french: "Arbre" },
  { portuguese: "Lua", french: "Lune" },
  { portuguese: "Vento", french: "Vent" },
  { portuguese: "Nuvem", french: "Nuage" },
  { portuguese: "Temperatura", french: "Température" },
  { portuguese: "Frio", french: "Froid" },
  { portuguese: "Quente", french: "Chaud" },
  { portuguese: "Feliz", french: "Heureux" },
  { portuguese: "Triste", french: "Triste" },
  { portuguese: "Sempre", french: "Toujours" },
  { portuguese: "Lembrar-se", french: "Se souvenir" },
  { portuguese: "Falso", french: "Faux" },
  { portuguese: "Verdadeiro", french: "Vrai" },
  { portuguese: "Entender", french: "Comprendre" },
  { portuguese: "Pensar", french: "Penser" },
  { portuguese: "Perguntar", french: "Demander" },
  { portuguese: "Responder", french: "Répondre" },
  { portuguese: "Esperar", french: "Attendre" },
  { portuguese: "Querer", french: "Vouloir" },
  { portuguese: "Manhã", french: "Matin" },
  { portuguese: "Tarde", french: "Après-midi" },
  { portuguese: "Semana", french: "Semaine" },
  { portuguese: "Mês", french: "Mois" },
  { portuguese: "Ano", french: "Année" },
  { portuguese: "Sonhar", french: "Rêver" },
  { portuguese: "Acreditar", french: "Croire" },
  { portuguese: "Preocupar-se", french: "S'inquiéter" },
  { portuguese: "Proteger", french: "Protéger" },
  { portuguese: "Decidir", french: "Décider" },
  { portuguese: "Esquecer", french: "Oublier" },
  { portuguese: "Começar", french: "Commencer" },
  { portuguese: "Terminar", french: "Terminer" },
  { portuguese: "Compartilhar", french: "Partager" },
  { portuguese: "Sentir", french: "Sentir (une émotion)" },
  { portuguese: "Crescer", french: "Grandir" },
  { portuguese: "Refletir", french: "Réfléchir" },
  { portuguese: "Explicar", french: "Expliquer" },
  { portuguese: "Imaginar", french: "Imaginar" },
  { portuguese: "Aceitar", french: "Accepter" },
  { portuguese: "Recusar", french: "Refuser" },
  { portuguese: "Perdoar", french: "Pardonner" },
  { portuguese: "Detestar", french: "Détester" },
  { portuguese: "Merecer", french: "Mériter" },
  { portuguese: "Decepcionar", french: "Décevoir" },
  { portuguese: "Encorajar", french: "Encourager" },
  { portuguese: "Proibir", french: "Interdire" },
  { portuguese: "Permitir", french: "Permettre" },
  { portuguese: "Desculpar-se", french: "S'excuser" },
  { portuguese: "Brigar", french: "Se disputer" },
  { portuguese: "Descansar", french: "Se reposer" },
  { portuguese: "Entediar-se", french: "S'ennuyer" },
  { portuguese: "Cair", french: "Tomber" },
  { portuguese: "Ouvir", french: "Écouter" },
  { portuguese: "Cheirar", french: "Sentir (odeur)" },
  { portuguese: "Tocar", french: "Toucher" },
  { portuguese: "Vestir", french: "Porter (vêtements)" },
  { portuguese: "Carregar", french: "Porter (objet)" },
  { portuguese: "Deixar", french: "Laisser" },
  { portuguese: "Pegar", french: "Ramasser" },
  { portuguese: "Trazer", french: "Apporter" },
  { portuguese: "Abraçar", french: "Serrer (dans ses bras)" },
  { portuguese: "Ganhar", french: "Gagner (de l'argent)" },
  { portuguese: "Perder", french: "Perdre" },
  { portuguese: "Procurar", french: "Chercher" },
  { portuguese: "Encontrar", french: "Trouver" },
  { portuguese: "Emprestar", french: "Emprunter" },
  { portuguese: "Comprar", french: "Acheter" },
  { portuguese: "Vender", french: "Vendre" },
  { portuguese: "Preço", french: "Prix" },
  { portuguese: "Dinheiro", french: "Argent" },
  { portuguese: "Conta", french: "Compte (bancaire)" },
  { portuguese: "Banco", french: "Banque" },
  { portuguese: "Trem", french: "Train" },
  { portuguese: "Avião", french: "Avion" },
  { portuguese: "Metrô", french: "Métro" },
  { portuguese: "Animais", french: "Animaux" },
  { portuguese: "Cachorro", french: "Chien" },
  { portuguese: "Gato", french: "Chat" },
  { portuguese: "Pássaro", french: "Oiseau" },
  { portuguese: "Peixe", french: "Poisson" },
  { portuguese: "Fazenda", french: "Ferme" },
  { portuguese: "Terra", french: "Terre" },
  { portuguese: "Pesado", french: "Lourd" },
  { portuguese: "Leve", french: "Léger" },
  { portuguese: "Alto", french: "Haut" },
  { portuguese: "Baixo", french: "Bas" },
  { portuguese: "Largo", french: "Large" },
  { portuguese: "Rico", french: "Riche" },
  { portuguese: "Pobre", french: "Pauvre" },
  { portuguese: "Jovem", french: "Jeune" },
  { portuguese: "Velho", french: "Vieux" },
  { portuguese: "Lindo", french: "Beau" },
  { portuguese: "Feio", french: "Moche" },
  { portuguese: "Fácil", french: "Facile" },
  { portuguese: "Difícil", french: "Difficile" },
  { portuguese: "Rápido", french: "Rapide" },
  { portuguese: "Devagar", french: "Lent" },
  { portuguese: "Perto", french: "Proche" },
  { portuguese: "Longe", french: "Loin" },
  { portuguese: "Claro", french: "Clair" },
  { portuguese: "Forte", french: "Fort" },
  { portuguese: "Fraco", french: "Faible" },
  { portuguese: "Minuto", french: "Minute" },
  { portuguese: "Segundo", french: "Seconde" },
  { portuguese: "Peso", french: "Poids" },
  { portuguese: "Tamanho", french: "Taille" },
  { portuguese: "Cor", french: "Couleur" },
  { portuguese: "Vermelho", french: "Rouge" },
  { portuguese: "Azul", french: "Bleu" },
  { portuguese: "Verde", french: "Vert" },
  { portuguese: "Amarelo", french: "Jaune" },
  { portuguese: "Branco", french: "Blanc" },
  { portuguese: "Preto", french: "Noir" },
  { portuguese: "Marrom", french: "Marron" },
  { portuguese: "Laranja", french: "Orange" },
  { portuguese: "Cinza", french: "Gris" },
  { portuguese: "Roxo", french: "Violet" },
  { portuguese: "Rosa", french: "Rose" },
  { portuguese: "Número", french: "Chiffre" },
  { portuguese: "Letra", french: "Lettre" },
  { portuguese: "Palavra", french: "Mot" },
  { portuguese: "Frase", french: "Phrase" },
  { portuguese: "Grátis", french: "Gratuit" },
  { portuguese: "Direito", french: "Droit" },
  { portuguese: "Obrigação", french: "Obligation" },
  { portuguese: "Tempo", french: "Temps" },
  { portuguese: "História", french: "Histoire" },
  { portuguese: "Realidade", french: "Réalité" },
  { portuguese: "Ideia", french: "Idée" },
  { portuguese: "Esperança", french: "Espoir" },
  { portuguese: "Liberdade", french: "Liberté" },
  { portuguese: "Nada", french: "Rien" },
  { portuguese: "Alguma coisa", french: "Quelque chose" },
  { portuguese: "Tudo", french: "Tout" },
  { portuguese: "Coisa", french: "Chose" },
  { portuguese: "Pessoa", french: "Personne" },
  { portuguese: "Mundo", french: "Monde" },
  { portuguese: "Movimento", french: "Mouvement" },
  { portuguese: "Medo", french: "Peur" },
  { portuguese: "Alegria", french: "Joie" },
  { portuguese: "Odiar", french: "Haïr" },
  { portuguese: "Tristeza", french: "Tristesse" },
  { portuguese: "Felicidade", french: "Bonheur" },
  { portuguese: "Raiva", french: "Colère" },
  { portuguese: "Surpresa", french: "Surprise" },
  { portuguese: "Nervosismo", french: "Nervosité" },
  { portuguese: "Calma", french: "Calme" },
  { portuguese: "Energia", french: "Énergie" },
];

if (
  !wordDatabase ||
  !Array.isArray(wordDatabase) ||
  wordDatabase.length === 0
) {
  console.error("Word database is not properly initialized");
  throw new Error("Word database is not available");
}
// State to track notifications and word index
let notificationCount = 0;
let currentWordIndex = 0;
let notificationInterval = null;
const MAX_WORD_NOTIFICATIONS = 15;
//const NOTIFICATION_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes interval
const NOTIFICATION_INTERVAL_MS = 10 * 1000; // 10 seconds interval

const START_HOUR = 7;
const START_MINUTE = 30;
const END_HOUR = 22; // 10 PM
const COMPLETION_NOTIFICATION_DELAY = 2000; // 2 seconds delay for completion notification

// Map to store notification intervals for each device
const deviceNotificationIntervals = new Map();

// Helper function to check if current time is within allowed window
const isWithinTimeWindow = () => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // Start time: 7:30 AM
  const isAfterStart =
    hour > START_HOUR || (hour === START_HOUR && minute >= START_MINUTE);
  // End time: 10:00 PM (22:00)
  const isBeforeEnd = hour < END_HOUR;

  const isWithin = isAfterStart && isBeforeEnd;
  console.log(
    `Time window check at ${now.toLocaleString()}: ${
      isWithin ? "Within window" : "Outside window"
    } (${hour}:${minute.toString().padStart(2, "0")})`
  );
  return isWithin;
};

// Helper function to calculate next day's start time at 7:30 AM
const calculateNextDayStart = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(START_HOUR, START_MINUTE, 0, 0); // Set to 7:30 AM
  return tomorrow;
};

const startNotificationSchedule = async (mobileId, deviceToken) => {
  try {
    // Check if outside time window first
    if (!isWithinTimeWindow()) {
      const nextStart = calculateNextDayStart();
      return {
        success: false,
        error: "OUTSIDE_TIME_WINDOW",
        message: `Notifications can only be started between 7:30 AM and 10:00 PM. Next session starts at ${nextStart.toLocaleString()}`,
        nextStart: nextStart,
      };
    }

    // Initialize or update device status
    const deviceDailyStatus = await createOrUpdateDeviceStatus(
      mobileId,
      deviceToken
    );

    // If notifications are already running, return early
    if (deviceDailyStatus.isRunning) {
      return {
        success: false,
        error: "ALREADY_RUNNING",
        message: "Notification schedule is already running for this device.",
        scheduleStatus: {
          isRunning: true,
          dailyCompleted: deviceDailyStatus.dailyCompleted,
          notificationCount: deviceDailyStatus.notificationCount,
          maxNotifications: MAX_WORD_NOTIFICATIONS,
        },
      };
    }

    // Force reset dailyCompleted if it's a new day and within time window
    const now = new Date();
    const lastUpdate = deviceDailyStatus.updatedAt
      ? new Date(deviceDailyStatus.updatedAt)
      : null;
    const isNewDay =
      lastUpdate &&
      (now.getDate() !== lastUpdate.getDate() ||
        now.getMonth() !== lastUpdate.getMonth() ||
        now.getFullYear() !== lastUpdate.getFullYear());

    if (isNewDay && isWithinTimeWindow()) {
      await updateScheduleStatus(mobileId, false, {
        dailyCompleted: false,
        notificationCount: 0,
        nextScheduleStart: null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      deviceDailyStatus.dailyCompleted = false;
      deviceDailyStatus.notificationCount = 0;
    }

    // Now check if daily is completed (after potential reset)
    if (deviceDailyStatus.dailyCompleted) {
      const nextStart = calculateNextDayStart();
      return {
        success: false,
        error: "DAILY_LIMIT_REACHED",
        message:
          "Today's learning is already completed. Next session starts tomorrow at 7:30 AM.",
        scheduleStatus: {
          isRunning: false,
          dailyCompleted: true,
          nextScheduleStart: nextStart.toISOString(),
          notificationCount: deviceDailyStatus.notificationCount,
          maxNotifications: MAX_WORD_NOTIFICATIONS,
        },
      };
    }

    // Update status to running

    let deviceStatus = await getDeviceStatus(mobileId);

    if (!deviceStatus) {
      await saveDeviceToken(mobileId, deviceToken);
      deviceStatus = await getDeviceStatus(mobileId);
    }

    if (deviceNotificationIntervals.has(mobileId)) {
      console.log(`Clearing existing interval for mobileId ${mobileId}`);
      clearInterval(deviceNotificationIntervals.get(mobileId));
      deviceNotificationIntervals.delete(mobileId);
    }

    // Update schedule status to running
    await updateScheduleStatus(mobileId, true);

    const interval = setInterval(async () => {
      const checkTime = new Date();
      console.log(
        `Checking notification conditions at ${checkTime.toLocaleString()} for mobileId: ${mobileId}`
      );

      try {
        if (!isWithinTimeWindow()) {
          console.log(
            `Outside notification time window for mobileId ${mobileId}`
          );
          return;
        }

        deviceStatus = await getDeviceStatus(mobileId);
        if (!deviceStatus) {
          console.error(`Device ${mobileId} not found, stopping notifications`);
          clearInterval(interval);
          deviceNotificationIntervals.delete(mobileId);
          return;
        }

        // Check if we've reached max notifications
        if (deviceStatus.notificationCount >= MAX_WORD_NOTIFICATIONS) {
          console.log(`Max notifications reached for mobileId ${mobileId}`);
          clearInterval(interval);
          deviceNotificationIntervals.delete(mobileId);
          handleCompletionNotification(mobileId, deviceToken);
          return;
        }

        const wordIndex = deviceStatus.currentWordIndex % wordDatabase.length;
        const nextWordIndex = (wordIndex + 1) % wordDatabase.length;
        const word = wordDatabase[wordIndex];

        if (!word) {
          console.error(`No word found at index ${wordIndex}`);
          return;
        }

        console.log(`Sending word notification for ${mobileId}:`, word);

        const notificationTitle = `Jour ${deviceStatus.daysLearning} - Mot ${
          deviceStatus.notificationCount + 1
        }`;
        const notificationBody = `Portuguese: ${word.portuguese} | French: ${word.french}`;

        const result = await sendNotification(
          deviceToken,
          notificationTitle,
          notificationBody,
          {
            payload: "word_notification",
            dayNumber: String(deviceStatus.daysLearning),
            wordNumber: String(deviceStatus.notificationCount + 1),
          }
        );

        if (!result.success) {
          console.error(
            `Failed to send notification for ${mobileId}:`,
            result.error
          );
          return;
        }

        // Save word to summary collection
        await saveWordToSummaryCollection(
          mobileId,
          word,
          deviceStatus.daysLearning,
          deviceStatus.notificationCount + 1
        );

        // Update device status
        await updateDeviceNotificationStatus(
          mobileId,
          deviceStatus.notificationCount + 1,
          nextWordIndex,
          word
        );

        // Update notification count in status collection
        await updateNotificationCount(
          mobileId,
          deviceStatus.notificationCount + 1
        );
      } catch (error) {
        console.error(`Error in notification interval for ${mobileId}:`, error);
      }
    }, NOTIFICATION_INTERVAL_MS);

    deviceNotificationIntervals.set(mobileId, interval);

    return {
      success: true,
      message: "Notification schedule started successfully",
      scheduleStatus: {
        isRunning: true,
        startedAt: now,
        notificationCount: deviceStatus?.notificationCount || 0,
        totalWordsToday: MAX_WORD_NOTIFICATIONS,
      },
    };
  } catch (error) {
    console.error(
      `Error starting notification schedule for ${mobileId}:`,
      error
    );
    await updateScheduleStatus(mobileId, false).catch(console.error);
    throw error;
  }
};

// Separate function to handle completion notification
const handleCompletionNotification = async (mobileId, deviceToken) => {
  try {
    setTimeout(async () => {
      if (isWithinTimeWindow()) {
        await markDailyNotificationsComplete(mobileId);
        const summary = await getDeviceSummary(mobileId);
        const wordsToday = MAX_WORD_NOTIFICATIONS;
        const totalWords = summary.totalWordsLearned || 0;
        const nextStart = calculateNextDayStart();

        const daysCompleted = Math.floor(totalWords / MAX_WORD_NOTIFICATIONS);
        const isFirstDay = daysCompleted === 1;

        const summaryText = isFirstDay
          ? `Félicitations ! Vous avez terminé vos premiers ${MAX_WORD_NOTIFICATIONS} mots aujourd'hui ! La prochaine session commence demain à 7h30.`
          : `Bravo ! Vous avez appris ${MAX_WORD_NOTIFICATIONS} nouveaux mots aujourd'hui ! Vous avez complété ${daysCompleted} jour(s) complet(s). La prochaine session commence demain à 7h30.`;

        // Send completion notification
        await sendNotification(
          deviceToken,
          "Apprentissage quotidien terminé !",
          summaryText,
          {
            payload: "completion_notification",
            nextStart: nextStart.toISOString(),
          }
        );

        // Stop current schedule and prepare for next day
        await stopAndPrepareNextDaySchedule(mobileId);

        console.log(
          `Completion notification sent to mobileId ${mobileId} with summary: ${summaryText}`
        );
      }
    }, COMPLETION_NOTIFICATION_DELAY);
  } catch (error) {
    console.error(
      `Error sending completion notification for ${mobileId}:`,
      error
    );
  }
};

// New function to handle schedule transition
const stopAndPrepareNextDaySchedule = async (mobileId) => {
  try {
    // Clear current interval
    if (deviceNotificationIntervals.has(mobileId)) {
      clearInterval(deviceNotificationIntervals.get(mobileId));
      deviceNotificationIntervals.delete(mobileId);
    }

    const nextStartTime = calculateNextDayStart();
    const now = new Date();
    const timeUntilNextDay = nextStartTime.getTime() - now.getTime();

    console.log(
      `Scheduling next day's notifications for ${mobileId} at ${nextStartTime.toLocaleString()} (in ${Math.floor(
        timeUntilNextDay / 1000 / 60
      )} minutes)`
    );

    // Update status to indicate completion of today's schedule and prepare for next day
    await updateScheduleStatus(mobileId, false, {
      dailyCompleted: true,
      nextScheduleStart: nextStartTime,
      nextDayStart: nextStartTime,
      isRunning: false,
      notificationCount: MAX_WORD_NOTIFICATIONS,
    });

    // Schedule next day's start and reset
    setTimeout(async () => {
      try {
        const deviceStatus = await getDeviceStatus(mobileId);
        if (!deviceStatus || !deviceStatus.deviceToken) {
          console.error(
            `No valid device status found for ${mobileId} at next day start`
          );
          return;
        }

        // Reset all status for new day
        await Promise.all([
          updateScheduleStatus(mobileId, false, {
            dailyCompleted: false,
            notificationCount: 0,
            lastUpdated: nextStartTime,
            currentDate: nextStartTime.toISOString().split("T")[0],
            nextDayStart: null,
            isRunning: false,
          }),
          updateDeviceNotificationStatus(
            mobileId,
            0,
            deviceStatus.currentWordIndex,
            null
          ),
        ]);

        console.log(
          `Starting next day's schedule for ${mobileId} at ${nextStartTime.toLocaleString()}`
        );

        // Attempt to start new schedule
        await startNotificationSchedule(mobileId, deviceStatus.deviceToken);
      } catch (error) {
        console.error(
          `Error starting next day's schedule for ${mobileId}:`,
          error
        );
      }
    }, timeUntilNextDay);
  } catch (error) {
    console.error(`Error preparing next day schedule for ${mobileId}:`, error);
  }
};

const createWordsNotification = async (req, res) => {
  const { mobileId, deviceToken } = req.body;

  if (!deviceToken) {
    return res.status(400).json({
      success: false,
      message: "Device token is required.",
    });
  }

  if (!mobileId) {
    return res.status(400).json({
      success: false,
      message: "Mobile ID is required.",
    });
  }

  try {
    // First check if it's a new day
    const now = new Date();
    const deviceRef = db.collection("devices").doc(mobileId);
    const statusRef = db.collection("device_status").doc(mobileId);

    const [deviceDoc, statusDoc] = await Promise.all([
      deviceRef.get(),
      statusRef.get(),
    ]);

    if (!deviceDoc.exists || !statusDoc.exists) {
      // New device, proceed with notification
      const scheduleResult = await startNotificationSchedule(
        mobileId,
        deviceToken
      );
      return handleScheduleResult(res, scheduleResult, mobileId, deviceToken);
    }

    const deviceData = deviceDoc.data();
    const statusData = statusDoc.data();

    // Check for new day conditions
    const lastNotification = deviceData.lastNotificationDate?.toDate();
    const nextDayStart = statusData.nextDayStart?.toDate();

    const isNewDay =
      lastNotification &&
      (now.getDate() !== lastNotification.getDate() ||
        now.getMonth() !== lastNotification.getMonth() ||
        now.getFullYear() !== lastNotification.getFullYear());

    const hasPassedNextStart = nextDayStart && now >= nextDayStart;

    if (isNewDay || hasPassedNextStart) {
      // For new day: increment day count and move word index forward
      const newDayNumber = (deviceData.daysLearning || 1) + 1;
      const newWordIndex =
        (deviceData.currentWordIndex + 15) % wordDatabase.length;

      // Reset status for new day starting from 1 (not 16)
      await Promise.all([
        deviceRef.update({
          notificationCount: 0, // Reset to 0, will be incremented to 1 on first notification
          currentWordIndex: newWordIndex,
          daysLearning: newDayNumber,
          "notificationScheduleStatus.isRunning": false,
          "notificationScheduleStatus.lastUpdate": now,
          nextDayStart: null,
          updatedAt: now,
        }),
        statusRef.update({
          dailyCompleted: false,
          notificationCount: 0, // Reset to 0, will be incremented to 1 on first notification
          lastUpdated: now,
          currentDate: now.toISOString().split("T")[0],
          nextDayStart: null,
          isRunning: false,
        }),
      ]);

      console.log(
        `New day ${newDayNumber} started for ${mobileId}, continuing from word index ${newWordIndex}`
      );
    }

    // Now proceed with notification schedule
    const scheduleResult = await startNotificationSchedule(
      mobileId,
      deviceToken
    );
    return handleScheduleResult(res, scheduleResult, mobileId, deviceToken);
  } catch (error) {
    console.error("Error creating word notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start notifications.",
      scheduleStatus: {
        isRunning: false,
        error: error.message,
      },
    });
  }
};

// Helper function to handle schedule result
const handleScheduleResult = async (
  res,
  scheduleResult,
  mobileId,
  deviceToken
) => {
  if (!scheduleResult.success) {
    return res.status(200).json({
      success: false,
      message: scheduleResult.message,
      error: scheduleResult.error,
      scheduleStatus: scheduleResult.scheduleStatus,
    });
  }

  const deviceStatus = await getDeviceStatus(mobileId);
  const word = wordDatabase[deviceStatus.currentWordIndex];

  // Initialize notification count at 1 for new devices or keep existing count
  const notificationCount = deviceStatus.notificationCount || 1;

  const notificationTitle = `Jour ${deviceStatus.daysLearning} - Mot ${notificationCount}`;
  const notificationBody = `French: ${word.french} | Portuguese: ${word.portuguese}`;

  // Save the first word to summary collection
  await saveWordToSummaryCollection(
    mobileId,
    word,
    deviceStatus.daysLearning,
    notificationCount
  );

  await sendNotification(deviceToken, notificationTitle, notificationBody, {
    payload: "word_notification",
    dayNumber: String(deviceStatus.daysLearning),
    wordNumber: String(notificationCount),
  });

  const newWordIndex =
    (deviceStatus.currentWordIndex + 1) % wordDatabase.length;
  await updateDeviceNotificationStatus(
    mobileId,
    notificationCount,
    newWordIndex,
    word
  );

  return res.status(200).json({
    success: true,
    message: "Notification envoyée et planification commencée.",
    word,
    scheduleStatus: {
      isRunning: true,
      startedAt: new Date(),
      notificationCount: notificationCount,
      dayNumber: deviceStatus.daysLearning,
      totalWordsToday: MAX_WORD_NOTIFICATIONS,
    },
  });
};

const getWordHistory = async (req, res) => {
  const { mobileId } = req.query;
  if (!mobileId) {
    return res.status(400).json({ message: "Mobile ID is required." });
  }

  try {
    const summaryHistory = await getWordSummaryHistory(mobileId);
    res.status(200).json(summaryHistory);
  } catch (error) {
    console.error("Error fetching word history:", error);
    res.status(500).json({ message: "Failed to fetch word history." });
  }
};

module.exports = {
  createWordsNotification,
  getWordHistory,
  startNotificationSchedule,
};
