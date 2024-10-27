const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const AnswerDB = require("../models/Answers");
const UserDB = require("../models/User"); // Assuming a User schema exists
const Counter = require('../models/Counter'); // Adjust the path as necessary
const QuestionDB = require("../models/Question");
const MentorDB=require("../models/MentorSession");


// 1. Create a MentorSession and store in DB
router.post("/create", async (req, res) => {
    try {
      const { meetLink, scheduleTime, status, conductedByName, conductedByEmail, date, title, description, duration } = req.body;
  
      const newSession = new MentorDB({
        meetLink,
        scheduleTime,
        status,
        conductedByName,
        conductedByEmail,
        date,
        title,
        description,
        duration
      });
  
      const savedSession = await newSession.save();
      res.status(201).json({
        success: true,
        message: "Mentor session created successfully",
        data: savedSession
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Error creating mentor session",
        error: error.message
      });
    }
  });
  
  // 2. Get all MentorSessions
  router.get("/getall-mentor-sessions", async (req, res) => {
    try {
      const sessions = await MentorDB.find();
      res.status(200).json({
        success: true,
        data: sessions
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Error fetching mentor sessions",
        error: error.message
      });
    }
  });
  
// 3. Get MentorSessions based on status
router.get("/mentor-sessions/status/:status", async (req, res) => {
    try {
        const { status } = req.params;
  
        // Validate status parameter to be within enum values
        if (!["Scheduled", "Completed", "Cancelled"].includes(status)) {
            return res.status(400).json({
            success: false,
            message: "Invalid status parameter. Use 'Scheduled', 'Completed', or 'Cancelled'."
            });
        }
  
        const sessions = await MentorDB.find({ status });
        res.status(200).json({
            success: true,
            data: sessions
        });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Error fetching sessions by status",
        error: error.message
      });
    }
});
// Fetch a specific mentor session by ID
router.get("/mentor-sessions/:id", async (req, res) => {
    try {
      const session = await MentorDB.findById(req.params.id);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: "Mentor session not found",
        });
      }
      res.status(200).json({
        success: true,
        session,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Error fetching mentor session",
        error: error.message,
      });
    }
  });

  // Update a mentor session by ID
router.put("/mentor-sessions/:id", async (req, res) => {
    try {
      const session = await MentorDB.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // Return the updated document
        runValidators: true, // Validate the updated fields
      });
  
      if (!session) {
        return res.status(404).json({
          success: false,
          message: "Mentor session not found",
        });
      }
  
      res.status(200).json({
        success: true,
        message: "Mentor session updated successfully",
        session,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Error updating mentor session",
        error: error.message,
      });
    }
});


module.exports = router;