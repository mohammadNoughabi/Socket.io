const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logger = require("../helpers/logger");
require("dotenv").config();

exports.validateToken = async (req, res) => {
  try {
    // The cookie-parser middleware automatically parses cookies
    const token = req.cookies?.token;

    if (!token) {
      return res.json({ isAuthenticated: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Optionally verify user still exists in DB
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.json({ isAuthenticated: false, userId: null , token: null});
    }

    return res.json({
      isAuthenticated: true,
      userId: decoded.id,
      token: token,
    });
  } catch (error) {
    return res.json({ isAuthenticated: false });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const userExists = await User.userExists(username);
    if (userExists) {
      return res
        .status(400)
        .json({ message: "Username already taken", success: false });
    }
    const newUser = await User.create(username, password);
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(201).json({
      token: token,
      user: newUser,
      message: "User registered successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const userExists = await User.userExists(username);
    if (!userExists) {
      return res
        .status(401)
        .json({ message: "Invalid credentials", success: false });
    }
    const isValid = await User.validatePassword(username, password);
    if (!isValid) {
      return res
        .status(401)
        .json({ message: "Invalid credentials", success: false });
    }
    const user = await User.findByUsername(username);
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      message: "Login successful",
      token: token,
      user: user,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });

    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ id: user.id, username: user.username });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, password } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (username) {
      const usernameTaken = await User.userExists(username);
      if (usernameTaken) {
        return res.status(400).json({ message: "Username already taken" });
      }
      await User.updateUsername(userId, username);
    }
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      await User.updatePassword(userId, passwordHash);
    }

    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await User.deleteById(userId);
    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
