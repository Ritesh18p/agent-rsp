require("dotenv").config();

const groq = require("./groq");

async function test() {

    const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
            {
                role: "user",
                content: "In Generative AI, explain Retrieval-Augmented Generation (RAG) in one sentence."
            }
        ]
    });

    console.log(response.choices[0].message.content);
}

test();