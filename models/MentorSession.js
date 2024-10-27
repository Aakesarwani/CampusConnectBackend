const mongoose = require("mongoose");

const mentorSessionSchema = new mongoose.Schema({
  meetLink: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^(https:\/\/)?(meet\.google\.com\/|zoom\.us\/j\/)/.test(v);
      },
      message: "Invalid meeting link format."
    }
  },
  scheduleTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["Scheduled", "Completed", "Cancelled"],
    default: "Scheduled"
  },
  conductedByName: {
    type: String,
    required: true
  },
  conductedByEmail:{
    type:String,
    required:true
  },
  date: {
    type: Date,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // Duration in minutes
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update updatedAt before saving
mentorSessionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("MentorSession", mentorSessionSchema);
