const express = require("express");

const router = express.Router();

const { chatWithAgent } = require("../Controllers/AgentController");

const { protect } = require("../Middleware/AuthMiddleware");

router.post("/chat", protect, chatWithAgent);

module.exports = router;