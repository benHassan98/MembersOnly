const mongoose = require("mongoose");
const { Schema } = mongoose;

const MessageSchema = new Schema({
  author: { type: Schema.ObjectId, ref: "User" },
  title: String,
  content: String,
  time_stamp: String,
});

module.exports = mongoose.model("Message", MessageSchema);
