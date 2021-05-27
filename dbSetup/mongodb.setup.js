const mongoose = require("mongoose");

const conxnURI = "mongodb://localhost:27017/ChatApp";

mongoose.connect(
  conxnURI,
  { useNewUrlParser: true, useUnifiedTopology: true, 
    useFindAndModify: false, 
    useCreateIndex: true },

  function (err, connect) {
    if (err) {
      console.log("err", err);
    } else {
      console.log("connected DB ChatApp");
    }
  }
);
