import { expect, test } from "@playwright/test";

test("loads the operations dashboard", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "One Small AI Workforce" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Operations Dashboard" })).toBeVisible();
});
