export const expenseCategories = [
  "Food",
  "Travel",
  "Bills",
  "Shopping",
  "Other",
];

export const expenseLimits = {
  titleLength: 100,
  minimumAmount: 0.01,
  maximumAmount: 999999999.99,
};

export function isExpenseAmount(enteredAmount) {
  return (
    Number.isFinite(enteredAmount) &&
    enteredAmount >= expenseLimits.minimumAmount &&
    enteredAmount <= expenseLimits.maximumAmount &&
    /^\d+(\.\d{1,2})?$/.test(String(enteredAmount))
  );
}
