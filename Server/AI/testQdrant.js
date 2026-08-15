const client = require("./qdrant");

async function test() {
    try {
        const collections = await client.getCollections();
        console.log(collections);
    } catch (err) {
        console.error(err);
    }
}

test();