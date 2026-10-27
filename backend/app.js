import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import ExpenseRecord from "./models/Expense.js";
import { validateExpense } from "./validation.js";

export function createApp() {
  const pennyApi = express();
  pennyApi.use(
    cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }),
  );
  pennyApi.use(express.json({ limit: "20kb" }));
  pennyApi.get("/api/health", (incomingRequest, outgoingReply) =>
    outgoingReply.json({ status: "ok", app: "Penny" }),
  );

  const expenseRoutes = express.Router();
  expenseRoutes.param(
    "id",
    (incomingRequest, outgoingReply, continueRequest, expenseId) => {
      if (!mongoose.isObjectIdOrHexString(expenseId)) {
        return outgoingReply
          .status(400)
          .json({ message: "Invalid expense ID." });
      }
      continueRequest();
    },
  );

  expenseRoutes.get("/", async (incomingRequest, outgoingReply) => {
    const savedExpenses = await ExpenseRecord.find().sort({
      date: -1,
      createdAt: -1,
    });
    outgoingReply.json(savedExpenses);
  });

  function checkExpenseDetails(
    incomingRequest,
    outgoingReply,
    continueRequest,
  ) {
    const { fieldErrors, expenseDetails } = validateExpense(
      incomingRequest.body,
    );
    if (Object.keys(fieldErrors).length) {
      return outgoingReply.status(400).json({
        message: "Please check the expense details.",
        errors: fieldErrors,
      });
    }
    outgoingReply.locals.expenseDetails = expenseDetails;
    continueRequest();
  }

  expenseRoutes.post(
    "/",
    checkExpenseDetails,
    async (incomingRequest, outgoingReply) => {
      const savedExpense = await ExpenseRecord.create(
        outgoingReply.locals.expenseDetails,
      );
      outgoingReply.status(201).json(savedExpense);
    },
  );

  expenseRoutes.put(
    "/:id",
    checkExpenseDetails,
    async (incomingRequest, outgoingReply) => {
      const updatedExpense = await ExpenseRecord.findByIdAndUpdate(
        incomingRequest.params.id,
        outgoingReply.locals.expenseDetails,
        { new: true, runValidators: true },
      );
      if (!updatedExpense)
        return outgoingReply
          .status(404)
          .json({ message: "This expense no longer exists." });
      outgoingReply.json(updatedExpense);
    },
  );

  expenseRoutes.delete("/:id", async (incomingRequest, outgoingReply) => {
    const deletedExpense = await ExpenseRecord.findByIdAndDelete(
      incomingRequest.params.id,
    );
    if (!deletedExpense)
      return outgoingReply
        .status(404)
        .json({ message: "This expense no longer exists." });
    outgoingReply.json({
      message: "Expense deleted.",
      id: incomingRequest.params.id,
    });
  });

  pennyApi.use("/api/expenses", expenseRoutes);
  pennyApi.use((incomingRequest, outgoingReply) =>
    outgoingReply.status(404).json({ message: "Route not found." }),
  );
  pennyApi.use(
    (requestError, incomingRequest, outgoingReply, continueRequest) => {
      if (requestError.type === "entity.parse.failed")
        return outgoingReply
          .status(400)
          .json({ message: "Request must contain valid JSON." });
      if (requestError.type === "entity.too.large")
        return outgoingReply
          .status(413)
          .json({ message: "Request is too large." });
      console.error("Expense request failed:", requestError.name);
      outgoingReply.status(500).json({
        message: "Something went wrong on the server. Please try again.",
      });
    },
  );
  return pennyApi;
}
