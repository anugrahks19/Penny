import mongoose from "mongoose";
import apiRequest from "supertest";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import { createApp } from "../app.js";
import ExpenseRecord from "../models/Expense.js";
import { loadSettings, hasDatabaseUri } from "../settings.js";

const { atlasUri } = loadSettings();
const probeTitle = "Penny connection check " + randomUUID();
const probeReport = {
  checkedAt: new Date().toISOString(),
  connected: false,
  created: false,
  persistedAfterReconnect: false,
  listed: false,
  updated: false,
  deleted: false,
  cleanedUp: false,
};
const pennyApi = createApp();
let probeId;
let probeStage = "configuration";
try {
  assert.ok(hasDatabaseUri(atlasUri), "placeholder");
  probeStage = "connection";
  await mongoose.connect(atlasUri, { serverSelectionTimeoutMS: 15000 });
  probeReport.connected = true;
  probeStage = "create";
  const createdReply = await apiRequest(pennyApi)
    .post("/api/expenses")
    .send({
      title: probeTitle,
      amount: 0.01,
      category: "Other",
      date: new Date().toISOString().slice(0, 10),
    })
    .expect(201);
  probeId = createdReply.body._id;
  probeReport.created = true;
  probeStage = "persistence";
  await mongoose.disconnect();
  await mongoose.connect(atlasUri, { serverSelectionTimeoutMS: 15000 });
  const persistedExpense = await ExpenseRecord.findById(probeId).lean();
  assert.equal(persistedExpense.title, probeTitle);
  assert.equal(persistedExpense.amount, 0.01);
  probeReport.persistedAfterReconnect = true;
  probeStage = "read";
  const ledgerReply = await apiRequest(pennyApi)
    .get("/api/expenses")
    .expect(200);
  assert.ok(
    ledgerReply.body.some((ledgerEntry) => ledgerEntry._id === probeId),
  );
  probeReport.listed = true;
  probeStage = "update";
  await apiRequest(pennyApi)
    .put("/api/expenses/" + probeId)
    .send({
      title: probeTitle,
      amount: 0.02,
      category: "Other",
      date: persistedExpense.date,
    })
    .expect(200);
  assert.equal((await ExpenseRecord.findById(probeId)).amount, 0.02);
  probeReport.updated = true;
  probeStage = "delete";
  await apiRequest(pennyApi)
    .delete("/api/expenses/" + probeId)
    .expect(200);
  assert.equal(await ExpenseRecord.findById(probeId), null);
  probeReport.deleted = true;
} catch {
  probeReport.failedStage = probeStage;
  probeReport.error =
    probeStage === "configuration"
      ? "The MongoDB URI is missing or still contains placeholders."
      : "Atlas verification failed. Check network access, the database user, and connection settings.";
  process.exitCode = 1;
} finally {
  if (probeReport.connected) {
    try {
      if (mongoose.connection.readyState !== 1)
        await mongoose.connect(atlasUri, { serverSelectionTimeoutMS: 15000 });
      const probeFilter = { title: probeTitle };
      if (probeId) probeFilter._id = probeId;
      await ExpenseRecord.deleteOne(probeFilter);
      probeReport.cleanedUp = !(await ExpenseRecord.exists({
        title: probeTitle,
      }));
    } catch {
      probeReport.cleanupError =
        "Could not confirm removal of the temporary connection-check record.";
      process.exitCode = 1;
    }
  }
  await mongoose.disconnect();
  const reportDirectory = new URL("../../artifacts/", import.meta.url);
  await mkdir(reportDirectory, { recursive: true });
  await writeFile(
    new URL("atlas-check.json", reportDirectory),
    JSON.stringify(probeReport, null, 2) + "\n",
  );
  console.log(JSON.stringify(probeReport, null, 2));
}
