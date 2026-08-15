const client = require("./qdrant");

async function searchVector(vector, userId) {
  const result = await client.search("notes", {
    vector,
    limit: 5,
    with_payload: true,
    filter: {
      must: [
        {
          key: "userId",
          match: {
            value: userId,
          },
        },
      ],
    },
  });

  return result;
}

module.exports = searchVector;