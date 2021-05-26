const jwt = require("jsonwebtoken");
const UserModel = require("../model/user.model");

const authenticate = (req, res, next) => {
  const token = req.headers["authorization"];
  jwt.verify(token, process.env.JWTSECRET, function (err, val) {
    if (err) {
      return next(err);
    }
    UserModel.findById(val.id).exec(function (err, user) {

      if (err) {
        return next(err);
      }
      if (!user) {
        return next({
          message: "User Not Present",
        });
        
      }
      req.user = user;
      next();
    });
  });
};
module.exports = authenticate;
