const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  userName: String,
  password: String,
  isMember: Boolean,
  isAdmin: Boolean,
});
module.exports = mongoose.model("User", UserSchema);
