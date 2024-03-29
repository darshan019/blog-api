const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date },
  summary: { type: String, required: true },
});

PostSchema.virtual("formatted-date").get(() => {
  const inputDate = new Date(this.date);

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  const formattedDate = inputDate.toLocaleDateString("en-US", options);

  return formattedDate;
});

module.exports = mongoose.model("Posts", PostSchema);
