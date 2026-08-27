import { test, expect } from "@playwright/test";

import { signUp, uniqueUsername } from "./helpers";

test.describe("Authentication", () => {
  test("unauthenticated visitor is redirected to login", async ({ page }) => {
    await page.goto("/properties");
    await page.waitForURL("/login");
    await expect(page.getByRole("heading", { name: "Homie" })).toBeVisible();
  });

  test("a new user can sign up and reach the properties view", async ({ page }) => {
    const username = uniqueUsername("signup");
    await signUp(page, username);
    await expect(page.getByRole("heading", { name: "No properties yet" })).toBeVisible();
  });

  test("logout returns to login, and logging back in restores saved data", async ({ page }) => {
    const username = uniqueUsername("persist");
    await signUp(page, username);

    await page.getByTestId("load-demo-data").click();
    await expect(page.getByTestId("property-card").first()).toBeVisible();

    await page.getByRole("button", { name: "Log out" }).click();
    await page.waitForURL("/login");

    await page.getByRole("tab", { name: "Log in" }).click();
    await page.getByLabel("Username").fill(username);
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Log in" }).click();
    await page.waitForURL("/properties");

    await expect(page.getByTestId("property-card")).toHaveCount(3);
    await page.getByTestId("tab-archived").click();
    await expect(page.getByTestId("property-card")).toHaveCount(1);
  });
});
