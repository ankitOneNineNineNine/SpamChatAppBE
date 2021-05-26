const router = require("express").Router();
const UserModel = require("../model/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/login", function (req, res, next) {
  if (req.body.token) {
    jwt.verify(req.body.token, process.env.JWTSECRET, function (err, val) {
      if (err) {
        return next(err);
      }
      UserModel.findById(val.id)
        .populate("friends")
        .populate("groups")
        .populate("messages")
        .populate("notifications")
        .exec(function (err, user) {
          if (err) {
            return next(err);
          }
          if (!user) {
            return next({
              message: "User Not Present",
            });
          }
          res.status(200).json({ token: req.body.token, user });
        });
    });
  } else {
    UserModel.findOne({
      $or: [{ username: req.body.username }, { email: req.body.username }],
    })
      .populate("friends")
      .populate("groups")
      .populate("messages")
      .populate("notifications")
      .exec(function (err, user) {
        if (err) {
          return next(err);
        }
        if (!user) {
          return next({
            message: "User Not Present",
          });
        }
        bcrypt.compare(
          req.body.password,
          user.password,
          function (err, result) {
            if (err) {
              return next(err);
            }
            if (!result) {
              return next({
                message: "password incorrect",
              });
            }
            jwt.sign(
              { id: user._id },
              process.env.JWTSECRET,
              async function (err, token) {
                user.status = "online";
                await user.save();

                res.status(200).json({
                  user,
                  token,
                });
              }
            );
          }
        );
      });
  }
});

router.post("/register", async function (req, res, next) {
  let newUser = new UserModel({});
  newUser.fullname = req.body.fullname;
  newUser.username = req.body.username;
  newUser.email = req.body.email;
  newUser.address = req.body.address;
  newUser.password = await bcrypt.hash(req.body.password, 10);

  newUser
    .save()
    .then((user) => res.status(200).json(user))
    .catch((err) => next(err));
});

router.get("/", function (req, res, next) {
  UserModel.find({}).exec(function (err, user) {
    if (err) {
      return next(err);
    }
    let usedCreds = user.map((u) => {
      return { email: u.email, username: u.username };
    });
    res.status(200).json(usedCreds);
  });
});

module.exports = router;
