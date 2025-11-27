const asyncHandler = require("express-async-handler");
const Expense = require("../models/expenseModel");
const User = require("../models/userModel");

// @desc    Get expenses by month & Category & Budget Info 
// @route   GET /expenses
const getAllExpenses = asyncHandler(async (req, res) => {
    let { year, month, category } = req.query;
    const now = new Date();

    if (!year) year = now.getFullYear();
    if (!month) month = now.getMonth() + 1;

    // 숫자로 변환 (비교 및 계산용)
    const selectedYear = Number(year);
    const selectedMonth = Number(month);

    // 날짜 범위 계산    
    const paddedMonth = String(selectedMonth).padStart(2, '0');
    const startDate = new Date(`${selectedYear}-${selectedMonth}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // DB 검색 조건
    const dbQuery = {
        user_id: req.user._id,
        date: { $gte: startDate, $lt: endDate }
    };

    if (category && category !== "all") {
        dbQuery.category = category;
    }
    
    const expenses = await Expense.find(dbQuery).sort({ date: 1});

    const categoryTotals = {};
    let totalSpent = 0;

    expenses.forEach(expense => {
        totalSpent += expense.amount;
        if (categoryTotals[expense.category]) {
            categoryTotals[expense.category] += expense.amount;
        } else {
            categoryTotals[expense.category] = expense.amount;
        }
    });

    const chartLabels = Object.keys(categoryTotals);
    const chartData = Object.values(categoryTotals);

    // 유저 정보 예산 포함
    const user = await User.findById(req.user._id);

    res.render("dashboard", {
        expenses: expenses,
        user: user,
        chartLabels: JSON.stringify(chartLabels),
        chartData: JSON.stringify(chartData),
        selectedYear: selectedYear,
        selectedMonth: selectedMonth,
        selectedCategory: category || "all",
        totalSpent: totalSpent
    });
});

// @desc    Show add expense form 
// @route   GET /expenses/add
const getAddExpenseForm = asyncHandler(async (req, res) => {
    res.render("add", { user: req.user});
});

// @desc    Create new expense 
// @route   POST /expenses/add
const createExpense = asyncHandler(async (req, res) => {
    const { title, amount, category, date } = req.body;

    if (!title || !amount || !category || !date) {
        res.status(400);
        throw new Error("모든 필수 항목(제목, 금액, 카테고리, 날짜)을 입력해주세요.");
    }

    await Expense.create({
        title,
        amount,
        category,
        date,
        user_id: req.user._id,
    });

    res.redirect("/expenses");
});

// @desc    Show edit expense form 
// @route   GET /expenses/edit/:id
const getEditExpenseForm = asyncHandler(async (req, res) => {
    const expense = await Expense.findById(req.params.id);

    if (!expense || expense.user_id.toString() !== req.user._id.toString()) {
        res.status(401); throw new Error("권한 없음"); 
    }
    
    res.render("update", { expense: expense, user: req.user });
});

// @desc    Update expense
// @route   PUT /expenses/edit/:id
const updateExpense = asyncHandler(async (req, res) => {
    await Expense.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.redirect("/expenses");
});

// @desc    Delete expense
// @route   DELETE /expenses/delete/:id
const deleteExpense = asyncHandler(async (req, res) => {
    await Expense.findByIdAndDelete(req.params.id);
    
    res.redirect("/expenses");
});

const updateBudget = asyncHandler(async (req, res) => {
    const { budget } = req.body;

    await User.findByIdAndUpdate(req.user._id, { budget: budget });

    res.redirect("/expenses");
});

module.exports = {
    getAllExpenses,
    updateBudget,
    getAddExpenseForm,
    createExpense,
    getEditExpenseForm,
    updateExpense,
    deleteExpense,
};