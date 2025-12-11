
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");

router.use(authMiddleware);

const {
    getAllExpenses,
    getAddExpenseForm,
    createExpense,
    getEditExpenseForm,
    updateExpense,
    deleteExpense,
    updateBudget,
    getExpenseRanking,
    getExpenseCalendar
} = require("../controllers/expenseController");

router.route("/")
.get(getAllExpenses);

router.route("/ranking")
.get(getExpenseRanking);

router.route("/add")
.get(getAddExpenseForm)
.post(createExpense);

router.route("/budget")
.post(updateBudget);

router.route("/calendar")
.get(getExpenseCalendar);

router.route("/edit/:id")
.get(getEditExpenseForm)
.put(updateExpense);

router.route("/delete/:id")
.delete(deleteExpense);

module.exports = router;