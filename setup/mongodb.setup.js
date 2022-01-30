const mongoose = require("mongoose");

const conxnURI = "mongodb://localhost:27017/ChatApp";
// process.env.MONGO_URI||

mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },

  function (err, connect) {
    if (err) {
      console.log("err", err);
    } else {
      console.log("connected DB ChatApp");
    }
  }
);
