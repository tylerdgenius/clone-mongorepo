const { MongoClient } = require("mongodb");

const sourceUri =
  "mongodb+srv://{username}:{password}@cluster0.eskuzvy.mongodb.net/{loudinsight-prod}?retryWrites=true&w=majority";

const targetUri =
  "mongodb+srv://{username}:{password}@cluster0.eskuzvy.mongodb.net/{collection-name}?retryWrites=true&w=majority";

async function cloneDatabase() {
  const sourceClient = new MongoClient(sourceUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const targetClient = new MongoClient(targetUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await sourceClient.connect();
    await targetClient.connect();

    const sourceDb = sourceClient.db("{{source_collection}}");
    const targetDb = targetClient.db("{{target_collection}}");

    const collections = await sourceDb.listCollections().toArray();

    console.log("Starting cloning process...");

    for (let collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`Cloning collection - ${collectionName}`);
      const sourceCollection = sourceDb.collection(collectionName);
      const targetCollection = targetDb.collection(collectionName);

      const documents = await sourceCollection.find().toArray();
      if (documents.length > 0) {
        await targetCollection.insertMany(documents);
      }
    }

    console.log("Database cloned successfully!");
  } catch (err) {
    console.error("An error occurred while cloning the database:", err);
  } finally {
    await sourceClient.close();
    await targetClient.close();
  }
}

cloneDatabase();
