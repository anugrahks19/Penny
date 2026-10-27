import React from "react";
import {
  ChevronRight,
  LayoutDashboard,
  Leaf,
  CalendarDays,
  Plus,
  Check,
  CircleAlert,
  X,
} from "lucide-react";

export default function PennyFrame({
  children,
  mutationPending,
  toastMessage,
  onNewExpense,
  onDismiss,
}) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a href="#" className="brand" aria-label="Penny home">
          <span className="brand-mark">
            p<span>.</span>
          </span>
          Penny<span className="brand-period">.</span>
        </a>
        <p className="nav-label">YOUR WORKSPACE</p>
        <a className="nav-item active" href="#overview">
          <LayoutDashboard size={18} />
          Overview
          <ChevronRight size={16} />
        </a>
        <div className="sidebar-note">
          <span className="note-icon">
            <Leaf size={22} />
          </span>
          <h3>
            Small steps.
            <br />
            Better habits.
          </h3>
          <p>A little awareness today goes a long way tomorrow.</p>
          <span className="note-line" />
        </div>
        <div className="sidebar-bottom">
          <span className="avatar">Y</span>
          <div>
            <strong>Your personal space</strong>
            <small>Made for everyday life</small>
          </div>
        </div>
      </aside>
      <main id="overview">
        <header className="topbar">
          <div className="breadcrumb">
            Your workspace <ChevronRight size={13} />
            <span>Overview</span>
          </div>
          <span className="date-label">
            <CalendarDays size={15} />
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </header>
        <div className="page-content">
          <section className="page-heading">
            <div>
              <div className="eyebrow">A LITTLE CLARITY, EVERY DAY</div>
              <h1>
                Know where your money goes<span>.</span>
              </h1>
              <p>Your everyday spending, all in one calm place.</p>
            </div>
            <button
              className="primary heading-add"
              disabled={mutationPending}
              onClick={onNewExpense}
            >
              <Plus size={17} />
              Add expense
            </button>
          </section>
          {children}
          <footer className="page-footer">
            <span>
              Penny<span className="brand-period">.</span>{" "}
              <span>A little more mindful.</span>
            </span>
            <span>Made for your everyday.</span>
          </footer>
        </div>
      </main>{" "}
      {toastMessage && (
        <div
          className={`toast ${toastMessage.type}`}
          role={toastMessage.type === "error" ? "alert" : "status"}
        >
          {toastMessage.type === "success" ? (
            <Check size={19} />
          ) : (
            <CircleAlert size={19} />
          )}
          <span>{toastMessage.text}</span>
          <button aria-label="Dismiss notification" onClick={onDismiss}>
            <X size={17} />
          </button>
        </div>
      )}
    </div>
  );
}
