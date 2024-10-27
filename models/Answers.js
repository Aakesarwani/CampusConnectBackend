const mongoose = require("mongoose");


const answerSchema = new mongoose.Schema({
  questionId: {
    type: String,  // Store integer question IDs
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  upvote: {
    type: Number,
    default: 0,
  },
  downvote: {
    type: Number,
    default: 0,
  },
  userEmail: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  answerId: {
    type: String,
    required: true,
    unique: true,
  },
  upvotedBy: {
    type: [String], // Array to store emails of users who upvoted
    default: [],
  },
  downvotedBy: {
    type: [String], // Array to store emails of users who downvoted
    default: [],
  },
},{ timestamps: true });

module.exports = mongoose.model("Answers", answerSchema);





