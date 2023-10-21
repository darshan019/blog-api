const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const indexRouter = require("./routes/index")
require("dotenv").config()

const app = express()

app.use(express.json())
app.use(cors())

mongoose.set("strictQuery", false)

async function main() {
  await mongoose.connect(process.env.mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"))
}

main().catch(err => console.log(err))

app.use("/", indexRouter)

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500).json({ error: err.message });
});

app.listen(3000, () => console.log("server  started"))