import mongoose from "mongoose";

import {
  expenseCategories,
  expenseLimits,
} from "../../shared/expenseRules.mjs";
export { expenseCategories };

const expenseRecordSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: expenseLimits.titleLength,
    },
    amount: {
      type: Number,
      required: true,
      min: expenseLimits.minimumAmount,
      max: expenseLimits.maximumAmount,
    },
    category: { type: String, required: true, enum: expenseCategories },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.model("Expense", expenseRecordSchema);
