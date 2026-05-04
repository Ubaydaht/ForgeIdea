const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  idea: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ideas",
  },

  type: {
    type: String,
    enum: ["upvote", "comment"],
    required: true,
  },

  message: {
    type: String,
  },

  isRead: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model("notifications", notificationSchema);
