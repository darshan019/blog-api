const mongoose = require("mongoose")

const Schema = mongoose.Schema

const UserSchema = new Schema({
  userName: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }
})

module.exports = mongoose.model("User", UserSchema)