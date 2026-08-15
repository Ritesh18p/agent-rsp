const express = require("express");
const router = express.Router();

const { searchNotes } = require("../Controllers/AIController");
const { protect } = require("../Middleware/authMiddleware");

router.post("/search", protect, searchNotes);

module.exports = router;