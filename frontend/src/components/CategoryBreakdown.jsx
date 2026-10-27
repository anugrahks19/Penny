import React from "react";
import { Leaf } from "lucide-react";
import { formatMoney } from "../spending.js";
import { categoryIcons } from "./categoryIcons.js";

export default function CategoryBreakdown({
  spendingSnapshot,
  fetchPending,
  connectionIssue,
}) {
  const {
    totals: categoryTotals,
    total: allTimeSpent,
    largest: leadingCategory,
  } = spendingSnapshot;
  return (
    <section className="panel breakdown">
      <div className="section-heading">
        <div>
          <h2>A closer look</h2>
          <p>Where your pennies are going.</p>
        </div>
        <span className="subtle-tag">All time</span>
      </div>
      <div className="category-bars">
        {categoryTotals.map(({ name: categoryName, amount: categorySpent }) => {
          const CategoryIcon = categoryIcons[categoryName];
          const spendingShare = allTimeSpent
            ? (categorySpent / allTimeSpent) * 100
            : 0;
          return (
            <div className="category-line" key={categoryName}>
              <span className={`category-icon ${categoryName.toLowerCase()}`}>
                <CategoryIcon size={16} />
              </span>
              <div className="category-detail">
                <div>
                  <span>{categoryName}</span>
                  <strong>
                    {fetchPending || connectionIssue
                      ? "—"
                      : formatMoney(categorySpent)}
                  </strong>
                </div>
                <div className="bar-track">
                  <span
                    className={categoryName.toLowerCase()}
                    style={{ width: `${spendingShare}%` }}
                  />
                </div>
              </div>
              <span className="percentage">{Math.round(spendingShare)}%</span>
            </div>
          );
        })}
      </div>
      <div className="insight">
        <Leaf size={17} />
        <p>
          {connectionIssue ? (
            "Your breakdown will appear once connected."
          ) : allTimeSpent ? (
            <>
              <strong>{leadingCategory.name}</strong> is your biggest spending
              category so far.
            </>
          ) : (
            "Your spending story starts with your first expense."
          )}
        </p>
      </div>
    </section>
  );
}
