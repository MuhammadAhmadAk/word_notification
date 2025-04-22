const { sendNotification } = require("../services/fcm_service");
const {
  saveDeviceToken,
  updateDeviceNotificationStatus,
  getDeviceStatus,
  getDeviceSummary,
  getWordSummaryHistory,
} = require("../services/firestore_service");

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
const TOTAL_NOTIFICATIONS = 16;
const NOTIFICATION_INTERVAL_MS = 10 * 1000; // 10 seconds for testing
const START_HOUR = 7; // 7 AM
const END_HOUR = 22; // 10 PM
const COMPLETION_NOTIFICATION_DELAY = 5 * 1000; // 5 seconds

// Store active notification intervals for each device
const deviceNotificationIntervals = new Map();

const isWithinTimeWindow = () => {
  const now = new Date();
  const hour = now.getHours();
  return hour >= START_HOUR && hour < END_HOUR;
};

const startNotificationSchedule = async (mobileId, deviceToken) => {
  try {
    if (deviceNotificationIntervals.has(mobileId)) {
      console.log(`Clearing existing interval for mobileId ${mobileId}`);
      clearInterval(deviceNotificationIntervals.get(mobileId));
      deviceNotificationIntervals.delete(mobileId);
    }

    let deviceStatus = await getDeviceStatus(mobileId);
    if (!deviceStatus) {
      console.log(`No device status found, initializing for mobileId ${mobileId}`);
      await saveDeviceToken(mobileId, deviceToken);
      deviceStatus = await getDeviceStatus(mobileId);
    }

    // Calculate starting word index based on days learning and notification count
    const baseWordIndex = ((deviceStatus.daysLearning || 1) - 1) * MAX_WORD_NOTIFICATIONS;
    let currentWordIndex = baseWordIndex + (deviceStatus.notificationCount || 0);

    const interval = setInterval(async () => {
      try {
        if (!isWithinTimeWindow()) {
          console.log(`Outside notification time window for mobileId ${mobileId}`);
          return;
        }

        deviceStatus = await getDeviceStatus(mobileId);
        if (!deviceStatus) {
          console.error(`Device ${mobileId} not found, stopping notifications`);
          clearInterval(interval);
          deviceNotificationIntervals.delete(mobileId);
          return;
        }

        if (deviceStatus.notificationCount >= MAX_WORD_NOTIFICATIONS) {
          console.log(`Max notifications reached for mobileId ${mobileId}`);
          clearInterval(interval);
          deviceNotificationIntervals.delete(mobileId);
          return;
        }

        // Ensure word index is within bounds of wordDatabase
        const wordIndex = (baseWordIndex + deviceStatus.notificationCount) % wordDatabase.length;
        const word = wordDatabase[wordIndex];

        // Add safety check for word
        if (!word) {
          console.error(`No word found at index ${wordIndex}. Database length: ${wordDatabase.length}`);
          return;
        }

        console.log(`Sending word notification for ${mobileId}:`, word);

        const notificationTitle = `Day ${deviceStatus.daysLearning} - Word ${deviceStatus.notificationCount + 1}`;
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
          console.error(`Failed to send notification for ${mobileId}:`, result.error);
          // Don't return here, continue with the word update even if notification fails
        }

        // Always update the word status regardless of notification success
        await updateDeviceNotificationStatus(
          mobileId,
          deviceStatus.notificationCount + 1,
          wordIndex,
          word
        );

        if (deviceStatus.notificationCount + 1 === MAX_WORD_NOTIFICATIONS) {
          handleCompletionNotification(mobileId, deviceToken);
        }
      } catch (error) {
        console.error(`Error in notification interval for ${mobileId}:`, error);
      }
    }, NOTIFICATION_INTERVAL_MS);

    deviceNotificationIntervals.set(mobileId, interval);
    console.log(`Notification schedule started for mobileId ${mobileId}`);
  } catch (error) {
    console.error(`Error starting notification schedule for ${mobileId}:`, error);
    throw error;
  }
};

// Separate function to handle completion notification
const handleCompletionNotification = async (mobileId, deviceToken) => {
  try {
    setTimeout(async () => {
      if (isWithinTimeWindow()) {
        const summary = await getDeviceSummary(mobileId);
        const summaryText = `You learned ${
          summary.totalWords
        } new words today! You've been learning for ${
          summary.daysLearning
        } day${summary.daysLearning !== 1 ? "s" : ""}!`;

        await sendNotification(
          deviceToken,
          "Your Today's Task Completed!",
          summaryText,
          {
            payload: "completion_notification",
            summary: summary.words,
            daysLearning: String(summary.daysLearning),
          }
        );
        console.log(`Completion notification sent to mobileId ${mobileId}`);
      }
    }, COMPLETION_NOTIFICATION_DELAY);
  } catch (error) {
    console.error(
      `Error sending completion notification for ${mobileId}:`,
      error
    );
  }
};

const createWordsNotification = async (req, res) => {
  const { mobileId, deviceToken } = req.body;

  if (!deviceToken) {
    return res.status(400).json({ message: "Device token is required." });
  }

  if (!mobileId) {
    return res.status(400).json({ message: "Mobile ID is required." });
  }

  try {
    await saveDeviceToken(mobileId, deviceToken);
    await startNotificationSchedule(mobileId, deviceToken);

    const deviceStatus = await getDeviceStatus(mobileId);
    const word = wordDatabase[deviceStatus.currentWordIndex];

    await sendNotification(
      deviceToken,
      `New Word: ${word.portuguese}`,
      `Portuguese: ${word.portuguese} | French: ${word.french}`,
      { payload: "word_notification" }
    );

    const newWordIndex =
      (deviceStatus.currentWordIndex + 1) % wordDatabase.length;
    await updateDeviceNotificationStatus(mobileId, 1, newWordIndex, word);

    res.status(200).json({
      message: "Notification sent and schedule started.",
      word,
    });
  } catch (error) {
    console.error("Error creating word notification:", error);
    res.status(500).json({ message: "Failed to start notifications." });
  }
};

// Reset notification counts daily at midnight for all devices
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
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    console.log("Reset notification counts for all devices");
  } catch (error) {
    console.error("Error resetting notification counts:", error);
  }
};

// Schedule daily reset
const scheduleDaily = () => {
  const now = new Date();
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );
  const timeToMidnight = nextMidnight - now;

  setTimeout(() => {
    resetAllDevicesNotificationCount();
    scheduleDaily(); // Schedule next reset
  }, timeToMidnight);
};

// Start the daily reset schedule
scheduleDaily();

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
};


