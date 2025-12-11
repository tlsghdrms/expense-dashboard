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

    const selectedYear = Number(year);
    const selectedMonth = Number(month);
  
    const paddedMonth = String(selectedMonth).padStart(2, '0');
    const startDate = new Date(`${selectedYear}-${selectedMonth}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const dbQuery = {
        user_id: req.user._id,
        date: { $gte: startDate, $lt: endDate }
    };

    if (category && category !== "all") {
        dbQuery.category = category;
    }
    
    const expenses = await Expense.find(dbQuery).sort({ date: 1 });

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

    const user = await User.findById(req.user._id);
    
    res.render("dashboard", {
        expenses: expenses,
        user: user,
        chartLabels: JSON.stringify(chartLabels),
        chartData: JSON.stringify(chartData),
        selectedYear: selectedYear,
        selectedMonth: selectedMonth,
        selectedCategory: category || "all",
        totalSpent: totalSpent,
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

// @desc    Get spending ranking
// @route   GET /expenses/ranking
const getExpenseRanking = asyncHandler(async (req, res) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    const startDate = new Date(`${year}-${String(month).padStart(2,'0')}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const allUsers = await User.find({ role: { $ne: 'admin' } }, '_id');
    const expenseStats = await Expense.aggregate([
        {
            $match: {
                date: { $gte: startDate, $lt: endDate }
            }
        },
        {
            $group: {
                _id: "$user_id",
                totalAmount: { $sum: "$amount" }
            }
        }
    ]);

    const expenseMap = {};
    expenseStats.forEach(stat => {
        expenseMap[stat._id.toString()] = stat.totalAmount;
    });

    const fullRanking = allUsers.map(user => {
        return {
            _id: user._id,
            totalAmount: expenseMap[user._id.toString()] || 0
        };
    });

    fullRanking.sort((a, b) => a.totalAmount - b.totalAmount);

    const myIndex = fullRanking.findIndex(item => item._id.toString() === req.user._id.toString());
    let myRank, myTotal, percentile;

    if (myIndex === -1) {
        myRank = "-";
        myTotal = 0;
        percentile = 0;
    } else {
        myRank = myIndex + 1;
        myTotal = fullRanking[myIndex].totalAmount;
        const totalUsers = fullRanking.length;
        percentile = Math.round((myRank / totalUsers) * 100);
    }

    const totalUsers = fullRanking.length;

    res.render("ranking", {
        user: req.user,
        month: month,
        myTotal: myTotal,
        myRank: myRank,
        totalUsers: totalUsers,
        percentile: percentile
    });
});

// @desc Get expense calendar
// @route GET /expenses/calendar
const getExpenseCalendar = asyncHandler(async(req, res) => {
    const { year, month } = req.query;
    const today = new Date();
    const currentYear = year ? parseInt(year) : today.getFullYear();
    const currentMonth = month ? parseInt(month) : today.getMonth() + 1;

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 1);

    const firstDayIndex = startDate.getDay();
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    const dailyStats = await Expense.aggregate([
        {
            $match: {
                user_id: req.user._id,
                date: { $gte: startDate, $lt: endDate }
            }
        },
        {
            $group: {
                _id: { $dayOfMonth: "$date" },
                total: { $sum: "$amount" }
            }
        }
    ]);

    const dailyMap = {};
    dailyStats.forEach(stat => {
        dailyMap[stat._id] = stat.total;
    });

    res.render("calendar", {
        year: currentYear,
        month: currentMonth,
        firstDayIndex,
        daysInMonth,
        dailyMap,
        user: req.user
    });
});

module.exports = {
    getAllExpenses,
    updateBudget,
    getAddExpenseForm,
    createExpense,
    getEditExpenseForm,
    updateExpense,
    deleteExpense,
    getExpenseRanking,
    getExpenseCalendar
};