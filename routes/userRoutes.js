
const express = require("express");
const router = express.Router();

const {
  getRegisterForm,
  registerUser,
  getLoginForm,
  loginUser,
  logoutUser,
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

module.exports = router;