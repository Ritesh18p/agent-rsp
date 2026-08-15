const tools = [

    // =====================================================
    // SEARCH NOTES
    // =====================================================

    {
        type: "function",

        function: {
            name: "searchNotes",

            description:
                "Search the user's personal notes using semantic search. Use this when the user asks what information is saved in their notes.",

            parameters: {
                type: "object",

                properties: {
                    query: {
                        type: "string",
                        description:
                            "The topic, title, keyword, or question to search for in the user's notes."
                    }
                },

                required: ["query"]
            }
        }
    },

    // =====================================================
    // CREATE NOTE
    // =====================================================

    {
        type: "function",

        function: {
            name: "createNote",

            description:
                "Create a completely new note in the user's personal notebook. Use this only when the user asks to create, save, write, or add a new note.",

            parameters: {
                type: "object",

                properties: {
                    title: {
                        type: "string",
                        description: "The title of the new note."
                    },

                    content: {
                        type: "string",
                        description:
                            "The exact information that should be saved inside the new note. Never use placeholder text."
                    }
                },

                required: ["title", "content"]
            }
        }
    },

    // =====================================================
    // UPDATE NOTE
    // =====================================================

    {
        type: "function",

        function: {
            name: "updateNote",

            description:
                "Update an existing note by adding new information to it. The backend will automatically find the note by title. Never invent a noteId. Only use newTitle when the user explicitly asks to rename the note.",

            parameters: {
                type: "object",

                properties: {
                    query: {
                        type: "string",
                        description:
                            "The title or topic of the existing note that should be updated."
                    },

                    additionalInformation: {
                        type: "string",
                        description:
                            "The new information that should be added to the existing note."
                    },

                    newTitle: {
                        type: "string",
                        description:
                            "Optional new title. Use only when the user explicitly asks to rename the note."
                    }
                },

                required: ["query", "additionalInformation"]
            }
        }
    },

    // =====================================================
    // DELETE NOTE
    // =====================================================

    {
        type: "function",

        function: {
            name: "deleteNote",

            description:
                "Delete an existing note. The backend will automatically find and delete the note by title. Never invent a noteId.",

            parameters: {
                type: "object",

                properties: {
                    query: {
                        type: "string",
                        description:
                            "The title or topic of the note the user wants to delete."
                    }
                },

                required: ["query"]
            }
        }
    }

];

module.exports = tools;