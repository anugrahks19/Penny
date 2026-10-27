import React, { useState } from "react";
import { Plus, Check } from "lucide-react";
import { expenseGroups, localDate } from "../spending.js";
import {
  expenseLimits,
  isExpenseAmount,
} from "../../../shared/expenseRules.mjs";

export default function ExpenseForm({
  expenseToEdit,
  mutationPending,
  fetchPending,
  connectionIssue,
  savingEntry,
  onSave,
  onCancel,
}) {
  const [draftTitle, setDraftTitle] = useState(expenseToEdit?.title || "");
  const [draftAmount, setDraftAmount] = useState(
    expenseToEdit ? String(expenseToEdit.amount) : "",
  );
  const [draftCategory, setDraftCategory] = useState(
    expenseToEdit?.category || "Food",
  );
  const [draftDate, setDraftDate] = useState(
    expenseToEdit?.date || localDate(),
  );
  const [fieldIssues, setFieldIssues] = useState({});
  const isEditing = Boolean(expenseToEdit);

  async function submitExpense(event) {
    event.preventDefault();
    const draftIssues = {};
    const draftRupees = Number(draftAmount);
    if (!draftTitle.trim()) draftIssues.title = "Give this expense a title.";
    if (!isExpenseAmount(draftRupees)) {
      draftIssues.amount = "Enter a positive amount with up to two decimals.";
    }
    if (!draftDate) draftIssues.date = "Choose a date.";
    setFieldIssues(draftIssues);
    if (Object.keys(draftIssues).length) return;
    try {
      await onSave({
        title: draftTitle,
        amount: draftRupees,
        category: draftCategory,
        date: draftDate,
      });
    } catch (error) {
      setFieldIssues(error.fields || {});
    }
  }

  return (
    <section className="panel form-panel" id="expense-form">
      <div className="section-heading">
        <span className="section-icon">
          <Plus size={19} />
        </span>
        <div>
          <h2>{isEditing ? "Edit expense" : "Add an expense"}</h2>
          <p>
            {isEditing
              ? "A quick update to keep things accurate."
              : "The small things count. Log one here."}
          </p>
        </div>
      </div>
      <form onSubmit={submitExpense} noValidate>
        <fieldset
          disabled={mutationPending || fetchPending || Boolean(connectionIssue)}
        >
          <label htmlFor="title">Expense title</label>
          <input
            id="title"
            name="title"
            placeholder="e.g. Coffee with friends"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            maxLength={expenseLimits.titleLength}
            aria-invalid={Boolean(fieldIssues.title)}
            aria-describedby={fieldIssues.title ? "title-error" : undefined}
          />
          {fieldIssues.title && (
            <small className="field-error" id="title-error">
              {fieldIssues.title}
            </small>
          )}
          <div className="form-row">
            <div>
              <label htmlFor="amount">Amount</label>
              <div className="amount-input">
                <span>₹</span>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  inputMode="decimal"
                  min={expenseLimits.minimumAmount}
                  max={expenseLimits.maximumAmount}
                  step="0.01"
                  placeholder="0.00"
                  value={draftAmount}
                  onChange={(e) => setDraftAmount(e.target.value)}
                  aria-invalid={Boolean(fieldIssues.amount)}
                  aria-describedby={
                    fieldIssues.amount ? "amount-error" : undefined
                  }
                />
              </div>
            </div>
            <div>
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={draftCategory}
                onChange={(e) => setDraftCategory(e.target.value)}
              >
                {expenseGroups.map((groupName) => (
                  <option key={groupName}>{groupName}</option>
                ))}
              </select>
            </div>
          </div>
          {fieldIssues.amount && (
            <small className="field-error" id="amount-error">
              {fieldIssues.amount}
            </small>
          )}
          {fieldIssues.category && (
            <small className="field-error">{fieldIssues.category}</small>
          )}
          <label htmlFor="date">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            value={draftDate}
            onChange={(e) => setDraftDate(e.target.value)}
            aria-invalid={Boolean(fieldIssues.date)}
            aria-describedby={fieldIssues.date ? "date-error" : undefined}
          />
          {fieldIssues.date && (
            <small className="field-error" id="date-error">
              {fieldIssues.date}
            </small>
          )}
          <button className="primary form-submit" type="submit">
            {savingEntry ? (
              <span className="spinner" />
            ) : isEditing ? (
              <Check size={17} />
            ) : (
              <Plus size={17} />
            )}{" "}
            {savingEntry
              ? "Saving expense…"
              : isEditing
                ? "Save changes"
                : "Add expense"}
          </button>
          {isEditing && (
            <button
              className="text-button cancel-edit"
              type="button"
              onClick={onCancel}
            >
              Cancel editing
            </button>
          )}
        </fieldset>
      </form>
      <p className="form-footnote">
        <Check size={14} />A good habit starts with a single entry.
      </p>
    </section>
  );
}
