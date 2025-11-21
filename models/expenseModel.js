const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        title: {
            type: String,
            required: [true, "지출 제목을 입력해주세요."],
        },
        amount: {
            type: Number,
            required: [true, "지출 금액을 입력해주세요."],
        },
        category: {
            type: String,
            required: [true, "카테고리를 선택해주세요."],
            enum: ["식비", "교통", "여가", "기타"], 
        },
        date: {
            type: Date,
            default: Date.now,
            required: [true, "날짜를 입력해주세요."],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Expense", expenseSchema);