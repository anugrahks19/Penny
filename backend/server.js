import mongoose from "mongoose";
import { createApp } from "./app.js";
import { loadSettings, hasDatabaseUri } from "./settings.js";

async function startPenny() {
  const { atlasUri, apiPort } = loadSettings();
  if (!hasDatabaseUri(atlasUri))
    throw new Error(
      "Set MONGODB_URI in backend/.env to your exam-only MongoDB Atlas connection string. See README.md.",
    );
  await mongoose.connect(atlasUri, { serverSelectionTimeoutMS: 10000 });
  console.log("Penny connected to MongoDB.");
  const apiServer = createApp().listen(apiPort, () =>
    console.log(`Penny API listening on port ${apiPort}.`),
  );
  function closePenny() {
    apiServer.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  }
  process.on("SIGTERM", closePenny);
  process.on("SIGINT", closePenny);
}

startPenny().catch((startupError) => {
  console.error(
    startupError.message.startsWith("Set MONGODB_URI")
      ? startupError.message
      : "Could not connect to MongoDB. Check the URI, database user, network access, and internet connection.",
  );
  process.exit(1);
});
