const router = require("express").Router();
const NotificationModel = require("../model/notification.model");

router.get("/", function (req, res, next) {
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

router.put("/:id", function (req, res, next) {
  NotificationModel.findByIdAndUpdate(
    req.params.id,
    { accepted: true },
    function (err, done) {
      if (err) return next(err);
      res.status(200).json(done);
    }
  );
});

router.delete("/:id", function (req, res, next) {
  NotificationModel.findByIdAndDelete(req.params.id, function (err, done) {
    if (err) return next(err);
    res.status(200).json(done);
  });
});

module.exports = router;
