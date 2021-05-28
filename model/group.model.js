const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const groupSchema = Schema(
  {
    name: {
      type: String,
      required: true,
    },
    status: {
      type: 'String',
      enum: ['online', 'offline'],
      default: 'offline'
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    image: {
      type: String,
    }
  },

  {
    timestamps: true,
  }
);

const GroupModel = mongoose.model("group", groupSchema);

module.exports = GroupModel;
