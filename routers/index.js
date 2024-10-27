const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const questionRouter = require("./Question");
const answerRouter = require("./Asnwer");
const mentorRouter=require("./MentorSession");

const userRouter=require('./User')

router.get("/", (req, res) => {
  res.send("Welcome to stack overflow clone");
});

router.use("/question", questionRouter);
router.use("/answer", answerRouter);
router.use("/mentor",mentorRouter);
router.use("/auth",userRouter);


module.exports = router;
