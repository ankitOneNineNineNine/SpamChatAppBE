const router = require("express").Router();
const authenticate = require("./middlewares/authenticate.middleware");
const authRouter = require("./routes/auth.route");
const userRouter = require("./routes/user.route");
const notifactionRouter = require("./routes/notif.route");
const messageRouter = require("./routes/message.route");
const groupRouter = require("./routes/group.route");
router.use("/auth", authRouter);
router.use("/user", authenticate, userRouter);
router.use("/notifs", authenticate, notifactionRouter);
router.use("/messages", authenticate, messageRouter);
router.use("/group", authenticate, groupRouter);

module.exports = router;
