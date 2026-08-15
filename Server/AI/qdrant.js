const { QdrantClient } = require("@qdrant/js-client-rest");

const client = new QdrantClient({
    url: "http://localhost:6333",
});

module.exports = client;