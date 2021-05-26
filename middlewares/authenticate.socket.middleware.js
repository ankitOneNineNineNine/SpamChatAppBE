const jwt = require("jsonwebtoken");
const UserModel = require("../model/user.model");
function socketAuth(socket, next) {
  let token = socket.handshake.auth.token;

  jwt.verify(token, process.env.JWTSECRET, function (err, val) {

    if (err) {
      return next(err);
    }
    UserModel.findById(val.id).exec(async function (err, user) {
      if (err || !user) {
        const err = new Error("not authorized");
        return next(err);
      }
      user.socketID = socket.id;
      await user.save();
      next();
    });
  });
}

module.exports = socketAuth;
