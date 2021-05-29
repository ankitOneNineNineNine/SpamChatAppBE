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

app.use("/msgImgs", express.static(path.join(__dirname, "/images/messages")));
app.use(
  "/profileImge",
  express.static(path.join(__dirname, "/images/profile"))
);
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
          _id: notifs._id,
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

        if (toInd.status === "online") {
          socket.broadcast.to(toInd.socketID).emit("msgR", {
            from,
            toInd,
            text: msg.text,
            _id: gotMsg._id,
            createdAt: gotMsg.createdAt,
          });
        }
        socket.emit("msgR", {
          from,
          toInd,
          text: msg.text,
          _id: gotMsg._id,
          createdAt: gotMsg.createdAt,
        });
      } else {
        toGrp = await GroupModel.findById(msg.toGrp);

        if (toGrp.status === "online") {
          io.in(`${toGrp._id}`).emit("msgR", {
            from,
            toGrp,
            text: msg.text,
            _id: gotMsg._id,
            createdAt: gotMsg.createdAt,
          });
        }
      }
    } catch (e) {
      console.log(e);
    }
  });
  socket.on("imgMsg", async function (msg) {
    let from = await UserModel.findById(msg.from);
    let toInd, toGrp;
    if (msg.toInd) {
      toInd = await UserModel.findById(msg.toInd);

      if (toInd.status === "online") {
        io.to(toInd.socketID).emit("msgR", {
          from,
          toInd,
          text: msg.text,
          _id: msg._id,
          images: msg.images,
          createdAt: msg.createdAt,
        });
      }
    } else {
      toGrp = await GroupModel.findById(msg.toGrp);
      if (toGrp.status === "online") {
        io.in(`${toGrp._id}`).emit("msgR", {
          from,
          toGrp,
          text: msg.text,
          _id: msg._id,
          images: msg.images,
          createdAt: msg.createdAt,
        });
      }
    }
    socket.emit("msgR", {
      from,
      toInd,
      toGrp,
      text: msg.text,
      _id: msg._id,
      images: msg.images,
      createdAt: msg.createdAt,
    });
  });
  socket.on("acceptOrReject", async function (msg) {
    if (msg.reply === "accept") {
      let from = await UserModel.findById(msg.from);
      let to = await UserModel.findById(msg.to);
      from.friends = [...from.friends, to._id];
      to.friends = [...to.friends, from._id];
      await from.save();
      await to.save();

      socket.emit("doneFr", {
        msg: `Congratulations ${from.fullname} and you are friends`,
        id: msg.id,
      });
      if (from.status === "online") {
        io.to(from.socketID).emit("newFriend", {
          msg: `${to.fullname} has accepted your friend request`,
          id: msg.id,
        });
      }
    } else {
      socket.emit("doneFr", {
        id: msg.id,
      });
    }
  });
  socket.on('newGroup', function(data){
    data.members.forEach(async function(mem){
        let user = await UserModel.findById(mem);
        if(user.status === 'online'){
          socket.broadcast.to(user.socketID).emit('newGroupCreated', 'N')
        }
    })
  })
  socket.on("logout", async function () {
    socket.disconnect();
    await UserModel.findOneAndUpdate(
      {
        socketID: socket.id,
      },
      {
        status: "offline",
      }
    );
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  console.log(err);
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500).json(err);
});

server.listen(8000, function () {
  console.log("Connected!");
});
