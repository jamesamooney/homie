import { test, expect, type Page } from "@playwright/test";

import { signUp, uniqueUsername } from "./helpers";

async function addAndBookProperty(page: Page, title: string) {
  await page.getByTestId("add-property-trigger").click();
  await page.getByRole("button", { name: "Enter details manually instead" }).click();
  await page.getByTestId("manual-title-input").fill(title);
  await page.getByTestId("manual-address-input").fill("9 Decision Avenue, Bristol");
  await page.getByTestId("submit-manual-property").click();

  const card = page.getByTestId("property-card").filter({ hasText: title });
  await card.getByTestId("book-viewing").click();
  await page.getByTestId("viewing-slot").and(page.locator('[data-available="true"]')).first().click();
  return card;
}

test.describe("Post-viewing interest decision", () => {
  test("decision is disabled until the viewing has been attended", async ({ page }) => {
    await signUp(page, uniqueUsername("decisiongate"));
    const card = await addAndBookProperty(page, "Gated Decision House");

    await expect(card.getByTestId("decide-interest")).toBeDisabled();
    await card.getByTestId("mark-attended").click();
    await expect(card.getByTestId("decide-interest")).toBeEnabled();
  });

  test("marking Interested unlocks Make an Offer", async ({ page }) => {
    await signUp(page, uniqueUsername("interested"));
    const card = await addAndBookProperty(page, "Interested House");

    await card.getByTestId("mark-attended").click();
    await card.getByTestId("decide-interest").click();
    await page.getByTestId("mark-interested").click();

    await expect(card.getByTestId("status-badge")).toContainText("Interested");
    await expect(card.getByTestId("make-offer")).toBeEnabled();
  });

  test("Not Interested requires at least one reason, and Other requires free text, then archives", async ({
    page,
  }) => {
    await signUp(page, uniqueUsername("notinterested"));
    const card = await addAndBookProperty(page, "Rejected House");

    await card.getByTestId("mark-attended").click();
    await card.getByTestId("decide-interest").click();
    await page.getByTestId("mark-not-interested").click();

    await expect(page.getByTestId("confirm-not-interested")).toBeDisabled();

    await page.getByTestId("reason-other").click();
    await expect(page.getByTestId("confirm-not-interested")).toBeDisabled();

    await page.getByTestId("not-interested-other-detail").fill("Too far from the train station");
    await expect(page.getByTestId("confirm-not-interested")).toBeEnabled();
    await page.getByTestId("confirm-not-interested").click();

    await page.getByTestId("tab-active").click();
    await expect(page.getByText("Rejected House")).not.toBeVisible();

    await page.getByTestId("tab-archived").click();
    await expect(page.getByText("Rejected House")).toBeVisible();
    await expect(page.getByText("Too far from the train station")).toBeVisible();
  });

  test("multiple reasons can be selected and all are archived with the property", async ({
    page,
  }) => {
    await signUp(page, uniqueUsername("multireason"));
    const card = await addAndBookProperty(page, "Multi Reason House");

    await card.getByTestId("mark-attended").click();
    await card.getByTestId("decide-interest").click();
    await page.getByTestId("mark-not-interested").click();

    await page.getByTestId("reason-price").click();
    await page.getByTestId("reason-location").click();
    await expect(page.getByTestId("confirm-not-interested")).toBeEnabled();
    await page.getByTestId("confirm-not-interested").click();

    await page.getByTestId("tab-archived").click();
    const archivedCard = page.getByTestId("property-card").filter({ hasText: "Multi Reason House" });
    await expect(archivedCard.getByText("Reasons: Price · Location")).toBeVisible();
  });
});
