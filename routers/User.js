const express = require("express");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// JWT Secret
const JWT_SECRET = "your_jwt_secret"; // Replace with your own secret key

// Register a user
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, contactNumber, year, email, password, rating } = req.body;

    // Check for missing fields
    if (!firstName || !lastName || !contactNumber || !year || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    console.log("Received registration request for:", email);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password using argon2
    const hashedPassword = await argon2.hash(password);
    console.log("Password hashed successfully");

    // Create new user
    const user = new User({
      firstName,
      lastName,
      contactNumber,
      year,
      email,
      password: hashedPassword,
      rating,
    });

    // Save user to database
    await user.save();
    console.log("User registered successfully:", email);
    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
});

// Login a user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists and verify password in a single block
    const user = await User.findOne({ email });
    if (!user || !(await argon2.verify(user.password, password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "24h" });

    res.status(200).json({ message: "Login successful", token , email: user.email,id:user._id});
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});


// Logout a user
router.post("/logout", (req, res) => {
  try {
    // To log out, simply clear the token on the client side
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Error logging out", error });
  }
});



// Get user details based on email or userId
router.get('/users', async (req, res) => {
  const { email, userId } = req.query;

  if (!email && !userId) {
      return res.status(400).json({
          success: false,
          message: "Please provide either an email or a userId."
      });
  }

  try {
      const query = email ? { email } : { _id: userId };
      const user = await User.findOne(query);

      if (!user) {
          return res.status(404).json({
              success: false,
              message: "User not found."
          });
      }

      return res.status(200).json({
          success: true,
          user: user
      });
  } catch (error) {
      return res.status(500).json({
          success: false,
          message: "Error fetching user details.",
          error: error.message
      });
  }
});

// Get all users
router.get('/users/all', async (req, res) => {
  try {
      const users = await User.find(); // Fetch all users from the database

      return res.status(200).json({
          success: true,
          users: users
      });
  } catch (error) {
      return res.status(500).json({
          success: false,
          message: "Error fetching users.",
          error: error.message
      });
  }
});



module.exports = router;
