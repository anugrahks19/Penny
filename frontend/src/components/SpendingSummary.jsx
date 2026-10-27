import React from "react";
import {
  Wallet,
  ArrowUpRight,
  CalendarDays,
  Receipt,
  Leaf,
} from "lucide-react";
import { formatMoney } from "../spending.js";

export default function SpendingSummary({
  spendingSnapshot,
  summaryUnavailable,
}) {
  return (
    <section className="summary-grid" aria-label="Spending summary">
      <article className="summary-card total-card">
        <div className="card-label">
          Total amount spent
          <span className="stat-icon">
            <Wallet size={19} />
          </span>
        </div>
        <strong>
          {summaryUnavailable ? "—" : formatMoney(spendingSnapshot.total)}
        </strong>
        <div className="stat-footer">
          <span className="light-dot" />
          All your recorded expenses
          <ArrowUpRight size={17} />
        </div>
      </article>
      <article className="summary-card">
        <div className="card-label">
          This month
          <span className="stat-icon">
            <CalendarDays size={19} />
          </span>
        </div>
        <strong>
          {summaryUnavailable ? "—" : formatMoney(spendingSnapshot.monthTotal)}
        </strong>
        <div className="stat-footer">
          {new Date().toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
          })}
          <span className="stat-tag">Month to date</span>
        </div>
      </article>
      <article className="summary-card">
        <div className="card-label">
          Expenses recorded
          <span className="stat-icon">
            <Receipt size={19} />
          </span>
        </div>
        <strong>
          {summaryUnavailable
            ? "—"
            : String(spendingSnapshot.count).padStart(2, "0")}
        </strong>
        <div className="stat-footer">
          Every little thing adds up
          <span className="small-leaf">
            <Leaf size={17} />
          </span>
        </div>
      </article>
    </section>
  );
}
