const router = require("express").Router();
const uploadGroupImg = require("../middlewares/upload.profile");
const GroupModel = require("../model/group.model");
const { uploadCloudinary } = require("../middlewares/upload.cloudinary");
const UserModel = require("../model/user.model");

router.post(
  "/",
  uploadGroupImg.single("image"),
  async function (req, res, next) {
    let newGroup = {};
    let fileUpload;
    if (req.file) {
      let fileUpload = new Promise(async function (resolve, reject) {
        let profileImages = await streamUpload(req.file.buffer, "profile");
        newGroup["image"] = profileImages.url;
        resolve("done");
      });
    }
    if (req.body.members) {
      let members = [];
      if (Array.isArray(req.body.members)) {
        members = req.body.members;
      } else {
        members.push(req.body.members);
      }
      members.push(`${req.user._id}`);
      newGroup["members"] = members;
    }

    newGroup["admins"] = [`${req.user._id}`];
    newGroup["name"] = req.body.name;
    newGroup["status"] = "online";

    if (fileUpload) await Promise.all([fileUpload]);
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
  }
);

router.put(
  "/:id",
  uploadGroupImg.single("image"),
  async function (req, res, next) {
    let updateGroup = {};
    let fileUpload;
    if (req.file) {
      let fileUpload = new Promise(async function (resolve, reject) {
        let profileImages = await streamUpload(req.file.buffer, "profile");
        updateGroup["image"] = profileImages.url;
        resolve("done");
      });
    }
    if (req.body.members) {
      let members = [];
      if (Array.isArray(req.body.members)) {
        members = req.body.members;
      } else {
        members.push(req.body.members);
      }
      updateGroup["members"] = members;
    }
    updateGroup["name"] = req.body.name;
    updateGroup["status"] = "online";

    if (fileUpload) await Promise.all([fileUpload]);
    GroupModel.findById(req.params.id).exec(function (err, group) {
      if (err) return next(err);

      if (!group) return next({ message: "No group found" });
      let oldGroupMembers = group.members;
      group
        .updateOne(updateGroup)
        .then(function (updated) {
          let newGroupMembers = updateGroup.members;

          let removedMembers = oldGroupMembers.filter(
            (members) => newGroupMembers.indexOf(`${members}`) < 0
          );
          let addedMembers = newGroupMembers.filter(
            (members) => oldGroupMembers.indexOf(members) < 0
          );
          console.log(removedMembers);
          let removeFromUserPromise = new Promise(function (resolve, reject) {
            if (!removedMembers.length) {
              resolve("done");
            }
            removedMembers.forEach(async (member, i) => {
              let user = await UserModel.findById(member);
              let groups = user.groups;

              let udpatedGroups = groups.filter(
                (gr) => `${gr}` != `${group._id}`
              );

              let updatedUser = {
                groups: udpatedGroups,
              };
              await user.updateOne(updatedUser);
              if (i === removedMembers.length - 1) {
                resolve("done");
              }
            });
          });

          let addToUserPromise = new Promise(function (resolve, reject) {
            if (!addedMembers.length) {
              resolve("done");
            }
            addedMembers.forEach(async (member, i) => {
              let user = await UserModel.findById(member);
              let groups = user.groups;
              groups.push(group._id);

              let updatedUser = {
                groups,
              };
              await user.updateOne(updatedUser);
              if (i === addedMembers.length - 1) {
                resolve("done");
              }
            });
          });

          Promise.all([removeFromUserPromise, addToUserPromise]).then(
            (data) => {
              res.status(200).json("done");
            }
          );
        })
        .catch(function (err) {
          return next(err);
        });
    });
  }
);

module.exports = router;
