const express = require("express");

const router = express.Router();

const { registerUser, loginUser, deleteAccount } = require("../Controllers/UserController");

const { protect } = require("../Middleware/AuthMiddleware");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/profile", protect, (req, res) => {
    res.status(200).json({
        message: "Welcome to your profile",
        user: req.user
    });
});

// NEW: Delete Account Route
router.delete("/delete-account", protect, deleteAccount);

module.exports = router;