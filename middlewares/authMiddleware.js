const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const authMiddleware = asyncHandler(async(req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.send(`
            <script>
                alert('로그인이 필요한 서비스입니다.');
                location.href = '/users/login';
            </script>
        `);
    }

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decode.id).select("-password");
        
        if (!req.user) {
            throw new Error("User not found");
        }
        
        next(); // 인증 성공 후 다음 단계로 이동
    } catch (error) {
        return res.send(`
            <script>
                alert('인증이 만료되었습니다. 다시 로그인해주세요.');
                location.href = '/users/login';
            </script>
        `);
    }
});

module.exports = { authMiddleware };