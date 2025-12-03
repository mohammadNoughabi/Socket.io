const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");

const {
  validateToken,
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  deleteAccount,
} = require("../controllers/auth.controller");

const authRouter = express.Router();

authRouter.get("/validate-token", validateToken);
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/profile/:id", authenticateToken, getProfile);
authRouter.put("/profile/:id", authenticateToken, updateProfile);
authRouter.delete("/profile/:id", authenticateToken, deleteAccount);

module.exports = authRouter;
