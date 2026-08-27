import { test, expect } from "@playwright/test";

import { signUp, uniqueUsername } from "./helpers";

test.describe("Notifications", () => {
  test("booking a viewing raises the unread count, and opening the panel clears it", async ({
    page,
  }) => {
    await signUp(page, uniqueUsername("notify"));
    await page.getByTestId("add-property-trigger").click();
    await page.getByRole("button", { name: "Enter details manually instead" }).click();
    await page.getByTestId("manual-title-input").fill("Notified House");
    await page.getByTestId("manual-address-input").fill("5 Bell Street, Bristol");
    await page.getByTestId("submit-manual-property").click();

    const card = page.getByTestId("property-card").filter({ hasText: "Notified House" });
    await card.getByTestId("book-viewing").click();
    await page.getByTestId("viewing-slot").and(page.locator('[data-available="true"]')).first().click();

    // Booking can raise both a "viewing confirmed" notification and, if the slot
    // falls within 48h, a reminder — assert at least one unread rather than an exact count.
    await expect(page.getByTestId("unread-badge")).toBeVisible();
    const unreadText = await page.getByTestId("unread-badge").textContent();
    expect(Number(unreadText)).toBeGreaterThanOrEqual(1);

    await page.getByRole("button", { name: "Notifications" }).click();
    await expect(
      page.getByTestId("notification-item").filter({ hasText: "Viewing confirmed" }),
    ).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("unread-badge")).not.toBeVisible();
  });
});
