const hf = require("./Hugging");

async function testEmbedding() {
    const response = await hf.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: "This is my first AI powered notebook"
    });

    console.log(response);
}

testEmbedding();