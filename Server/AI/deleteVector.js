const client = require("./qdrant");

async function deleteVector(noteId, userId) {
    await client.delete("notes", {
        filter: {
            must: [
                {
                    key: "noteId",
                    match: {
                        value: noteId
                    }
                },
                {
                    key: "userId",
                    match: {
                        value: userId
                    }
                }
            ]
        }
    });
}

module.exports = deleteVector;