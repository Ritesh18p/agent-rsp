const groq = require("../groq");
const tools = require("./tools");
const executeTool = require("./toolExecutor");

// =========================================================
// CONFIG
// =========================================================

const MODEL = "llama-3.3-70b-versatile";
const MAX_LOOPS = 8;

// =========================================================
// TOOL HELPERS
// =========================================================

function getToolName(tool) {
    return tool?.function?.name || "";
}

function findTool(name) {
    const wanted = String(name || "").trim();
    return tools.find((tool) => getToolName(tool) === wanted);
}

function getAllowedTools(intent) {
    const toolMap = {
        create: ["createNote"],
        update: ["updateNote"],
        delete: ["deleteNote"],
        search: ["searchNotes"]
    };

    const names = toolMap[intent] || toolMap.search;
    const result = [];

    for (const name of names) {
        const tool = findTool(name);

        if (tool) {
            result.push(tool);
        } else {
            console.error(`REQUIRED TOOL "${name}" NOT FOUND IN tools.js`);
        }
    }

    console.log("=================================");
    console.log("INTENT:", intent);
    console.log("TOOLS SENT TO GROQ:", result.map(getToolName));
    console.log("=================================");

    return result;
}

// =========================================================
// INTENT DETECTION
// =========================================================

function detectIntent(userMessage) {
    const message = String(userMessage || "").toLowerCase().trim();

    // DELETE
    if (/\b(delete|remove|erase|discard|destroy)\b/.test(message)) {
        return "delete";
    }

    // UPDATE
    if (
        /\b(update|modify|change|edit|append)\b/.test(message) ||
        message.includes("add this to") ||
        message.includes("add this into") ||
        message.includes("add the following to") ||
        message.includes("add information to") ||
        message.includes("add information into") ||
        message.includes("add to my note") ||
        message.includes("add this in my note") ||
        message.includes("add this into my note") ||
        message.includes("add a line") ||
        message.includes("add line")
    ) {
        return "update";
    }

    // CREATE
    if (
        message.includes("create a note") ||
        message.includes("create note") ||
        message.includes("make a note") ||
        message.includes("make note") ||
        message.includes("new note") ||
        message.includes("add a new note") ||
        message.includes("save this as a note") ||
        message.includes("save this note") ||
        message.includes("write a note")
    ) {
        return "create";
    }

    if (
        /\b(create|make|save|write)\b/.test(message) &&
        /\b(note|notes)\b/.test(message)
    ) {
        return "create";
    }

    // DEFAULT
    return "search";
}

// =========================================================
// SAFE STRING
// =========================================================

function safeString(value) {
    if (value === undefined || value === null) return "";
    return String(value).trim();
}

// =========================================================
// OBJECT ID VALIDATION
// =========================================================

function isValidObjectId(value) {
    return (
        typeof value === "string" &&
        /^[0-9a-fA-F]{24}$/.test(value)
    );
}

function getNoteId(note) {
    const possibleIds = [
        note?.noteId,
        note?._id,
        note?.id
    ];

    for (const id of possibleIds) {
        if (isValidObjectId(id)) return id;

        if (
            id &&
            typeof id === "object" &&
            typeof id.toString === "function"
        ) {
            const converted = id.toString();
            if (isValidObjectId(converted)) return converted;
        }
    }

    return null;
}

// =========================================================
// NORMALIZE SEARCH RESULTS
// =========================================================

function normalizeSearchResults(result) {
    if (Array.isArray(result)) return result;
    if (result?.notes && Array.isArray(result.notes)) return result.notes;
    if (result?.results && Array.isArray(result.results)) return result.results;
    if (result?.data && Array.isArray(result.data)) return result.data;
    return [];
}

// =========================================================
// NORMALIZE TITLE
// =========================================================

function normalizeTitle(value) {
    return safeString(value).toLowerCase().replace(/\s+/g, " ").trim();
}

// =========================================================
// SELECT NOTE SAFELY
// =========================================================

function selectRealNote(results, query) {
    const notes = normalizeSearchResults(results);

    if (!notes.length) {
        return { note: null, reason: "not_found" };
    }

    const validNotes = notes.filter((note) => Boolean(getNoteId(note)));

    if (!validNotes.length) {
        return { note: null, reason: "no_valid_id" };
    }

    const normalizedQuery = normalizeTitle(query);

    // Exact title match
    const exactMatches = validNotes.filter(
        (note) => normalizeTitle(note?.title) === normalizedQuery
    );

    if (exactMatches.length === 1) return { note: exactMatches[0], reason: "exact" };
    if (exactMatches.length > 1) return { note: null, reason: "ambiguous" };

    // Partial title match
    const partialMatches = validNotes.filter((note) => {
        const title = normalizeTitle(note?.title);
        if (!title || !normalizedQuery) return false;
        return title.includes(normalizedQuery) || normalizedQuery.includes(title);
    });

    if (partialMatches.length === 1) return { note: partialMatches[0], reason: "partial" };
    if (partialMatches.length > 1) return { note: null, reason: "ambiguous" };

    // Single result fallback
    if (validNotes.length === 1) return { note: validNotes[0], reason: "single" };

    return { note: null, reason: "ambiguous" };
}

// =========================================================
// PUSH TOOL RESULT
// =========================================================

function pushToolResult(messages, toolCall, result) {
    messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(
            result ?? {
                success: false,
                message: "No result returned by tool."
            }
        )
    });
}

// =========================================================
// CREATE NOTE HANDLER
// =========================================================

async function handleCreate(toolCall, args, userId, messages) {
    const title = safeString(args?.title);
    const content = safeString(args?.content);

    console.log("=================================");
    console.log("CREATE NOTE");
    console.log("TITLE:", title);
    console.log("CONTENT:", content);
    console.log("=================================");

    if (!title) {
        pushToolResult(messages, toolCall, {
            success: false,
            message: "A note title is required."
        });
        return;
    }

    if (!content) {
        pushToolResult(messages, toolCall, {
            success: false,
            message: "Note content is required."
        });
        return;
    }

    try {
        const result = await executeTool(
            "createNote",
            { title, content },
            userId
        );

        console.log("CREATE RESULT:", JSON.stringify(result, null, 2));
        pushToolResult(messages, toolCall, result);
    } catch (error) {
        console.error("CREATE NOTE ERROR:", error);
        pushToolResult(messages, toolCall, {
            success: false,
            message: error?.message || "Failed to create note."
        });
    }
}

// =========================================================
// UPDATE NOTE HANDLER
// =========================================================

async function handleUpdate(toolCall, args, userId, messages) {
    const query = safeString(
        args?.query || args?.noteTitle || args?.title
    );

    const additionalInformation = safeString(
        args?.additionalInformation || args?.content || args?.text
    );

    if (!query) {
        pushToolResult(messages, toolCall, {
            success: false,
            message: "Could not determine which note should be updated."
        });
        return;
    }

    if (!additionalInformation) {
        pushToolResult(messages, toolCall, {
            success: false,
            message: "Could not determine what information should be added."
        });
        return;
    }

    const updateArgs = {
        query,
        additionalInformation
    };

    const newTitle = safeString(args?.newTitle);
    if (newTitle) {
        updateArgs.newTitle = newTitle;
    }

    console.log("===== UPDATE ARGS =====");
    console.log(updateArgs);

    try {
        const result = await executeTool("updateNote", updateArgs, userId);

        console.log("UPDATE RESULT:", JSON.stringify(result, null, 2));
        pushToolResult(messages, toolCall, result);
    } catch (error) {
        console.error("UPDATE NOTE ERROR:", error);
        pushToolResult(messages, toolCall, {
            success: false,
            message: error?.message || "Failed to update note."
        });
    }
}

// =========================================================
// DELETE NOTE HANDLER
// =========================================================

async function handleDelete(toolCall, args, userId, messages) {
    const query = safeString(
        args?.query || args?.noteTitle || args?.title
    );

    if (!query) {
        pushToolResult(messages, toolCall, {
            success: false,
            message: "Could not determine which note should be deleted."
        });
        return;
    }

    try {
        const result = await executeTool(
            "deleteNote",
            { query },
            userId
        );

        console.log("DELETE RESULT:", JSON.stringify(result, null, 2));
        pushToolResult(messages, toolCall, result);
    } catch (error) {
        console.error("DELETE NOTE ERROR:", error);
        pushToolResult(messages, toolCall, {
            success: false,
            message: error?.message || "Failed to delete note."
        });
    }
}

// =========================================================
// NORMAL TOOL HANDLER
// =========================================================

async function handleNormalTool(toolCall, args, userId, messages) {
    const toolName = getToolName(toolCall);

    try {
        const result = await executeTool(toolName, args, userId);

        console.log("===== TOOL RESULT =====");
        console.log(JSON.stringify(result, null, 2));
        pushToolResult(messages, toolCall, result);
    } catch (error) {
        console.error(`TOOL ${toolName} ERROR:`, error);
        pushToolResult(messages, toolCall, {
            success: false,
            message: error?.message || `Tool ${toolName} failed.`
        });
    }
}

// =========================================================
// MAIN AGENT
// =========================================================

async function runAgent(userMessage, userId) {
    const message = safeString(userMessage);

    if (!message) {
        return "Please tell me what you want me to do.";
    }

    const intent = detectIntent(message);

    console.log("=================================");
    console.log("USER MESSAGE:", message);
    console.log("DETECTED INTENT:", intent);
    console.log("=================================");

    const allowedTools = getAllowedTools(intent);

    if (!allowedTools.length) {
        console.error("NO VALID TOOLS AVAILABLE.");
        return "The agent tools are not configured correctly. Please check tools.js.";
    }

    if (
        intent === "create" &&
        !allowedTools.some((tool) => getToolName(tool) === "createNote")
    ) {
        console.error("CRITICAL: createNote WAS NOT SENT TO GROQ.");
        return "createNote is missing from the agent tool configuration.";
    }

    const messages = [
        {
            role: "system",
            content: `
You are Agent RSP, an AI assistant inside a private personal Notebook application.

The user owns the notes.

CURRENT OPERATION: ${intent}

==================================================
CREATE
==================================================

The user wants to create a NEW note.

You MUST call createNote with:

{
  "title": "the title requested by the user",
  "content": "the information the user wants saved"
}

RULES:
- Never call searchNotes before createNote.
- Never call updateNote for creation.
- Never invent a MongoDB ID.
- Never provide _id or noteId.
- Use the requested title exactly.

==================================================
UPDATE
==================================================

The user wants to modify an EXISTING note.

You MUST call updateNote with:

{
  "query": "the note title the user mentioned",
  "additionalInformation": "the exact new content to add"
}

RULES:
- Never invent a MongoDB ID.
- Never create a new note for an update.
- Only add newTitle if the user explicitly asks to rename.
- The backend handles finding the note automatically.

==================================================
DELETE
==================================================

The user wants to delete an EXISTING note.

You MUST call deleteNote with:

{
  "query": "the note title the user mentioned"
}

RULES:
- Never invent a MongoDB ID.
- Never create a replacement note.
- The backend handles finding the note automatically.

==================================================
SEARCH
==================================================

The user wants information from their notes.

You MUST call searchNotes with:

{
  "query": "what the user is looking for"
}

==================================================
GENERAL RULES
==================================================

- Only use the tools provided in the current request.
- Never invent tool names or tool results.
- After a successful operation, briefly tell the user what was done.
- Be concise and clear.
`
        },
        {
            role: "user",
            content: message
        }
    ];

    // =========================================================
    // AGENT LOOP
    // =========================================================

    for (let loop = 0; loop < MAX_LOOPS; loop++) {
        console.log(`===== AGENT LOOP ${loop + 1} =====`);

        let response;

        try {
            response = await groq.chat.completions.create({
                model: MODEL,
                messages,
                tools: allowedTools,
                tool_choice: "auto",
                temperature: 0
            });
        } catch (error) {
            console.error("=================================");
            console.error("GROQ ERROR:", JSON.stringify(
                error?.response?.data || error?.message || error,
                null,
                2
            ));
            console.error("STATUS:", error?.status || error?.response?.status);
            console.error("TOOLS SENT:", allowedTools.map(getToolName));
            console.error("=================================");
            return "I couldn't process that request right now.";
        }

        const assistantMessage = response?.choices?.[0]?.message;

        if (!assistantMessage) {
            return "I couldn't generate a response.";
        }

        // No tool calls — final text response
        if (
            !Array.isArray(assistantMessage.tool_calls) ||
            assistantMessage.tool_calls.length === 0
        ) {
            return assistantMessage.content || "The operation was completed.";
        }

        messages.push(assistantMessage);

        // Process each tool call
        for (const toolCall of assistantMessage.tool_calls) {
            const toolName = getToolName(toolCall);

            console.log("=================================");
            console.log("MODEL REQUESTED TOOL:", toolName);
            console.log("=================================");

            // Verify tool is allowed
            const isAllowed = allowedTools.some(
                (tool) => getToolName(tool) === toolName
            );

            if (!isAllowed) {
                console.error("BLOCKED TOOL:", toolName);
                pushToolResult(messages, toolCall, {
                    success: false,
                    message: `Tool "${toolName}" is not available for this request.`
                });
                continue;
            }

            // Parse arguments
            let args = {};

            try {
                const rawArguments = toolCall?.function?.arguments;

                if (typeof rawArguments === "string") {
                    args = JSON.parse(rawArguments || "{}");
                } else if (rawArguments && typeof rawArguments === "object") {
                    args = rawArguments;
                }
            } catch (error) {
                console.error("INVALID TOOL ARGUMENTS:", toolCall?.function?.arguments);
                pushToolResult(messages, toolCall, {
                    success: false,
                    message: "The tool arguments were invalid JSON."
                });
                continue;
            }

            console.log("TOOL ARGUMENTS:", JSON.stringify(args, null, 2));

            // Dispatch
            if (toolName === "createNote") {
                await handleCreate(toolCall, args, userId, messages);
                continue;
            }

            if (toolName === "updateNote") {
                await handleUpdate(toolCall, args, userId, messages);
                continue;
            }

            if (toolName === "deleteNote") {
                await handleDelete(toolCall, args, userId, messages);
                continue;
            }

            await handleNormalTool(toolCall, args, userId, messages);
        }
    }

    console.error("MAX AGENT LOOPS REACHED.");
    return "I couldn't complete the request.";
}

module.exports = runAgent;