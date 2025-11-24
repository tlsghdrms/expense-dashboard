
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken");

// @desc    Show register form
// @route   GET /users/register
const getRegisterForm = (req, res) => {
    res.render("register");
};

// @desc    Register a new user
// @route   POST /users/register
const registerUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if(!username || !password) {
        res.status(400);
        throw new Error("아이디와 비밀번호를 모두 입력해주세요");
    }

    const userExists = await User.findOne({ username });

    if (userExists) {
        res.status(400);
        throw new Error("이미 존재하는 아이디입니다.");
    }

    const salt = await bcrypt.getSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ username, password: hashedPassword });

    if (user) {
        res.redirect("/users/login");
    } else {
        res.status(400);
        throw new Error("사용자 등록에 실패했습니다.");
    }
});

// @desc    Show login form
// @route   GET /users/login
const getLoginForm = (req, res) => {
    res.render("login");
};

// @desc    Login a user
// @route   POST /users/login
const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password ) {
        res.status(400);
        throw new Error("아이디와 비밀번호를 모두 입력해주세요");
    }
    
    const user = await User.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: "1d" }
        );

        res.cookie("token", token, {
            httpOnly: true, 
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.redirect("/expenses");
    } else {
        res.status(401);
        throw new Error("아이디 또는 비밀번호가 일치하지 않습니다.");
    }
});

// @desc    Logout a user
// @route   GET /users/logout
const logoutUser = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        path: "/",
    });
    res.redirect("/users/login");
};

module.exports = {
  getRegisterForm,
  registerUser,
  getLoginForm,
  loginUser,
  logoutUser,
};