const Note = require("../Models/Note");
const generateEmbedding = require("../AI/embedding");
const storeVector = require("../AI/storeVector");

const createNotes = async (req, res) => {
    try {
        const { title, description } = req.body;

        // Save note in MongoDB
        const note = await Note.create({
            title,
            description,
            user: req.user._id
        });

        // Combine title and description
        const text = `${title}\n${description}`;

        // Generate embedding
        const embedding = await generateEmbedding(text);

        // Store embedding in Qdrant
        await storeVector(
    embedding,
    {
        title,
        description,
        userId: req.user._id.toString(),
        noteId: note._id.toString()
    }
);
        res.status(201).json({
            message: "Note Created Successfully",
            note
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: error.message
        });
    }
};

const getNotes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const search = req.query.search || ""; 

        const skip = (page - 1) * limit;

        // 1. Build a clean base query for the logged-in user
        const query = {
            user: req.user._id
        };

        // 2. ONLY add the $or regex search if search is not empty!
        if (search.trim() !== "") {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        // 3. Fetch paginated & filtered notes
        const notes = await Note.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // 4. Count total matching notes
        const totalNotes = await Note.countDocuments(query);
        const totalPages = Math.ceil(totalNotes / limit);

        res.status(200).json({
            notes,
            currentPage: page,
            totalPages,
            totalNotes
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const updateNotes = async (req, res) => {
    try {
        const { title, description } = req.body;

        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        note.title = title;
        note.description = description;

        await note.save();

        res.status(200).json({
            message: "Note Updated Successfully",
            note
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const deleteNotes = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).json({
                message: "Not authorized"
            });
        }

        await note.deleteOne();

        res.status(200).json({
            message: "Note Deleted Successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    createNotes,
    getNotes,
    updateNotes,
    deleteNotes
};