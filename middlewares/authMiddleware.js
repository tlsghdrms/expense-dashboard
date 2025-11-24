const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const authMiddleware = asyncHandler(async(req, res) => {
    let token;
    token = req.cookies.token;
    if (token) {
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decode.id).select("-password");
            next();
        } catch (error) {
            res.status(401);
            throw new Error("접근 권한이 없습니다. (Invalid token)");
        }
    } else {
        res.status(401);
        throw new Error("접근 권한이 없습니다. (No token)");
    }
});

module.exports = { authMiddleware };