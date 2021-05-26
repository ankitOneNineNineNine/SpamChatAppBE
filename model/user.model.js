const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = Schema(
  {
    fullname: {
      type: String,
      reqired: true,
    },
    notifications: [
      {
        type: Schema.Types.ObjectId,
        ref: "notification",
      },
    ],
    username: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    image: {
      type: String,
    },
    spamHit: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
    socketID: {
      type: String,
      default: null,
    },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    groups: [
      {
        type: Schema.Types.ObjectId,
        ref: "group",
      },
    ],
    passToken: String,
    passTokenExpiry: Date,
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;
