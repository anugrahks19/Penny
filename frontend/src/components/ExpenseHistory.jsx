import React from "react";
import {
  Search,
  CircleAlert,
  ArrowDownLeft,
  Pencil,
  Trash2,
  Shapes,
} from "lucide-react";
import { expenseGroups, formatMoney, displayDate } from "../spending.js";
import { categoryIcons } from "./categoryIcons.js";

export default function ExpenseHistory({
  ledgerEntries,
  matchingEntries,
  fetchPending,
  connectionIssue,
  searchText,
  selectedCategory,
  mutationPending,
  onSearchChange,
  onCategoryChange,
  onEdit,
  onDelete,
  onRetry,
}) {
  function renderExpenseRows() {
    if (fetchPending)
      return (
        <div className="empty-state" role="status">
          <span className="spinner green" />
          <h3>Gathering your expenses…</h3>
        </div>
      );
    if (connectionIssue)
      return (
        <div className="empty-state">
          <CircleAlert size={28} />
          <h3>Let’s get you connected</h3>
          <p>{connectionIssue}</p>
          <button className="secondary" onClick={onRetry}>
            Try again
          </button>
        </div>
      );
    if (!matchingEntries.length)
      return (
        <div className="empty-state">
          <span className="empty-icon">
            <ArrowDownLeft size={27} />
          </span>
          <h3>
            {ledgerEntries.length
              ? "No matching expenses"
              : "A fresh start for your spending"}
          </h3>
          <p>
            {ledgerEntries.length
              ? "Try another title or category."
              : "Add your first expense above. We’ll take care of the totals."}
          </p>
          {ledgerEntries.length > 0 && (
            <button
              className="text-button"
              onClick={() => {
                onSearchChange("");
                onCategoryChange("All categories");
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      );
    return (
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>EXPENSE</th>
              <th>CATEGORY</th>
              <th>DATE</th>
              <th className="amount-cell">AMOUNT</th>
              <th className="actions-cell">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {matchingEntries.map((ledgerEntry) => {
              const CategoryIcon =
                categoryIcons[ledgerEntry.category] || Shapes;
              return (
                <tr key={ledgerEntry._id}>
                  <td>
                    <div className="expense-title">
                      <span
                        className={`category-icon ${ledgerEntry.category.toLowerCase()}`}
                      >
                        <CategoryIcon size={17} />
                      </span>
                      <strong>{ledgerEntry.title}</strong>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`category-pill ${ledgerEntry.category.toLowerCase()}`}
                    >
                      {ledgerEntry.category}
                    </span>
                  </td>
                  <td className="expense-date">
                    {displayDate(ledgerEntry.date)}
                  </td>
                  <td className="amount-cell expense-amount">
                    {formatMoney(ledgerEntry.amount)}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        disabled={mutationPending}
                        aria-label={`Edit ${ledgerEntry.title}`}
                        title="Edit expense"
                        onClick={() => onEdit(ledgerEntry)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        disabled={mutationPending}
                        className="delete-button"
                        aria-label={`Delete ${ledgerEntry.title}`}
                        title="Delete expense"
                        onClick={() => onDelete(ledgerEntry)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <section className="panel history">
      <div className="history-heading">
        <div>
          <h2>
            Expense history{" "}
            <span className="count">{ledgerEntries.length}</span>
          </h2>
          <p>A little record of your everyday.</p>
        </div>
        <div className="filters">
          <div className="search-box">
            <Search size={16} />
            <input
              aria-label="Search expenses by title"
              placeholder="Search expenses…"
              value={searchText}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
          <select
            aria-label="Filter by category"
            value={selectedCategory}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option>All categories</option>
            {expenseGroups.map((groupName) => (
              <option key={groupName}>{groupName}</option>
            ))}
          </select>
        </div>
      </div>
      {renderExpenseRows()}
      <div className="history-footer">
        <span>
          {fetchPending || connectionIssue
            ? "Your expenses will appear here"
            : `Showing ${matchingEntries.length} of ${ledgerEntries.length} expenses`}
        </span>
        <span>Little by little, it adds up.</span>
      </div>
    </section>
  );
}
