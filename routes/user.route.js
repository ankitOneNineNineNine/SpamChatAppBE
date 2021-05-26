const router = require("express").Router();
const UserModel = require("../model/user.model");

router.get("/", function (req, res, next) {
  UserModel.findById(req.user._id)
  .populate('friends')
  .populate('groups')
  .exec(function(err, user){
    res.status(200).json(user)
  })

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



module.exports = router;
