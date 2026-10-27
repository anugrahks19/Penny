import { test } from "node:test";
import assert from "node:assert/strict";
import { getSpendingSnapshot, findExpenses } from "../src/spending.js";

const spendingFixtures = [
  { title: "Tea", amount: 0.1, category: "Food", date: "2026-10-01" },
  { title: "Lunch", amount: 0.2, category: "Food", date: "2026-10-02" },
  { title: "Bus pass", amount: 50, category: "Travel", date: "2026-09-30" },
];

test("spending totals keep cents accurate, separate months, and handle an empty ledger", () => {
  const spendingSnapshot = getSpendingSnapshot(spendingFixtures, "2026-10");
  assert.equal(spendingSnapshot.total, 50.3);
  assert.equal(spendingSnapshot.monthTotal, 0.3);
  assert.equal(spendingSnapshot.count, 3);
  assert.equal(
    spendingSnapshot.totals.find((group) => group.name === "Food").amount,
    0.3,
  );
  assert.equal(spendingSnapshot.largest.name, "Travel");
  assert.equal(getSpendingSnapshot([], "2026-10").total, 0);
  assert.equal(getSpendingSnapshot([], "2026-10").totals.length, 5);
});

test("title and category filters combine without changing the full spending total", () => {
  assert.deepEqual(findExpenses(spendingFixtures, "TEA", "Food"), [
    spendingFixtures[0],
  ]);
  assert.deepEqual(findExpenses(spendingFixtures, "TEA", "Travel"), []);
  assert.equal(findExpenses(spendingFixtures, "", "All categories").length, 3);
  assert.equal(getSpendingSnapshot(spendingFixtures, "2026-10").total, 50.3);
});
