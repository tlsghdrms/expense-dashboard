// models/userModel.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
        type: String,
        required: [true, "아이디를 입력해주세요."],
        unique: true,
        },
        password: {
        type: String,
        required: [true, "비밀번호를 입력해주세요."],
        },
        budget: {
            type: Number,
            default: 0
        },
        role: {
            type: String,
            enum: ["user", "admin"], 
            default: "user"
        }
    },
    { timestamps: true, }
);

module.exports = mongoose.model("User", userSchema);