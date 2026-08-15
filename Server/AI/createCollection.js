const client = require("./qdrant");

async function createCollection() {
  try {
    await client.createCollection("notes", {
      vectors: {
        size: 384,
        distance: "Cosine",
      },
    });

    console.log("Notes collection created.");
  } catch (error) {
    console.error("Actual Error:");
    console.error(error);
  }
}

createCollection();