import { test, expect } from "@playwright/test";

import { signUp, uniqueUsername } from "./helpers";

test.describe("Dashboard", () => {
  test("dashboard tiles link through to their full pages", async ({ page }) => {
    await signUp(page, uniqueUsername("dashboard"));

    // signUp() leaves us on /properties; book a viewing so the schedule/notifications
    // tiles have something to show.
    await page.getByTestId("add-property-trigger").click();
    await page.getByRole("button", { name: "Enter details manually instead" }).click();
    await page.getByTestId("manual-title-input").fill("Dashboard House");
    await page.getByTestId("manual-address-input").fill("1 Dashboard Way, Bristol");
    await page.getByTestId("submit-manual-property").click();

    const card = page.getByTestId("property-card").filter({ hasText: "Dashboard House" });
    await card.getByTestId("book-viewing").click();
    await page.getByTestId("viewing-slot").and(page.locator('[data-available="true"]')).first().click();

    await page.goto("/dashboard");
    await expect(page.getByTestId("tile-properties")).toContainText("1 active");
    await expect(page.getByTestId("tile-schedule")).toContainText("1 Dashboard Way, Bristol");

    await page.getByTestId("tile-schedule").click();
    await page.waitForURL("/schedule");
    await expect(page.getByTestId("schedule-row").filter({ hasText: "Dashboard House" })).toBeVisible();

    await page.goto("/dashboard");
    await page.getByTestId("tile-notifications").click();
    await page.waitForURL("/notifications");
    await expect(
      page.getByTestId("notification-item").filter({ hasText: "Viewing confirmed" }),
    ).toBeVisible();
  });
});
