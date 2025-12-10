
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Expense = require("../models/expenseModel");
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

    const hashedPassword = await bcrypt.hash(password, 10);

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

<<<<<<< HEAD
        res.redirect("/");
=======
        if (user.role === 'admin') {
            res.redirect("/admin"); // 관리자는 관리자 페이지로
        } else {
            res.redirect("/expenses"); // 일반 유저는 지출 내역으로
        }
>>>>>>> 0b36f178071de6d8d24699ec7ff06b048f03a4f3
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

//@desc Delete user & expenses
//@route DELETE /users/withdraw
const withdrawUser = asyncHandler(async(req, res) => {
    const userId = req.user._id;

    await Expense.deleteMany({ user_id: userId });
    await User.findByIdAndDelete(userId);

    res.clearCookie("token", {
        httpOnly: true,
        path: "/",
    });

    console.log(`회원 탈퇴 완료: ${req.user.username}`);

    res.redirect("/");
});

// @desc    Show My Page
// @route   GET /users/mypage
const getMyPage = (req, res) => {
    res.render("mypage", { user: req.user });
};

// @desc    Update User Info
// @route   PUT /users/mypage
const updateUser = asyncHandler(async (req, res) => {
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
        res.status(400);
        throw new Error("변경할 비밀번호를 모두 입력해주세요.");
    }

    if (newPassword !== confirmPassword) {
        res.status(400);
        throw new Error("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { password: hashedPassword },
        { new: true }
    );

    if (updatedUser) {
        console.log(`비밀번호 변경 완료: ${updatedUser.username}`);
        res.redirect("/");
    } else {
        res.status(400);
        throw new Error("정보 수정에 실패했습니다.");
    }
});

module.exports = {
    getRegisterForm,
    registerUser,
    getLoginForm,
    loginUser,
    logoutUser,
    withdrawUser,
    getMyPage,
    updateUser,
};