const { sendNotification } = require("../services/fcm_service");
const {
  saveDeviceToken,
  updateDeviceNotificationStatus,
  getDeviceStatus,
  getDeviceSummary,
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
  // Check if notifications are already running for this device
  if (deviceNotificationIntervals.has(mobileId)) {
    console.log(
      `Notification schedule already running for device with mobileId ${mobileId}`
    );
    return;
  }

  // Get or initialize device's notification status
  let deviceStatus = await getDeviceStatus(mobileId);
  if (!deviceStatus) {
    await saveDeviceToken(mobileId, deviceToken);
    deviceStatus = await getDeviceStatus(mobileId);
  }

  const interval = setInterval(async () => {
    try {
      if (!isWithinTimeWindow()) {
        console.log(
          `Outside notification time window for device with mobileId ${mobileId}`
        );
        return;
      }

      deviceStatus = await getDeviceStatus(mobileId);
      if (deviceStatus.notificationCount >= MAX_WORD_NOTIFICATIONS) {
        console.log(
          `Max notifications reached for device with mobileId ${mobileId}`
        );
        clearInterval(interval);
        deviceNotificationIntervals.delete(mobileId);
        return;
      }

      // Select the current word
      const word = wordDatabase[deviceStatus.currentWordIndex];

      // Send notification
      const notificationTitle = `New Word: ${word.portuguese}`;
      const notificationBody = `Portuguese: ${word.portuguese} | French: ${word.french}`;

      const result = await sendNotification(
        deviceToken,
        notificationTitle,
        notificationBody,
        {
          payload: "word_notification",
        }
      );

      if (!result.success && result.error === "TOKEN_EXPIRED") {
        clearInterval(interval);
        deviceNotificationIntervals.delete(mobileId);
        // Mark the device token as invalid in Firestore
        await db.collection("devices").doc(mobileId).update({
          isValid: false,
          invalidatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return;
      }

      // Update device's notification status with the word
      const newWordIndex =
        (deviceStatus.currentWordIndex + 1) % wordDatabase.length;
      const newNotificationCount = deviceStatus.notificationCount + 1;

      await updateDeviceNotificationStatus(
        mobileId,
        newNotificationCount,
        newWordIndex,
        word
      );

      console.log(
        `Word Notification ${newNotificationCount}/${MAX_WORD_NOTIFICATIONS} sent to device with mobileId ${mobileId}`
      );

      // Check if this was the last word notification
      if (newNotificationCount === MAX_WORD_NOTIFICATIONS) {
        setTimeout(async () => {
          if (isWithinTimeWindow()) {
            // Get device summary before sending completion notification
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
                daysLearning: String(summary.daysLearning), // Convert to string for FCM
              }
            );
            console.log(
              `Completion notification sent to device with mobileId ${mobileId}`
            );
          }
        }, COMPLETION_NOTIFICATION_DELAY);

        clearInterval(interval);
        deviceNotificationIntervals.delete(mobileId);
      }
    } catch (error) {
      console.error(
        `Error in notification schedule for device with mobileId ${mobileId}:`,
        error
      );
    }
  }, NOTIFICATION_INTERVAL_MS);

  deviceNotificationIntervals.set(mobileId, interval);
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

module.exports = {
  createWordsNotification,
};
