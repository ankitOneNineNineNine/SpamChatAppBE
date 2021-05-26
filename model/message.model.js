const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const messageSchema = Schema(
  {
    from: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    toInd: {
        type: Schema.Types.ObjectId,
        ref: "user",
    },
    toGrp: {
        type: Schema.Types.ObjectId,
        ref: 'group'
    },
    image: {
        type: String,
    },
    text: {
        type: String,
        required: true,
    }
 
  },

  {
    timestamps: true,
  }
);

const MessageModel = mongoose.model("message", messageSchema);

module.exports = MessageModel;
