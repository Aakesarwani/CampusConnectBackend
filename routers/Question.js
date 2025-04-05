const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const QuestionDB = require("../models/Question");
const Counter = require('../models/Counter');
const UserDB = require("../models/User");
const jwt = require("jsonwebtoken");

// Post a question
/*
router.post("/create", async (req, res) => {
  // Extract token from Authorization header
  const authHeader = req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Get the token part
  let userId;

  // Verify the token
  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Use your JWT secret
    userId = decoded.userId; // Extract userId from the decoded token
  } catch (err) {
    return res.status(401).send({ message: "Unauthorized: Invalid token" });
  }

  // Create question data with the userId from the token
  const questionData = new QuestionDB({
    questionId: req.body.questionId,
    title: req.body.title,
    description: req.body.description,
    postedBy: userId, // Use the userId from the token
    tags: req.body.tags,
  });

  try {
    const doc = await questionData.save();
    res.status(201).send(doc);
  } catch (err) {
    res.status(400).send({
      message: "Question not added successfully",
      error: err.message,
    });
  }
});
// Post a question
router.post("/create", async (req, res) => {
  const { email, title, description, tags } = req.body;

  if (!email) {
    return res.status(400).send({ message: "Email is required" });
  }

  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "questionId" },
      { $inc: { sequenceValue: 1 } },
      { new: true, upsert: true }
    );

    const questionId = counter.sequenceValue;

    const questionData = new QuestionDB({
      questionId,
      title,
      description,
      postedBy: email, // Use email or a user reference
      tags,
    });

    const doc = await questionData.save();
    res.status(201).send(doc);
  } catch (err) {
    console.error("Error saving question:", err); // Log the error for debugging
    res.status(500).send({
      message: "Failed to add question",
      error: err.message,
    });
  }
});*/
router.post("/create", async (req, res) => {
  const { email, title, description, tags,imageUrl, apiAnswer } = req.body;

  if (!email) {
    return res.status(400).send({ message: "Email is required" });
  }

  try {
    // Fetch user information based on the provided email
    const user = await UserDB.findOne({ email });
    
    // Check if the user exists
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Extract first name and last name from the user object
    const { firstName, lastName } = user;

    // Fetch and increment the questionId
    const counter = await Counter.findOneAndUpdate(
      { name: "questionId" },
      { $inc: { sequenceValue: 1 } },
      { new: true, upsert: true }
    );

    const questionId = counter.sequenceValue; // Get the incremented questionId

    // Create question data with the generated questionId and user names
    const questionData = new QuestionDB({
      questionId,
      title,
      description,
      postedBy: email, // Use the email from the request body
      tags,
      imageUrl,
      apiAnswer,
      name: `${firstName} ${lastName}`, // Store full name in the question
    });

    const doc = await questionData.save();
    res.status(201).send(doc);
  } catch (err) {
    console.error("Error saving question:", err); // Log the error for debugging
    res.status(500).send({
      message: "Failed to add question",
      error: err.message,
    });
  }
});






// Fetch questions posted by a particular user
router.get("/user-questions", async (req, res) => {
  // Extract email from the query parameters
  const { email } = req.query;

  // Check if the email is provided
  if (!email) {
    return res.status(400).send({ message: "Email is required" });
  }

  try {
    // Fetch questions posted by the user based on email
    const questions = await QuestionDB.find({ postedBy: email });

    // Check if questions exist
    if (questions.length === 0) {
      return res.status(404).send({ message: "No questions found for this user" });
    }

    res.status(200).send(questions);
  } catch (error) {
    res.status(500).send({
      message: "Error fetching questions",
      error: error.message,
    });
  }
});


// Get all questions
router.get("/getall", async (req, res) => {
  try {
    const questions = await QuestionDB.aggregate([
      {
        $lookup: {
          from: "comments",
          let: { question_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$question_id", "$$question_id"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                comment: 1,
                created_at: 1,
              },
            },
          ],
          as: "comments",
        },
      },
      {
        $lookup: {
          from: "answers",
          let: { question_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$question_id", "$$question_id"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                answer: 1,
                created_at: 1,
              },
            },
          ],
          as: "answerDetails",
        },
      },
      {
        $project: {
          __v: 0,
        },
      },
    ]);
    res.status(200).send(questions);
  } catch (err) {
    res.status(400).send({
      message: "Error in retrieving questions",
      error: "Bad request",
    });
  }
});

// Get questions based on multiple tags
router.get("/tags", async (req, res) => {
  const tags = req.query.tags ? req.query.tags.split(",") : [];
  
  try {
    const questions = await QuestionDB.find({ tags: { $all: tags } });
    res.status(200).send(questions);
  } catch (err) {
    res.status(400).send({
      message: "Error in retrieving questions by tags",
    });
  }
});

// Get a specific question by ID
router.get("/:questionId", async (req, res) => {
  try {
    const questionDetails = await QuestionDB.aggregate([
      {
        $match: { questionId: req.params.questionId }, // Match using questionId
      },
      {
        $lookup: {
          from: "answers",
          let: { question_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$question_id", "$$question_id"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                user: 1,
                answer: 1,
                question_id: 1,
                created_at: 1,
              },
            },
          ],
          as: "answerDetails",
        },
      },
      {
        $lookup: {
          from: "comments",
          let: { question_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$question_id", "$$question_id"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                question_id: 1,
                user: 1,
                comment: 1,
                created_at: 1,
              },
            },
          ],
          as: "comments",
        },
      },
      {
        $project: {
          __v: 0,
        },
      },
    ]);
    
    // Check if the question was found
    if (questionDetails.length === 0) {
      return res.status(404).send({ message: "Question not found" });
    }

    res.status(200).send(questionDetails[0]); // Return the first matched question
  } catch (err) {
    res.status(500).send({
      message: "Error retrieving question",
      error: err.message,
    });
  }
});

//Store API answer
router.put('/api-answer', async (req, res) => {
  const { questionId, apiAnswer } = req.body;

  try {
    // Find the question by questionId and update the apiAnswer field
    const updatedQuestion = await QuestionDB.findOneAndUpdate(
      { questionId: questionId },
      { apiAnswer: apiAnswer },
      { new: true } // Return the updated document
    );

    if (!updatedQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    // Send a successful response with the updated question
    res.status(200).json({
      success: true,
      message: 'apiAnswer updated successfully',
      question: updatedQuestion,
    });
  } catch (error) {
    console.error('Error updating apiAnswer:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating apiAnswer',
      error: error.message,
    });
  }
});


// Delete a question
router.delete("/:questionId", async (req, res) => {
  try {
    // Attempt to delete the question by questionId
    const result = await QuestionDB.findOneAndDelete({ questionId: req.params.questionId });
    
    // Check if the question was found and deleted
    if (!result) {
      return res.status(404).send({ message: "Question not found" });
    }

    res.status(200).send({ message: "Question deleted successfully" });
  } catch (err) {
    res.status(500).send({
      message: "Error deleting question",
      error: err.message,
    });
  }
});


module.exports = router;
