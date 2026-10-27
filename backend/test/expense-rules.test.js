import { test } from "node:test";
import assert from "node:assert/strict";
import { validateExpense } from "../validation.js";
import { expenseCategories } from "../models/Expense.js";
import { expenseGroups } from "../../frontend/src/spending.js";

const expenseFixture = {
  title: "Lunch",
  amount: 150,
  category: "Food",
  date: "2026-10-27",
};

test("frontend and backend expose the same ordered exam categories", () => {
  assert.deepEqual(expenseCategories, [
    "Food",
    "Travel",
    "Bills",
    "Shopping",
    "Other",
  ]);
  assert.deepEqual(expenseGroups, expenseCategories);
});

test("amount validation keeps its existing boundaries and field error messages", () => {
  for (const acceptedAmount of [0.01, 1, 1.2, 100.01, 999999999.99, "25.50"]) {
    assert.equal(
      validateExpense({ ...expenseFixture, amount: acceptedAmount }).fieldErrors
        .amount,
      undefined,
    );
  }
  for (const rejectedAmount of [
    -1,
    0,
    0.001,
    1.234,
    1000000000,
    "",
    null,
    true,
    [],
    {},
    "abc",
  ]) {
    assert.equal(
      validateExpense({ ...expenseFixture, amount: rejectedAmount }).fieldErrors
        .amount,
      "Enter an amount from 0.01 to 999,999,999.99 with up to two decimals.",
    );
  }
});
