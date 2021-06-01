const cloudinary = require("cloudinary").v2;
const path = require("path");
const fs = require("fs");
function uploadCloudinary(images, locs) {
  let urls = [];
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return new Promise(function (resolve, reject) {
    images.forEach(async (image, i) => {
      let imgURL = path.join(__dirname, `../${locs}/${image.filename}`);
      try {
        let result = await cloudinary.uploader.upload(imgURL, {
          folder: locs,
          faces: true,
        });
        urls.push(result.secure_url);
        if (i === images.length - 1) {
          resolve({
            msg: "success",
            urls,
          });
        }
      } catch (err) {
        fs.unlink(imgURL, function (err, removed) {
          if (err) console.log("file removing err");
          else console.log("file removed");
        });
        reject({
          msg: "err",
          err,
        });
      }
    });
  });
}

module.exports = {
  uploadCloudinary,
};
