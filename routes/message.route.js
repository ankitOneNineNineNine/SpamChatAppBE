const router = require("express").Router();
const MessageModel = require("../model/message.model");
const uploadMsg = require("../middlewares/upload.message");
const { uploadCloudinary } = require("../middlewares/upload.cloudinary");
const streamUpload = require("../middlewares/directCloudinary");

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
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("from")
    .populate("toInd")
    .populate("toGrp")
    .exec(function (err, messages) {
      if (err) return next(err);
      res.status(200).json(messages.reverse());
    });
});

router.post("/", uploadMsg.array("images"), async function (req, res, next) {
  let images = [];
  let fileUpload = new Promise(async function (resolve, reject) {
    req.files.forEach(async function (file, i) {
      let messageImages = await streamUpload(file.buffer, "messages");

      images.push(messageImages.url);
      if (i === req.files.length - 1) {
        resolve("done");
      }
    });
  });
  await Promise.all([fileUpload]);

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

router.put("/:id", function (req, res, next) {
  MessageModel.findById(req.params.id).exec(function (err, msg) {
    if (err) return next(err);

    if (!msg) return next({ message: "not found" });

    let updatedMessage = {
      seen: req.body.seen,
    };

    msg
      .updateOne(updatedMessage)
      .then(function (data) {
        res.status(200).json("data");
      })
      .catch(function (err) {
        return next(err);
      });
  });
});

module.exports = router;
