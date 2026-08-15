const hf = require("./Hugging");

async function generateEmbedding(text) {
  try {
    const embedding = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: text,
    });

    return embedding;
  } catch (error) {
    console.error("Embedding Error:", error);
    throw error;
  }
}

module.exports = generateEmbedding;