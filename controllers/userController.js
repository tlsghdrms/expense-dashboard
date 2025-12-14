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
        return res.send(`
            <script>
                alert("아이디와 비밀번호를 모두 입력해주세요.");
                history.back();
            </script>
        `);
    }

    const userExists = await User.findOne({ username });

    if (userExists) {
        return res.send(`
            <script>
                alert("이미 존재하는 아이디입니다.");
                location.href = "/users/register";
            </script>
        `);
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
        return res.send(`
            <script>
                alert("아이디와 비밀번호를 모두 입력해주세요.");
                location.href = "/login"; //
            </script>
        `);
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

        if (user.role === 'admin') {
            res.redirect("/admin");
        } else {
            res.redirect("/expenses");
        }

    } else {
        res.send(`
            <script>
                alert("아이디 또는 비밀번호가 일치하지 않습니다.");
                location.href = "/users/login";
            </script>
        `);
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

    res.redirect("/");
});

// @desc    Show My Page
// @route   GET /users/mypage
const getMyPage = (req, res) => {
    res.render("mypage", { user: req.user, error: null });
};

// @desc    Update User Info
// @route   PUT /users/mypage
const updateUser = asyncHandler(async (req, res) => {
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
        return res.send(`
            <script>
                alert("변경할 비밀번호를 모두 입력해주세요.");
                history.back();
            </script>
        `);
    }

    if (newPassword !== confirmPassword) {
        return res.send(`
            <script>
                alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
                history.back();
            </script>
        `);
    }

    const currentUser = await User.findById(req.user._id);
    const isSamePassword = await bcrypt.compare(newPassword, currentUser.password);

    if (isSamePassword) {
        return res.render("mypage", { 
            user: req.user, 
            error: "이미 사용 중인 비밀번호 입니다." 
        });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { password: hashedPassword },
        { new: true }
    );

    if (updatedUser) {
        console.log(`비밀번호 변경 완료: ${updatedUser.username}`);
        res.send(`
            <script>
                alert("비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.");
                location.href = "/users/logout";
            </script>
        `);
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