const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const Posts = require("../models/posts");
const Comment = require("../models/comments");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const comments = require("../models/comments");

exports.user_post = [
  body("title")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Title must at least be 3 characters")
    .escape(),

  body("content", "The content must at least contain of 20 words")
    .trim()
    .isLength({ min: 60 })
    .escape(),

  body("summary")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Must at least contain 5 characters")
    .escape(),

  asyncHandler(async (req, res, next) => {
    const newPost = new Posts({
      author: req.user,
      title: req.body.title,
      content: req.body.content,
      date: Date.now(),
      summary: req.body.summary,
      published: req.body.published,
    });

    await newPost.save();

    res.send("saved");
  }),
];

exports.sign_up = [
  body("username", "Username must at least be 3 characters long")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  body("password", "Password must at least be 8 characters long")
    .trim()
    .isLength({ min: 8 })
    .escape(),

  body("confirm")
    .trim()
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw Error("Password doesn't match");
      }
      return true;
    })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const user = new User({
      userName: req.body.username,
      password: req.body.password,
    });
    console.log(user);
    //await user.save()
    res.send("User saved");

    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      try {
        if (err) {
          throw err;
        }
        const user = new User({
          userName: req.body.username,
          password: hashedPassword,
        });
        await user.save();
        res.send("User saved");
      } catch (err) {
        return next(err);
      }
    });
  }),
];

/*
asyncHandler(async (req, res, next) => {
    
    const user = new User({
      userName: req.body.username,
      password: req.body.password
    })
    console.log(user)
    //await user.save()
    res.send("User saved")

    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      try {
        if(err)  {
          throw err
        }
        const user = new User({
          userName: req.body.username,
          password: hashedPassword
        })
        await user.save()
        res.send("User saved")
      }

      catch(err) {
        return next(err)
      }
    })
  })

  */

exports.log_in = [
  body("username", "Username must at least be 3 characters long")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  body("password", "Password must at least be 8 characters long")
    .trim()
    .isLength({ min: 8 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ userName: req.body.username });

    try {
      if (!user) {
        throw Error("Incorrect user");
      } else {
        const match = await bcrypt.compare(req.body.password, user.password);
        if (!match) {
          throw Error("Incorrect Password");
        } else {
          const accessToken = jwt.sign(
            { _id: user._id },
            process.env.ACCESS_TOKEN_KEY,
            { expiresIn: "1000s" }
          );
          req.user = user;
          res.json({ accessToken: accessToken });
        }
      }
    } catch (err) {
      next(err);
    }

    /*if(user.password !== req.body.password && user) {
      throw Error("Incorrect username or password")
    } else {
      const accessToken = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_KEY, { expiresIn: "360s" })
      req.user = user
      res.json({accessToken: accessToken})
    }*/
  }),
];

exports.post_comment = [
  body("comment", "Comment must at least be 3 characters long")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    console.log(user);
    const newComment = new Comment({
      username: user.userName,
      post: req.params.id,
      text: req.body.comment,
    });

    await newComment.save();
    res.send("comment saved");
  }),
];

exports.get_post = [
  asyncHandler(async (req, res, next) => {
    const post = await Posts.findById(req.params.id).populate("author");
    const commentsOnPost = await Comment.find({ post: req.params.id });

    res.json({
      post: post,
      comments: commentsOnPost,
    });
  }),
];

exports.delete_post = [
  asyncHandler(async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const u = await User.findById(req.user._id);

    jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
    });

    if (u.isAdmin) {
      await Posts.findByIdAndDelete(req.params.id);
      await comments.deleteMany({ post: req.params.id });
      res.send("Post deleted");
    } else {
      res.send("Only admin can delete a post");
    }
  }),
];
