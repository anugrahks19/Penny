import {
  expenseCategories,
  expenseLimits,
  isExpenseAmount,
} from "../shared/expenseRules.mjs";

export function validateExpense(submittedExpense = {}) {
  if (
    !submittedExpense ||
    typeof submittedExpense !== "object" ||
    Array.isArray(submittedExpense)
  )
    submittedExpense = {};
  const fieldErrors = {};
  const trimmedTitle =
    typeof submittedExpense.title === "string"
      ? submittedExpense.title.trim()
      : "";
  const amountType = typeof submittedExpense.amount;
  const enteredAmount =
    amountType === "number" || amountType === "string"
      ? Number(submittedExpense.amount)
      : NaN;
  const chosenCategory = submittedExpense.category;
  const expenseDay =
    typeof submittedExpense.date === "string" ? submittedExpense.date : "";

  if (!trimmedTitle || trimmedTitle.length > expenseLimits.titleLength)
    fieldErrors.title = "Enter a title between 1 and 100 characters.";
  if (!isExpenseAmount(enteredAmount)) {
    fieldErrors.amount =
      "Enter an amount from 0.01 to 999,999,999.99 with up to two decimals.";
  }
  if (!expenseCategories.includes(chosenCategory))
    fieldErrors.category = "Choose a valid category.";
  const calendarDate = new Date(`${expenseDay}T00:00:00.000Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(expenseDay) ||
    !Number.isFinite(calendarDate.getTime()) ||
    calendarDate.toISOString().slice(0, 10) !== expenseDay
  ) {
    fieldErrors.date = "Choose a valid date.";
  }
  return {
    fieldErrors,
    expenseDetails: {
      title: trimmedTitle,
      amount: enteredAmount,
      category: chosenCategory,
      date: expenseDay,
    },
  };
}
