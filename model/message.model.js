const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const messageSchema = Schema(
  {
   prediction: {
     type: String,
     enum: ['spam', 'ham'],
     default: 'ham',
   },
    from: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    toInd: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    toGrp: {
      type: Schema.Types.ObjectId,
      ref: "group",
    },
    images: [
      {
        type: String,
      },
    ],
    text: {
      type: String,
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  }
);

const MessageModel = mongoose.model("message", messageSchema);

module.exports = MessageModel;
