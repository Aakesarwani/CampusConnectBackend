const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const AnswerDB = require("../models/Answers");
const UserDB = require("../models/User"); // Assuming a User schema exists
const Counter = require('../models/Counter'); // Adjust the path as necessary
const QuestionDB = require("../models/Question");

// Add an answer to a question
// Create an answer
router.post("/create", async (req, res) => {
  const { questionId, answer, userEmail } = req.body;

  // Validate request data
  if (!questionId || !answer || !userEmail) {
    return res.status(400).send({ message: "All fields (questionId, answer, userEmail) are required" });
  }

  try {
    // Fetch the user to get their name
    const user = await UserDB.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Check if the question exists
    const question = await QuestionDB.findOne({ questionId });
    if (!question) {
      return res.status(404).send({ message: "Question not found" });
    }

    // Generate a unique answer ID (could use UUID here or a counter)
    const answerId = new mongoose.Types.ObjectId().toString();

    // Create the answer
    const newAnswer = new AnswerDB({
      questionId,
      answer,
      userEmail,
      name: `${user.firstName} ${user.lastName}`,  // Assume User schema has firstName, lastName fields
      answerId,
    });

    // Save the answer
    const savedAnswer = await newAnswer.save();
    res.status(201).send(savedAnswer);
  } catch (error) {
    console.error("Error saving answer:", error);
    res.status(500).send({ message: "Failed to create answer", error: error.message });
  }
});

// Toggle Upvote
router.post("/upvote/:answerId", async (req, res) => {
  const { email } = req.body; // User email from request body

  try {
    const answer = await AnswerDB.findById(req.params.answerId);

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    if (answer.upvotedBy.includes(email)) {
      // If already upvoted, remove the upvote
      answer.upvote -= 1;
      answer.upvotedBy = answer.upvotedBy.filter((e) => e !== email);
    } else {
      // Add upvote and remove downvote if it exists
      answer.upvote += 1;
      answer.upvotedBy.push(email);
      if (answer.downvotedBy.includes(email)) {
        answer.downvote -= 1;
        answer.downvotedBy = answer.downvotedBy.filter((e) => e !== email);
      }
    }

    await answer.save();
    res.status(200).json({ message: "Upvote toggled", answer });
  } catch (error) {
    res.status(500).json({ message: "Error toggling upvote", error: error.message });
  }
});

// Toggle Downvote
router.post("/downvote/:answerId", async (req, res) => {
  const { email } = req.body; // User email from request body

  try {
    const answer = await AnswerDB.findById(req.params.answerId);

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    if (answer.downvotedBy.includes(email)) {
      // If already downvoted, remove the downvote
      answer.downvote -= 1;
      answer.downvotedBy = answer.downvotedBy.filter((e) => e !== email);
    } else {
      // Add downvote and remove upvote if it exists
      answer.downvote += 1;
      answer.downvotedBy.push(email);
      if (answer.upvotedBy.includes(email)) {
        answer.upvote -= 1;
        answer.upvotedBy = answer.upvotedBy.filter((e) => e !== email);
      }
    }

    await answer.save();
    res.status(200).json({ message: "Downvote toggled", answer });
  } catch (error) {
    res.status(500).json({ message: "Error toggling downvote", error: error.message });
  }
});


// Get all answers related to a specific question
router.get("/question/:questionId", async (req, res) => {
  try {
    const answers = await AnswerDB.find({ questionId: req.params.questionId }, { __v: 0 }); // Exclude __v field
    if (!answers.length) {
      return res.status(404).json({ message: "No answers found for this question" });
    }
    res.status(200).json(answers);
  } catch (err) {
    console.error("Error retrieving answers:", err);
    res.status(500).json({ message: "Error retrieving answers", error: err.message });
  }
});


module.exports = router;
