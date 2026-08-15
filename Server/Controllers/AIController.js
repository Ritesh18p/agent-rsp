const generateEmbedding = require("../AI/embedding");
const searchVector = require("../AI/searchVector");
const generateAnswer = require("../AI/rag");

const searchNotes = async (req, res) => {
  try {
    const { query } = req.body;

    // Generate embedding
    const embedding = await generateEmbedding(query);

    // Search similar notes
    const results = await searchVector(
      embedding,
      req.user._id.toString()
    );

    // Generate AI answer
    const answer = await generateAnswer(query, results);

    res.status(200).json({
      answer,
      sources: results.map((r) => ({
        title: r.payload.title,
        description: r.payload.description,
        score: Number(r.score.toFixed(3)),
      })),
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  searchNotes,
};