import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

export function loadSettings() {
  dotenv.config({ path: fileURLToPath(new URL("./.env", import.meta.url)) });
  dotenv.config({
    path: fileURLToPath(new URL("./.env.local", import.meta.url)),
    override: true,
  });
  return {
    atlasUri: process.env.MONGODB_URI,
    apiPort: Number(process.env.PORT || 5000),
  };
}

export function hasDatabaseUri(atlasUri) {
  return Boolean(
    atlasUri &&
    !atlasUri.includes("YOUR_CLUSTER") &&
    !atlasUri.includes("EXAM_PASSWORD"),
  );
}
