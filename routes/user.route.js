const router = require("express").Router();
const UserModel = require("../model/user.model");
const path = require("path");
const uploadProfileImg = require("../middlewares/upload.profile");

const streamUpload = require("../middlewares/directCloudinary");

router.get("/", function (req, res, next) {
  UserModel.findById(req.user._id)
    .populate("friends")
    .populate({
      path: "groups",
      populate: {
        path: "members",
      },
    })
    .populate("messages")
    .populate("notifications")
    .exec(function (err, user) {
      res.status(200).json(user);
    });
});
router.put(
  "/",
  uploadProfileImg.single("image"),
  async function (req, res, next) {
    let updatedBody = {};
    if (req.body.fullname) {
      updatedBody.fullname = req.body.fullname;
    }
    if (req.body.address) {
      updatedBody.address = req.body.address;
    }
    let fileUpload;
    if (req.file) {
      fileUpload = new Promise(async function (resolve, reject) {
        let profileImages = await streamUpload(req.file.buffer, "profile");
        updatedBody["image"] = profileImages.url;
        resolve("done");
      });
    }
    if (fileUpload) await Promise.all([fileUpload]);
    UserModel.findById(req.user._id).exec(async function (err, user) {
      if (err) return next(err);
      if (!user) return next({ message: "user not present" });

      user
        .updateOne(updatedBody)
        .then(function (data) {
          res.status(200).json("Updated");
        })
        .catch(function (err) {
          return next(err);
        });
    });
  }
);

router.post("/search", function (req, res, next) {
  let srcText = req.body.srcText;

  UserModel.find(
    {
      $or: [
        { fullname: { $regex: srcText, $options: "i" } },
        { username: { $regex: srcText, $options: "i" } },
      ],
    },
    "_id fullname username email address image"
  ).exec(function (err, users) {
    if (err) {
      return next(err);
    }

    res.status(200).json(users);
  });
});

module.exports = router;
