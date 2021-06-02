const router = require("express").Router();
const MessageModel = require("../model/message.model");
const uploadMsg = require("../middlewares/upload.message");
const {uploadCloudinary} = require('../middlewares/upload.cloudinary')

router.get("/", function (req, res, next) {
  let groups = req.user.groups;
  MessageModel.find({
    $or: [
      { from: req.user._id },
      { toInd: req.user._id },
      {
        toGrp: { $in: groups },
      },
    ],
  })
    .populate("from")
    .populate("toInd")
    .populate("toGrp")
    .exec(function (err, messages) {
      if (err) return next(err);
      res.status(200).json(messages);
    });
});

router.post("/", uploadMsg.array("images"),async function (req, res, next) {
  let images = [];
  let messageImages = await uploadCloudinary(req.files, "messages");
  if (messageImages.msg === "err") {
    return next(messageImages.err);
  }

  messageImages.urls.forEach((url) => {
    images.push(url);
  });
  let textMsg = req.body.textMsg;
  let toInd = req.body.toInd;
  let from = req.body.from;
  let toGrp = req.body.toGrp;
  let message = new MessageModel({
    toInd,
    toGrp,
    text: textMsg,
    images,
    from,
  });
  message
    .save()
    .then((data) => res.status(200).json(data))
    .catch((err) => next(err));
});

module.exports = router;
