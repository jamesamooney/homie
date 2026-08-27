import { test, expect } from "@playwright/test";

import { signUp, uniqueUsername } from "./helpers";

async function addManualProperty(page: import("@playwright/test").Page, title: string) {
  await page.getByTestId("add-property-trigger").click();
  await page.getByRole("button", { name: "Enter details manually instead" }).click();
  await page.getByTestId("manual-title-input").fill(title);
  await page.getByTestId("manual-address-input").fill("1 Booking Test Street, Bristol");
  await page.getByTestId("submit-manual-property").click();
}

test.describe("Book a viewing", () => {
  test("booking a slot confirms instantly and updates the status badge", async ({ page }) => {
    await signUp(page, uniqueUsername("book"));
    await addManualProperty(page, "Bookable House");

    const card = page.getByTestId("property-card").filter({ hasText: "Bookable House" });
    await card.getByTestId("book-viewing").click();

    await page.getByTestId("viewing-slot").and(page.locator('[data-available="true"]')).first().click();

    await expect(card.getByTestId("status-badge")).toContainText("Viewing Scheduled");
  });

  test("a second viewing can be booked against the same property", async ({ page }) => {
    await signUp(page, uniqueUsername("book2"));
    await addManualProperty(page, "Double Booked House");

    const card = page.getByTestId("property-card").filter({ hasText: "Double Booked House" });

    for (let i = 0; i < 2; i++) {
      await card.getByTestId("book-viewing").click();
      await page.getByTestId("viewing-slot").and(page.locator('[data-available="true"]')).first().click();
    }

    await expect(card.getByTestId("status-badge")).toContainText("Viewing Scheduled");
  });
});
