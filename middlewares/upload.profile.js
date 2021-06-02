const multer = require("multer");
const { CloudinaryStorage } = require('multer-storage-cloudinary');




const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images/profile");
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname.split(" ").join(""));
  },
});

const upload = multer();
module.exports = upload;
