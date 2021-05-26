const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const appRouter = require("./appRouter");
const app = express();
const cors = require("cors");
require("./dbSetup/mongodb.setup");
require("dotenv").config();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use("/appv1", appRouter);

const sio = require("socket.io");
const socketAuth = require("./middlewares/authenticate.socket.middleware");
const UserModel = require("./model/user.model");
const NotificationModel = require("./model/notification.model");
const MessageModel = require("./model/message.model");
const GroupModel = require("./model/group.model");
const server = require("http").createServer(app);

const io = sio(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
io.use(socketAuth);

io.on("connection", function (socket) {
  socket.on("connect_error", function (err) {
    console.log(err);
  });
  socket.on("user", function (user) {
    console.log("user=>", user);
  });
  socket.on("friendReqSend", async function (req) {
    let to = await UserModel.findById(req.to);
    let from = await UserModel.findById(req.from);
    let newNotif = new NotificationModel({});
    newNotif.name = "Friend Request";
    newNotif.type = "FREQ";
    newNotif.from = req.from;
    newNotif.to = req.to;
    newNotif.save().then((notifs) => {
      if (to.status === "online") {
        io.to(to.socketID).emit("friendReqReceived", {
          from: from,
          to: to,
          type: "FREQ",
        });
      }
    });
  });
  socket.on("msgS", async function (msg) {
    try {
      let from = await UserModel.findById(msg.from);
      let toInd, toGrp;
      let newMsg = new MessageModel({});
      newMsg.from = msg.from;
      newMsg.toInd = msg.toInd && msg.toInd;
      newMsg.toGrp = msg.toGrp && msg.toGrp;
      newMsg.text = msg.text;
      let gotMsg = await newMsg.save();

      if (msg.toInd) {
        toInd = await UserModel.findById(msg.toInd);
        io.to(toInd.socketID).emit("msgR", {
          from,
          toInd,
          text: msg.text,
          _id: gotMsg._id,
        });
      } else {
        toGrp = await GroupModel.findById(msg.toGrp);
        io.to(toGrp._id).emit("msgR", {
          from,
          toGrp,
          text: msg.text,
          _id: gotMsg._id,
        });
      }
      socket.emit("msgR", {
        from,
        toInd,
        toGrp,
        text: msg.text,
        _id: gotMsg._id,
      });
    } catch (e) {
      console.log(e);
    }
  });

  socket.on("acceptOrReject", async function (msg) {
    NotificationModel.findOneAndDelete({
      $and: [{ from: msg.from }, { to: msg.to }],
    });
    if (msg.reply === "accept") {
      let from = await UserModel.findById(msg.from);
      let to = await UserModel.findById(msg.to);
      from.friends = [...from.friends, to._id];
      to.friends = [...to.friends, from._id];
      await from.save();
      await to.save();

      socket.emit(
        "doneFr",
        `Congratulations ${from.fullname} and you are friebds`
      );
    }
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
 
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500).json(err);
});

server.listen(8000, function () {
  console.log("Connected!");
});
