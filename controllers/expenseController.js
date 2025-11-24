const asyncHandler = require("express-async-handler");
const Expense = require("../models/expenseModel");

// @desc    Get all expenses 
// @route   GET /expenses
const getAllExpenses = asyncHandler(async (req, res) => {
    let queryMonth = req.query.month;

    if (!queryMonth) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        queryMonth = `${year}-${month}`;
    }

    const startDate = new Date(queryMonth + "-01");
    const endDate = new Date(queryMonth + "-01");
    endDate.setMonth(endDate.getMonth() + 1);

    const expenses = await Expense.find({ 
        user_id: req.user._id,
        date: {
            $gte: startDate,
            $lt: endDate     
        }
    }).sort({ date: 1 });

    const categoryTotals = {};
    expenses.forEach(expense => {
        if (categoryTotals[expense.category]) {
            categoryTotals[expense.category] += expense.amount;
        } else {
            categoryTotals[expense.category] = expense.amount;
        }
    });

    const chartLabels = Object.keys(categoryTotals);
    const chartData = Object.values(categoryTotals);

    res.render("dashboard", { 
        expenses: expenses, 
        user: req.user,
        chartLabels: JSON.stringify(chartLabels),
        chartData: JSON.stringify(chartData),
        selectedMonth: queryMonth
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

    if (!expense) {
        res.status(404);
        throw new Error("지출 내역을 찾을 수 없습니다.");
    }

    if (expense.user_id.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error("접근 권한이 없습니다.");
    }

    res.render("update", { expense: expense, user: req.user });
});

// @desc    Update expense
// @route   PUT /expenses/edit/:id
const updateExpense = asyncHandler(async (req, res) => {
    const expense = await Expense.findById(req.params.id);

    if(!expense) {
        res.status(404);
        throw new Error("지출 내역을 찾을 수 없습니다.");
    }

    if (expense.user_id.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error("접근 권한이 없습니다.");
    }

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
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
        res.status(404);
        throw new Error("지출 내역을 찾을 수 없습니다.");
    }
    if (expense.user_id.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error("접근 권한이 없습니다. (본인 내역 아님)");
    }

    await Expense.findByIdAndDelete(req.params.id);
    
    res.redirect("/expenses");
});

module.exports = {
    getAllExpenses,
    getAddExpenseForm,
    createExpense,
    getEditExpenseForm,
    updateExpense,
    deleteExpense,
};