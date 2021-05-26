const router = require("express").Router();
const MessageModel = require("../model/message.model");
const NotificationModel = require("../model/notification.model");
const UserModel = require("../model/user.model");

router.get("/", function (req, res, next) {
  res.status(200).json(req.user);
});

router.post("/search", function (req, res, next) {
  let srcText = req.body.srcText;
  UserModel.find(
    {
      $or: [
        { fullname: { $regex: srcText, $options: "i" } },
        { username: { $regex: srcText, $options: "i" } },
      ],
    },
    "_id fullname username email address"
  ).exec(function (err, users) {
    if (err) {
      return next(err);
    }

    let rU = users.filter(
      (u) => JSON.stringify(users[0]._id) !== JSON.stringify(req.user._id)
    );

    res.status(200).json(rU);
  });
});

router.get("/messages", function (req, res, next) {
  MessageModel.find({
    $or: [{ from: req.user._id }, { toInd: req.user._id }],
  })
    .populate("from")
    .populate("toInd")
    .populate("toGrp")
    .exec(function (err, messages) {
      if (err) return next(err);
      res.status(200).json(messages);
    });
});

router.get("/notifications", function (req, res, next) {
  NotificationModel.find({
    $or: [{ from: req.user._id }, { to: req.user._id }],
  })
    .populate("from")
    .populate("to")

    .exec(function (err, notifications) {
      if (err) return next(err);
      res.status(200).json(notifications);
    });
});

module.exports = router;
