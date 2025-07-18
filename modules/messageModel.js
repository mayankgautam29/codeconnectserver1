const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  roomId: { type: String, required: true },
  text: { type: String, required: true },
  time: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);
