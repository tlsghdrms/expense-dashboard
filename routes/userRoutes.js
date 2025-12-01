
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");

const {
  getRegisterForm,
  registerUser,
  getLoginForm,
  loginUser,
  logoutUser,
  withdrawUser,
} = require("../controllers/userController");

router
.route("/register")
.get(getRegisterForm)
.post(registerUser);

router
.route("/login")
.get(getLoginForm)
.post(loginUser);

router
.route("/logout")
.get(logoutUser);

router.route("/withdraw", authMiddleware, withdrawUser);

module.exports = router;