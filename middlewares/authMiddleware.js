const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const authMiddleware = asyncHandler(async(req, res, next) => {
    let token;
    token = req.cookies.token;
    if (token) {
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decode.id).select("-password");
            next();
        } catch (error) {
            res.send(
                `<script type="text/javascript">
                    alert('인증 세션이 만료되었습니다. 다시 로그인해주세요.');
                    window.location.href = '/users/login';
                </script>`
            );
        }
    } else {
        res.send(
            `<script type="text/javascript">
                alert('로그인이 필요한 서비스입니다.');
                window.location.href = '/users/login';
            </script>`
        );
    }
});

module.exports = { authMiddleware };