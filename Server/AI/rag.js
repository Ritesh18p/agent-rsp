const groq = require("./groq");

async function generateAnswer(question, searchResults) {

    const context = searchResults
        .map((note) => {
            return `
Title: ${note.payload.title}

Description:
${note.payload.description}
`;
        })
        .join("\n------------------------\n");

const prompt = `
You are an AI assistant for a Notebook application.

Use ONLY the notes below to answer.

If the answer exists in the notes, answer naturally.

If multiple notes are relevant, combine them.

If the answer does not exist, reply exactly:

"I couldn't find that information in your notes."

NOTES:

${context}

USER QUESTION:

${question}
`;

    const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
    });

    return response.choices[0].message.content;
}

module.exports = generateAnswer;