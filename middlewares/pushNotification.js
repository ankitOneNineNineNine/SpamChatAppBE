const { Expo } = require("expo-server-sdk");

let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
let savedPushTokens = [];
let notifications = [];
const handlePushTokens = ({ id, token, title, body }) => {
  if (savedPushTokens.find((t) => t === token)) {
    if (notifications.findIndex((n) => n.id === id) < 0) {
      notifications.push({
        id,
        to: token,
        sound: "default",
        title,
        body,
      });
    }
  }
  let chunks = expo.chunkPushNotifications(notifications);

  (async () => {
    for (let chunk of chunks) {
      try {
        let receipts = await expo.sendPushNotificationsAsync(chunk);
      } catch (e) {
        console.log(e);
      }
    }
  })();
};

const saveToken = (token) => {
  const exists = savedPushTokens.find((t) => t === token);
  if (!exists) {
    savedPushTokens.push(token);
  }
};

module.exports = {
  saveToken,
  handlePushTokens,
};
