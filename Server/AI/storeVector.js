const client = require("./qdrant");
const { v4: uuidv4 } = require("uuid");

async function storeVector(vector, payload) {
  await client.upsert("notes", {
    wait: true,
    points: [
      {
        id: uuidv4(),
        vector,
        payload,
      },
    ],
  });
}

module.exports = storeVector;