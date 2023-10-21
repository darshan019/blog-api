const mongoose = require("mongoose")

const Schema = mongoose.Schema

const CommentSchema = new Schema({
  username: { type: String, required: true },
  post: { type: Schema.Types.ObjectId, ref: "Posts" },
  text: { type: String, required: true }
})

module.exports = mongoose.model("Comments", CommentSchema)