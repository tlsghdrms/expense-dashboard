const mongoose = require("mongoose");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const dbConnect = async () => {
    try {
        const connect = await mongoose.connect(process.env.DB_CONNECT);
        console.log("DB connected");

        // 관리자 시딩 로직
        const adminId = process.env.ADMIN_ID;
        const adminPw = process.env.ADMIN_PW;

        if (adminId && adminPw) {
            const adminExists = await User.findOne({ role: adminId });
            if (!adminExists) {
                const hashedPassword = await bcrypt.hash(adminPw, 10);
                await User.create({
                    username: adminId,
                    password: hashedPassword,
                    role: "admin",
                    budget: 100000000
                });
                console.log(`관리자 계정 생성됨: ${adminId}`);
            }
        }
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

module.exports = dbConnect;