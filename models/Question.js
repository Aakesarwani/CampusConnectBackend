const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  apiAnswer:{
    type:String,
    default:null,
  },
  imageUrl:{
    type:String,
    default:null,
  },
  postedBy: {
    type: String,
    required: true,
  },
  name: {
    type: String, // Name can be a string or null
    default: null, // Default value is null
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  tags: {
    type: [String], // Array of strings for multiple tags
    default: [],
  },
  answers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answers", // Reference to the Answers model
    },
  ],
});

module.exports = mongoose.model("Questions", questionSchema);
