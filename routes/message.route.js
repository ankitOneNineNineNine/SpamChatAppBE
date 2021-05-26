const router = require("express").Router();
const MessageModel = require("../model/message.model");
router.get("/", function (req, res, next) {
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

module.exports = router;
