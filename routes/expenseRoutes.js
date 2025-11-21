
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
} = require("../controllers/expenseController");

router.route("/").get(getAllExpenses);
router.route("/add").get(getAddExpenseForm).post(createExpense);
router.route("/edit/:id").get(getEditExpenseForm).put(updateExpense);
router.route("/delete/:id").delete(deleteExpense);

module.exports = router;