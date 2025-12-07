const express = require("express");
const router = express.Router();
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");
const { 
    getAdminPage, 
    createNotice, 
    deleteNotice,
    getEditNoticeForm,
    updateNotice
} = require("../controllers/adminController");

router.use(authMiddleware, adminMiddleware);

router.route("/").get(getAdminPage);
router.route("/notice").post(createNotice);
router.route("/notice/:id")
    .delete(deleteNotice)
    .put(updateNotice);

router.route("/notice/edit/:id").get(getEditNoticeForm);

module.exports = router;