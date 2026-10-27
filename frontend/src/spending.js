import { expenseCategories as expenseGroups } from "../../shared/expenseRules.mjs";
export { expenseGroups };

const rupeeDisplay = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export function formatMoney(rupees) {
  return rupeeDisplay.format(rupees);
}

export function localDate(clock = new Date()) {
  const year = clock.getFullYear();
  const month = String(clock.getMonth() + 1).padStart(2, "0");
  const day = String(clock.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function displayDate(day) {
  return new Date(`${day}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getSpendingSnapshot(ledgerEntries, currentMonth) {
  let totalSpentCents = 0;
  let monthSpentCents = 0;
  const centsByCategory = {};
  for (const group of expenseGroups) centsByCategory[group] = 0;

  for (const ledgerEntry of ledgerEntries) {
    const expenseCents = Math.round(ledgerEntry.amount * 100);
    totalSpentCents += expenseCents;
    if (ledgerEntry.date.startsWith(currentMonth))
      monthSpentCents += expenseCents;
    if (Object.hasOwn(centsByCategory, ledgerEntry.category))
      centsByCategory[ledgerEntry.category] += expenseCents;
  }

  const totals = [];
  let largest = { name: expenseGroups[0], amount: 0 };
  for (const group of expenseGroups) {
    const categoryTotal = { name: group, amount: centsByCategory[group] / 100 };
    totals.push(categoryTotal);
    if (categoryTotal.amount > largest.amount) largest = categoryTotal;
  }
  return {
    total: totalSpentCents / 100,
    monthTotal: monthSpentCents / 100,
    count: ledgerEntries.length,
    totals,
    largest,
  };
}

export function findExpenses(ledgerEntries, searchText, chosenCategory) {
  const searchableTitle = searchText.toLowerCase();
  return ledgerEntries.filter((ledgerEntry) => {
    const categoryMatches =
      chosenCategory === "All categories" ||
      ledgerEntry.category === chosenCategory;
    return (
      categoryMatches &&
      ledgerEntry.title.toLowerCase().includes(searchableTitle)
    );
  });
}

export function newestExpenseFirst(firstExpense, secondExpense) {
  return (
    secondExpense.date.localeCompare(firstExpense.date) ||
    secondExpense.createdAt.localeCompare(firstExpense.createdAt)
  );
}
