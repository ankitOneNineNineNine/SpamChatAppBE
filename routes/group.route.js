const router = require("express").Router();
const uploadGroupImg = require("../middlewares/upload.profile");
const GroupModel = require("../model/group.model");
const UserModel = require("../model/user.model");

router.post("/", uploadGroupImg.single("image"), function (req, res, next) {
  let newGroup = {};

  if (req.file) {
    newGroup["image"] = req.file.filename;
  }
  if (req.body.members) {
    let members = [];
    if (Array.isArray(req.body.members)) {
      members = req.body.members;
    } else {
      members.push(req.body.members);
    }
    members.push(req.user._id);
    newGroup["members"] = members;
  }

  newGroup["admins"] = [req.user._id];
  newGroup["name"] = req.body.name;
  newGroup["status"] = "online";
  let newGr = new GroupModel(newGroup);
  newGr
    .save()
    .then(function (group) {
      function newPromise() {
        return new Promise(function (resolve, reject) {
          newGr.members.forEach(function (userID, i) {
            UserModel.updateOne(
              { _id: userID },
              { $push: { groups: [group._id] } },
              function (err, result) {
                if (err) {
                  reject("error");
                }
                if (i === newGr.members.length - 1) {
                  resolve("done");
                }
              }
            );
          });
        });
      }
      newPromise()
        .then(function (data) {
          res.status(200).json("done");
        })
        .catch(function (err) {
          return next(err);
        });
    })
    .catch(function (err) {
      return next(err);
    });
});

router.put("/:id", uploadGroupImg.single("image"), function (req, res, next) {
  let updateGroup = {};
  if (req.file) {
    updateGroup["image"] = req.file.filename;
  }
  if (req.body.members) {
    let members = [];
    if (Array.isArray(req.body.members)) {
      members = req.body.members;
    } else {
      members.push(req.body.members);
    }
    members.push(req.user._id);
    updateGroup["members"] = members;
  }

  updateGroup["name"] = req.body.name;
  updateGroup["status"] = "online";

  // remaining cha yo mildiana
  GroupModel.findById(req.params.id).exec(function (err, group) {
    if (err) return next(err);

    if (!group) return next({ message: "no group" });
    let oldMembers = group.members;
    group.updateOne(updateGroup).then(function (updated) {
      function newPromise() {
        return new Promise(function (resolve, reject) {
          let removedPeople = oldMembers.filter((om) => om !== updateGroup);

          removedPeople.forEach(function (userID, i) {
            UserModel.updateOne(
              { _id: userID },
              { $pull: { groups: group._id } },
              function (err, result) {
                if (err) {
                  reject("error");
                }
                if (i === removedPeople.length - 1) {
                  resolve("done");
                }
              }
            );
          });
        });
      }
      newPromise()
        .then(function (data) {
          res.status(200).json("done");
        })
        .catch(function (err) {
          return next(err);
        });
    });
  });
});

module.exports = router;
