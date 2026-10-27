import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server-core";
import { createApp } from "../app.js";

const temporaryMongo = await MongoMemoryServer.create({
  binary: { version: "7.0.24" },
});
await mongoose.connect(temporaryMongo.getUri());
const testApiServer = createApp().listen(5051, "127.0.0.1", () =>
  console.log("Isolated Penny test API ready"),
);
async function closeTestApi() {
  testApiServer.close();
  await mongoose.disconnect();
  await temporaryMongo.stop();
  process.exit(0);
}
process.on("SIGTERM", closeTestApi);
process.on("SIGINT", closeTestApi);
