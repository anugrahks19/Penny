import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import apiRequest from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server-core";
import { createApp } from "../app.js";
import Expense from "../models/Expense.js";

let isolatedDatabase;
const testApi = createApp();
const lunchFixture = {
  title: "Lunch",
  amount: 180.5,
  category: "Food",
  date: "2026-10-27",
};

before(async () => {
  isolatedDatabase = await MongoMemoryServer.create({
    binary: { version: "7.0.24" },
  });
  await mongoose.connect(isolatedDatabase.getUri());
});
after(async () => {
  await mongoose.disconnect();
  await isolatedDatabase?.stop();
});

test("expenses persist through the full create, read, update and delete flow", async () => {
  const created = await apiRequest(testApi)
    .post("/api/expenses")
    .send(lunchFixture)
    .expect(201);
  const id = created.body._id;
  assert.ok(await Expense.findById(id));
  assert.equal(created.body.amount, 180.5);
  const list = await apiRequest(testApi).get("/api/expenses").expect(200);
  assert.ok(list.body.some((expense) => expense._id === id));
  const updated = await apiRequest(testApi)
    .put(`/api/expenses/${id}`)
    .send({ ...lunchFixture, title: "Lunch and tea", amount: 205 })
    .expect(200);
  assert.equal(updated.body.amount, 205);
  assert.equal((await Expense.findById(id)).title, "Lunch and tea");
  await apiRequest(testApi).delete(`/api/expenses/${id}`).expect(200);
  assert.equal(await Expense.findById(id), null);
  await apiRequest(testApi).get("/api/expenses").expect(200).expect([]);
});

test("invalid fields cannot be saved or used to overwrite an existing expense", async () => {
  for (const bad of [
    { title: "  " },
    { title: "x".repeat(101) },
    { amount: -1 },
    { amount: 0 },
    { amount: "" },
    { amount: null },
    { amount: 1.234 },
    { amount: "not money" },
    { category: "Unknown" },
    { date: "2026-02-30" },
    { date: "" },
  ]) {
    await apiRequest(testApi)
      .post("/api/expenses")
      .send({ ...lunchFixture, ...bad })
      .expect(400);
  }
  const created = await apiRequest(testApi)
    .post("/api/expenses")
    .send(lunchFixture)
    .expect(201);
  await apiRequest(testApi)
    .put(`/api/expenses/${created.body._id}`)
    .send({ ...lunchFixture, amount: -5 })
    .expect(400);
  assert.equal(
    (await Expense.findById(created.body._id)).amount,
    lunchFixture.amount,
  );
  await Expense.deleteMany({});
});

test("records are returned by expense date, newest first", async () => {
  await apiRequest(testApi)
    .post("/api/expenses")
    .send({ ...lunchFixture, date: "2026-01-01" })
    .expect(201);
  await apiRequest(testApi)
    .post("/api/expenses")
    .send(lunchFixture)
    .expect(201);
  const { body } = await apiRequest(testApi).get("/api/expenses").expect(200);
  assert.deepEqual(
    body.map((expense) => expense.date),
    ["2026-10-27", "2026-01-01"],
  );
  await Expense.deleteMany({});
});

test("malformed IDs, missing records and broken JSON return clear errors", async () => {
  await apiRequest(testApi).delete("/api/expenses/wrong").expect(400);
  const missing = new mongoose.Types.ObjectId().toString();
  await apiRequest(testApi).delete(`/api/expenses/${missing}`).expect(404);
  await apiRequest(testApi)
    .put(`/api/expenses/${missing}`)
    .send(lunchFixture)
    .expect(404);
  await apiRequest(testApi)
    .post("/api/expenses")
    .set("Content-Type", "application/json")
    .send("{bad")
    .expect(400);
  await apiRequest(testApi).get("/api/missing").expect(404);
});
