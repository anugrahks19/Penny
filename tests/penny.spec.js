import { test, expect } from "@playwright/test";

const total = (page) => page.locator(".total-card > strong");

async function captureDashboard(page, screenshotPath) {
  const dismissNotice = page.getByRole('button', { name: 'Dismiss notification' });
  if (await dismissNotice.isVisible()) await dismissNotice.click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: screenshotPath, fullPage: true });
}

test("desktop CRUD persists across reloads, filters correctly and updates totals", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByText("A fresh start for your spending")).toBeVisible();
  await page.getByLabel("Expense title").fill("  ");
  await page.getByLabel("Amount", { exact: true }).fill("-10");
  await page
    .getByRole("button", { name: "Add expense", exact: true })
    .last()
    .click();
  await expect(page.getByText("Give this expense a title.")).toBeVisible();
  await expect(
    page.getByText("Enter a positive amount with up to two decimals."),
  ).toBeVisible();
  for (const [title, amount, category] of [
    ["Lunch with friends", "180.50", "Food"],
    ["Metro pass", "450", "Travel"],
    ["Electricity bill", "1250", "Bills"],
    ["Weekend groceries", "840", "Shopping"],
  ]) {
    await page.getByLabel("Expense title").fill(title);
    await page.getByLabel("Amount", { exact: true }).fill(amount);
    await page.getByLabel("Category", { exact: true }).selectOption(category);
    await page
      .getByRole("button", { name: "Add expense", exact: true })
      .last()
      .click();
    await expect(
      page.getByRole("cell", { name: title, exact: true }),
    ).toBeVisible();
  }
  await expect(total(page)).toHaveText("₹2,720.50");
  await page.reload();
  await expect(total(page)).toHaveText("₹2,720.50");
  await page.getByRole("button", { name: "Edit Lunch with friends" }).click();
  await expect(page.getByLabel("Expense title")).toHaveValue(
    "Lunch with friends",
  );
  await expect(page.getByLabel("Amount", { exact: true })).toHaveValue("180.5");
  await page.getByLabel("Amount", { exact: true }).fill("205");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(total(page)).toHaveText("₹2,745.00");
  await page.getByRole("button", { name: "Edit Metro pass" }).click();
  await page.getByRole("button", { name: "Cancel editing" }).click();
  await expect(page.getByLabel("Expense title")).toHaveValue("");
  await page.getByLabel("Search expenses by title").fill("metro");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByLabel("Search expenses by title").fill("");
  await page.getByLabel("Filter by category").selectOption("Food");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(total(page)).toHaveText("₹2,745.00");
  await page.getByLabel("Filter by category").selectOption("All categories");
  page.once("dialog", async (dialog) => {
    expect(dialog.type()).toBe("confirm");
    expect(dialog.message()).toContain("Metro pass");
    await dialog.dismiss();
  });
  await page.getByRole("button", { name: "Delete Metro pass" }).click();
  await expect(
    page.getByRole("cell", { name: "Metro pass", exact: true }),
  ).toBeVisible();
  await captureDashboard(page, "artifacts/penny-desktop.png");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete Metro pass" }).click();
  await expect(total(page)).toHaveText("₹2,295.00");
  await page.reload();
  await expect(
    page.getByRole("cell", { name: "Metro pass", exact: true }),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("mobile layout stays within viewport and supports adding an expense", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("tbody tr")).toHaveCount(3);
  await page.getByLabel("Expense title").fill("Tea break");
  await page.getByLabel("Amount", { exact: true }).fill("25");
  await page.getByRole("button", { name: "Add expense", exact: true }).click();
  await expect(total(page)).toHaveText("₹2,320.00");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await captureDashboard(page, "artifacts/penny-mobile.png");
});

test("failed save keeps entered details and failed loading offers retry", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("tbody tr")).toHaveCount(4);
  await page.route("**/api/expenses", (route) =>
    route.request().method() === "POST"
      ? route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: "Could not save expense." }),
        })
      : route.continue(),
  );
  await page.getByLabel("Expense title").fill("Keep my details");
  await page.getByLabel("Amount", { exact: true }).fill("100");
  await page
    .getByRole("button", { name: "Add expense", exact: true })
    .last()
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Could not save expense.",
  );
  await expect(page.getByLabel("Expense title")).toHaveValue("Keep my details");
  await page.unroute("**/api/expenses");
  await page.route("**/api/expenses", (route) => route.abort());
  await page.reload();
  await expect(page.getByText("Let’s get you connected")).toBeVisible();
  await page.unroute("**/api/expenses");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(4);
});

test("server validation errors appear beside the form without discarding input", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Add expense", exact: true }).last(),
  ).toBeEnabled();
  await page.route("**/api/expenses", (route) =>
    route.request().method() === "POST"
      ? route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Please check the expense details.",
            errors: { title: "Choose a different expense title." },
          }),
        })
      : route.continue(),
  );
  await page.getByLabel("Expense title").fill("Keep this draft");
  await page.getByLabel("Amount", { exact: true }).fill("75");
  await page
    .getByRole("button", { name: "Add expense", exact: true })
    .last()
    .click();
  await expect(page.locator("#title-error")).toHaveText(
    "Choose a different expense title.",
  );
  await expect(page.getByLabel("Expense title")).toHaveValue("Keep this draft");
  await expect(page.getByLabel("Amount", { exact: true })).toHaveValue("75");
});
