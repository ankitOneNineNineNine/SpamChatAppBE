const mongoose = require("mongoose");

// const conxnURI = "mongodb://localhost:27017/ChatApp";
const conxnURI =
  "mongodb+srv://ankitProj:BARCA@nkit$980@cluster0.v1cqa.mongodb.net/ChatApp?retryWrites=true&w=majority";

mongoose.connect(
  conxnURI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  },

  function (err, connect) {
    if (err) {
      console.log("err", err);
    } else {
      console.log("connected DB ChatApp");
    }
  }
);
