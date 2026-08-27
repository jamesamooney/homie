import { test, expect, type Page } from "@playwright/test";

import { signUp, uniqueUsername } from "./helpers";

async function getToInterested(page: Page, title: string) {
  await page.getByTestId("add-property-trigger").click();
  await page.getByRole("button", { name: "Enter details manually instead" }).click();
  await page.getByTestId("manual-title-input").fill(title);
  await page.getByTestId("manual-address-input").fill("22 Offer Close, Bristol");
  await page.getByTestId("submit-manual-property").click();

  const card = page.getByTestId("property-card").filter({ hasText: title });
  await card.getByTestId("book-viewing").click();
  await page.getByTestId("viewing-slot").and(page.locator('[data-available="true"]')).first().click();
  await card.getByTestId("mark-attended").click();
  await card.getByTestId("decide-interest").click();
  await page.getByTestId("mark-interested").click();
  return card;
}

test.describe("Make an offer", () => {
  test("Make an Offer is disabled until the property is marked Interested", async ({ page }) => {
    await signUp(page, uniqueUsername("offergate"));
    await page.getByTestId("add-property-trigger").click();
    await page.getByRole("button", { name: "Enter details manually instead" }).click();
    await page.getByTestId("manual-title-input").fill("Ungated House");
    await page.getByTestId("manual-address-input").fill("1 Nowhere St");
    await page.getByTestId("submit-manual-property").click();

    const card = page.getByTestId("property-card").filter({ hasText: "Ungated House" });
    await expect(card.getByTestId("make-offer")).toBeDisabled();
  });

  test("generates a ready-to-send offer email and copies it to the clipboard", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await signUp(page, uniqueUsername("offer"));
    const card = await getToInterested(page, "Offer Ready House");

    await card.getByTestId("make-offer").click();
    await page.getByTestId("offer-amount-input").fill("450,000");
    await page.getByTestId("agent-name-input").fill("Jane Smith");
    await page.getByTestId("generate-offer-email").click();

    const preview = page.getByTestId("offer-email-preview");
    await expect(preview).toBeVisible();
    await expect(preview).toHaveValue(/450,000/);
    await expect(preview).toHaveValue(/Jane Smith/);
    await expect(preview).toHaveValue(/22 Offer Close, Bristol/);

    await page.getByTestId("copy-offer-email").click();
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain("450,000");

    await page.keyboard.press("Escape");
    await expect(card.getByTestId("status-badge")).toContainText("Offer Sent");
  });
});
