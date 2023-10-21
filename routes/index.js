const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler")
const Posts = require("../models/posts")
const userController = require("../controllers/userController")
const jwt = require("jsonwebtoken")
const Users = require("../models/user")
require("dotenv").config()

router.get("/", asyncHandler(async (req, res, next) => {
  const posts = await Posts.find({})

  res.json({posts: posts})
}))

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if(token === null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (err, user) => {
    if(err) return res.sendStatus(403)

    req.user = user

    next()
  })
}

router.post("/create-post", authenticateToken, userController.user_post)

router.post("/sign-up", userController.sign_up)

router.post("/log-in", userController.log_in)

router.post("/post/:id/comment", authenticateToken, userController.post_comment)

module.exports = router;