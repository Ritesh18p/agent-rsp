const express = require("express");

const router = express.Router();

const { createNotes, getNotes, updateNotes, deleteNotes } = require("../Controllers/NoteController");
const { protect } = require("../Middleware/AuthMiddleware");

router.post("/", protect, createNotes);
router.get("/", protect, getNotes);
router.put("/:id", protect, updateNotes);
router.delete("/:id", protect, deleteNotes);

module.exports = router;