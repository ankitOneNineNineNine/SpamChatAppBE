const { Expo } = require("expo-server-sdk");

let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
let savedPushTokens = [];
let notifications = [];
const handlePushTokens = ({ token, title, body }) => {
  if (savedPushTokens.find((t) => t === token)) {
    notifications.push({
      to: token,
      sound: "default",
      title,
      body,
      data: { body },
    });
  }
};

let chunks = expo.chunkPushNotifications(notifications);

(async () => {
  for (let chunk of chunks) {
    console.log(chunk, notifications);
    try {
      let receipts = await expo.sendPushNotificationsAsync(chunk);
    } catch (e) {
      console.log(e);
    }
  }
})();

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
