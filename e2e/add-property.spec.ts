import { test, expect } from "@playwright/test";

import { signUp, uniqueUsername } from "./helpers";

test.describe("Add a property", () => {
  test("enriched happy path populates the property from the Rightmove link", async ({ page }) => {
    await page.route("**/api/enrich", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            title: "Charming 2 Bed Cottage",
            address: "1 Test Lane, Bristol",
            imageUrl: "",
          },
        }),
      });
    });

    await signUp(page, uniqueUsername("addhappy"));
    await page.getByTestId("add-property-trigger").click();
    await page.getByTestId("rightmove-url-input").fill(
      "https://www.rightmove.co.uk/properties/999999999",
    );
    await page.getByTestId("submit-rightmove-url").click();

    await expect(page.getByText("Charming 2 Bed Cottage")).toBeVisible();
    await expect(page.getByText("1 Test Lane, Bristol")).toBeVisible();
    await expect(page.getByText("Manually entered")).not.toBeVisible();
  });

  test("enrichment failure surfaces the manual-entry fallback, not a silent failure", async ({
    page,
  }) => {
    await page.route("**/api/enrich", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: false, error: "Couldn't read that listing page" }),
      });
    });

    await signUp(page, uniqueUsername("addfallback"));
    await page.getByTestId("add-property-trigger").click();
    await page.getByTestId("rightmove-url-input").fill(
      "https://www.rightmove.co.uk/properties/000000000",
    );
    await page.getByTestId("submit-rightmove-url").click();

    await expect(page.getByTestId("enrichment-fallback-notice")).toBeVisible();
    await page.getByTestId("manual-title-input").fill("Manually Entered House");
    await page.getByTestId("manual-address-input").fill("2 Fallback Road, Bristol");
    await page.getByTestId("submit-manual-property").click();

    await expect(page.getByText("Manually Entered House")).toBeVisible();
    await expect(page.getByText("Manually entered", { exact: true })).toBeVisible();
  });
});
