import React, { useEffect, useMemo, useState } from "react";
import { request } from "./api.js";
import {
  findExpenses,
  formatMoney,
  getSpendingSnapshot,
  localDate,
  newestExpenseFirst,
} from "./spending.js";
import PennyFrame from "./components/PennyFrame.jsx";
import ExpenseForm from "./components/ExpenseForm.jsx";
import ExpenseHistory from "./components/ExpenseHistory.jsx";
import SpendingSummary from "./components/SpendingSummary.jsx";
import CategoryBreakdown from "./components/CategoryBreakdown.jsx";

export default function App() {
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [fetchPending, setFetchPending] = useState(true);
  const [connectionIssue, setConnectionIssue] = useState("");
  const [toastMessage, setToastMessage] = useState(null);
  const [activeExpense, setActiveExpense] = useState(null);
  const [formRevision, setFormRevision] = useState(0);
  const [savingEntry, setSavingEntry] = useState(false);
  const [removingEntry, setRemovingEntry] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [chosenCategory, setChosenCategory] = useState("All categories");
  const mutationPending = savingEntry || removingEntry;
  const currentMonth = localDate().slice(0, 7);
  const spendingSnapshot = useMemo(
    () => getSpendingSnapshot(ledgerEntries, currentMonth),
    [ledgerEntries, currentMonth],
  );
  const matchingEntries = useMemo(
    () => findExpenses(ledgerEntries, searchText, chosenCategory),
    [ledgerEntries, searchText, chosenCategory],
  );

  async function loadLedger() {
    setFetchPending(true);
    setConnectionIssue("");
    try {
      setLedgerEntries(await request("/expenses"));
    } catch (error) {
      setConnectionIssue(error.message);
    } finally {
      setFetchPending(false);
    }
  }

  useEffect(() => {
    loadLedger();
  }, []);
  useEffect(() => {
    if (!toastMessage) return;
    const dismissalTimer = setTimeout(() => setToastMessage(null), 6000);
    return () => clearTimeout(dismissalTimer);
  }, [toastMessage]);

  function resetDraft() {
    setActiveExpense(null);
    setFormRevision((previous) => previous + 1);
  }

  function openExpenseForm(expense = null) {
    setActiveExpense(expense);
    setFormRevision((previous) => previous + 1);
    requestAnimationFrame(() => {
      document
        .getElementById("expense-form")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      document.getElementById("title")?.focus({ preventScroll: true });
    });
  }

  async function saveExpense(expenseDetails) {
    setSavingEntry(true);
    const editingId = activeExpense?._id;
    try {
      const savedExpense = await request(
        "/expenses" + (editingId ? "/" + editingId : ""),
        {
          method: editingId ? "PUT" : "POST",
          body: JSON.stringify(expenseDetails),
        },
      );
      setLedgerEntries((previousEntries) => {
        const nextEntries = [...previousEntries];
        if (editingId) {
          const editedPosition = nextEntries.findIndex(
            (entry) => entry._id === editingId,
          );
          if (editedPosition !== -1) nextEntries[editedPosition] = savedExpense;
        } else {
          nextEntries.push(savedExpense);
        }
        nextEntries.sort(newestExpenseFirst);
        return nextEntries;
      });
      setToastMessage({
        type: "success",
        text: editingId
          ? "Changes saved. All up to date."
          : "Expense added. Every penny accounted for.",
      });
      resetDraft();
    } catch (error) {
      setToastMessage({ type: "error", text: error.message });
      throw error;
    } finally {
      setSavingEntry(false);
    }
  }

  async function deleteExpense(expense) {
    if (
      !window.confirm(
        `Delete "${expense.title}" (${formatMoney(expense.amount)})?`,
      )
    )
      return;
    setRemovingEntry(true);
    try {
      await request("/expenses/" + expense._id, { method: "DELETE" });
      setLedgerEntries((previousEntries) =>
        previousEntries.filter((entry) => entry._id !== expense._id),
      );
      if (activeExpense?._id === expense._id) resetDraft();
      setToastMessage({ type: "success", text: "Expense deleted." });
    } catch (error) {
      setToastMessage({ type: "error", text: error.message });
    } finally {
      setRemovingEntry(false);
    }
  }

  return (
    <PennyFrame
      mutationPending={mutationPending}
      toastMessage={toastMessage}
      onNewExpense={() => openExpenseForm()}
      onDismiss={() => setToastMessage(null)}
    >
      <SpendingSummary
        spendingSnapshot={spendingSnapshot}
        summaryUnavailable={fetchPending || Boolean(connectionIssue)}
      />
      <div className="workspace-grid">
        <ExpenseForm
          key={formRevision}
          expenseToEdit={activeExpense}
          mutationPending={mutationPending}
          fetchPending={fetchPending}
          connectionIssue={connectionIssue}
          savingEntry={savingEntry}
          onSave={saveExpense}
          onCancel={resetDraft}
        />
        <CategoryBreakdown
          spendingSnapshot={spendingSnapshot}
          fetchPending={fetchPending}
          connectionIssue={connectionIssue}
        />
      </div>
      <ExpenseHistory
        ledgerEntries={ledgerEntries}
        matchingEntries={matchingEntries}
        fetchPending={fetchPending}
        connectionIssue={connectionIssue}
        searchText={searchText}
        selectedCategory={chosenCategory}
        mutationPending={mutationPending}
        onSearchChange={setSearchText}
        onCategoryChange={setChosenCategory}
        onEdit={openExpenseForm}
        onDelete={deleteExpense}
        onRetry={loadLedger}
      />
    </PennyFrame>
  );
}
