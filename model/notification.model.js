const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const notifSchema = Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    type: {
      type: String,
      enum: ["FREQ", "OTHER"],
      default: "FREQ",
    },
    from: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    accepted: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

const NotificationModel = mongoose.model("notification", notifSchema);

module.exports = NotificationModel;
