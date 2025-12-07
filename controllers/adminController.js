const asyncHandler = require("express-async-handler");
const Notice = require("../models/noticeModel");
const User = require("../models/userModel");

// @desc    Get admin dashboard
// @route   GET /admin
const getAdminPage = asyncHandler(async (req, res) => {
    const notices = await Notice.find({}).sort({ createdAt: -1 });
    const userCount = await User.countDocuments({ role: { $ne: 'admin' } });
    
    res.render("admin/dashboard", { 
        notices, 
        userCount, 
        user: req.user 
    });
});

// @desc    Create a new notice
// @route   POST /admin/notice
const createNotice = asyncHandler(async (req, res) => {
    const { title, content } = req.body;

    await Notice.create({
        title,
        content,
        author: req.user._id
    });
    res.redirect("/admin");
});

// @desc    Delete a notice
// @route   DELETE /admin/notice/:id
const deleteNotice = asyncHandler(async (req, res) => {
    await Notice.findByIdAndDelete(req.params.id);
    res.redirect("/admin");
});

// @desc    Show edit notice form
// @route   GET /admin/notice/edit/:id
const getEditNoticeForm = asyncHandler(async (req, res) => {
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
        res.status(404);
        throw new Error("Notice not found");
    }

    res.render("admin/editNotice", { notice });
});

// @desc    Update notice content
// @route   PUT /admin/notice/:id
const updateNotice = asyncHandler(async (req, res) => {
    const { title, content } = req.body;
    
    await Notice.findByIdAndUpdate(req.params.id, { 
        title, 
        content 
    });

    res.redirect("/admin");
});

module.exports = { 
    getAdminPage, 
    createNotice, 
    deleteNotice,
    getEditNoticeForm,
    updateNotice
};