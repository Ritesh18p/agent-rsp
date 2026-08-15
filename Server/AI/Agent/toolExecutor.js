const mongoose = require("mongoose");
const Note = require("../../Models/Note");

const generateEmbedding = require("../embedding");
const searchVector = require("../searchVector");
const storeVector = require("../storeVector");
const deleteVector = require("../deleteVector");

// =========================================================
// OBJECT ID VALIDATION
// =========================================================

function isValidObjectId(id) {
    return (
        typeof id === "string" &&
        mongoose.Types.ObjectId.isValid(id)
    );
}

// =========================================================
// ESCAPE REGEX
// =========================================================

function escapeRegex(value) {
    return value.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );
}

// =========================================================
// EXECUTE TOOL
// =========================================================

async function executeTool(toolName, args, userId) {

    if (!userId) {
        return {
            success: false,
            message: "User authentication is required."
        };
    }

    switch (toolName) {

        // =====================================================
        // SEARCH NOTES
        // =====================================================

        case "searchNotes": {

            const query =
                typeof args.query === "string"
                    ? args.query.trim()
                    : "";

            if (!query) {
                return {
                    success: false,
                    message: "Search query is required."
                };
            }

            console.log("===== SEARCH NOTES =====");
            console.log({ query, userId });

            const embedding = await generateEmbedding(query);
            const results = await searchVector(embedding, userId);

            if (!Array.isArray(results) || results.length === 0) {
                return [];
            }

            const formattedResults = results
                .map((result) => {
                    const payload = result.payload || {};
                    return {
                        noteId: payload.noteId,
                        title: payload.title,
                        description: payload.description,
                        score: Number(Number(result.score || 0).toFixed(3))
                    };
                })
                .filter((result) => isValidObjectId(result.noteId));

            const uniqueNotes = [];
            const seenIds = new Set();

            for (const result of formattedResults) {
                if (seenIds.has(result.noteId)) continue;
                seenIds.add(result.noteId);
                uniqueNotes.push(result);
            }

            console.log("===== SEARCH RESULT =====");
            console.log(JSON.stringify(uniqueNotes, null, 2));

            return uniqueNotes;
        }

        // =====================================================
        // CREATE NOTE
        // =====================================================

        case "createNote": {

            const title =
                typeof args.title === "string"
                    ? args.title.trim()
                    : "";

            const content =
                typeof args.content === "string"
                    ? args.content.trim()
                    : "";

            if (!title) {
                return {
                    success: false,
                    message: "Note title is required."
                };
            }

            if (!content) {
                return {
                    success: false,
                    message: "Note content is required."
                };
            }

            console.log("===== CREATE NOTE =====");
            console.log({ title, content, userId });

            const note = await Note.create({
                title,
                description: content,
                user: userId
            });

            const noteId = note._id.toString();

            const text = `${title}\n${content}`;
            const embedding = await generateEmbedding(text);

            await storeVector(embedding, {
                title,
                description: content,
                userId: userId.toString(),
                noteId
            });

            console.log("===== NOTE CREATED =====");
            console.log({ title, noteId });

            return {
                success: true,
                message: "Note created successfully.",
                noteId,
                title
            };
        }

        // =====================================================
        // UPDATE NOTE
        // =====================================================

        case "updateNote": {

            const query =
                typeof args.query === "string"
                    ? args.query.trim()
                    : "";

            const additionalInformation =
                typeof args.additionalInformation === "string"
                    ? args.additionalInformation.trim()
                    : "";

            const newTitle =
                typeof args.newTitle === "string"
                    ? args.newTitle.trim()
                    : "";

            if (!query) {
                return {
                    success: false,
                    message: "Note title or topic is required."
                };
            }

            if (!additionalInformation) {
                return {
                    success: false,
                    message: "The information to add is required."
                };
            }

            console.log("===== UPDATE NOTE =====");
            console.log({ query, additionalInformation, newTitle, userId });

            // Step 1: Exact title match
            let note = await Note.findOne({
                title: {
                    $regex: `^${escapeRegex(query)}$`,
                    $options: "i"
                },
                user: userId
            });

            // Step 2: Partial title match
            if (!note) {
                note = await Note.findOne({
                    title: {
                        $regex: escapeRegex(query),
                        $options: "i"
                    },
                    user: userId
                });
            }

            // Step 3: Semantic fallback
            if (!note) {
                console.log("Title not found. Trying semantic search.");

                const embedding = await generateEmbedding(query);
                const results = await searchVector(embedding, userId);

                if (Array.isArray(results) && results.length > 0) {
                    for (const result of results) {
                        const possibleNoteId = result.payload?.noteId;

                        if (!isValidObjectId(possibleNoteId)) continue;

                        const existingNote = await Note.findOne({
                            _id: possibleNoteId,
                            user: userId
                        });

                        if (existingNote) {
                            note = existingNote;
                            break;
                        }
                    }
                }
            }

            if (!note) {
                return {
                    success: false,
                    message: `Could not find the note "${query}".`
                };
            }

            const realNoteId = note._id.toString();
            const oldTitle = note.title;
            const oldDescription = note.description || "";

            note.description = oldDescription
                ? `${oldDescription}\n\n${additionalInformation}`
                : additionalInformation;

            if (newTitle) {
                note.title = newTitle;
            }

            await note.save();

            // Delete old vector
            try {
                await deleteVector(realNoteId, userId.toString());
            } catch (error) {
                console.error("Could not delete old vector:", error.message);
            }

            // Store updated vector
            const updatedText = `${note.title}\n${note.description}`;
            const newEmbedding = await generateEmbedding(updatedText);

            await storeVector(newEmbedding, {
                title: note.title,
                description: note.description,
                userId: userId.toString(),
                noteId: realNoteId
            });

            console.log("===== NOTE UPDATED =====");
            console.log({ oldTitle, title: note.title, noteId: realNoteId });

            return {
                success: true,
                message: "Note updated successfully.",
                noteId: realNoteId,
                title: note.title
            };
        }

        // =====================================================
        // DELETE NOTE
        // =====================================================

        case "deleteNote": {

            const query =
                typeof args.query === "string"
                    ? args.query.trim()
                    : "";

            if (!query) {
                return {
                    success: false,
                    message: "Please specify which note should be deleted."
                };
            }

            console.log("===== DELETE NOTE =====");
            console.log({ query, userId });

            // Step 1: Exact title
            let note = await Note.findOne({
                title: {
                    $regex: `^${escapeRegex(query)}$`,
                    $options: "i"
                },
                user: userId
            });

            // Step 2: Partial title
            if (!note) {
                note = await Note.findOne({
                    title: {
                        $regex: escapeRegex(query),
                        $options: "i"
                    },
                    user: userId
                });
            }

            // Step 3: Semantic search
            if (!note) {
                console.log("Title not found. Trying semantic search.");

                const embedding = await generateEmbedding(query);
                const results = await searchVector(embedding, userId);

                if (Array.isArray(results) && results.length > 0) {
                    let bestMatch = null;

                    for (const result of results) {
                        const score = Number(result.score || 0);
                        const candidateId = result.payload?.noteId;

                        if (!isValidObjectId(candidateId)) continue;
                        if (score < 0.50) continue;

                        if (!bestMatch || score > Number(bestMatch.score || 0)) {
                            bestMatch = result;
                        }
                    }

                    if (bestMatch) {
                        note = await Note.findOne({
                            _id: bestMatch.payload.noteId,
                            user: userId
                        });
                    }
                }
            }

            if (!note) {
                return {
                    success: false,
                    message: `I couldn't confidently identify the note "${query}".`
                };
            }

            const realNoteId = note._id.toString();
            const title = note.title;

            await note.deleteOne();

            try {
                await deleteVector(realNoteId, userId.toString());
            } catch (error) {
                console.error("Could not delete note vector:", error.message);
            }

            console.log("===== NOTE DELETED =====");
            console.log({ title, noteId: realNoteId });

            return {
                success: true,
                message: "Note deleted successfully.",
                noteId: realNoteId,
                title
            };
        }

        // =====================================================
        // UNKNOWN TOOL
        // =====================================================

        default:
            throw new Error(`Unknown tool: ${toolName}`);
    }
}

module.exports = executeTool;