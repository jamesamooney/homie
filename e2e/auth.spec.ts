import { test, expect } from "@playwright/test";

import { signUp, uniqueUsername } from "./helpers";

test.describe("Authentication", () => {
  test("unauthenticated visitor is redirected to login", async ({ page }) => {
    await page.goto("/properties");
    await page.waitForURL("/login");
    await expect(page.getByRole("heading", { name: "Homie" })).toBeVisible();
  });

  test("a new user can sign up and land on the dashboard", async ({ page }) => {
    const username = uniqueUsername("signup");
    await page.goto("/login");
    await page.getByRole("tab", { name: "Sign up" }).click();
    await page.getByLabel("Username").fill(username);
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Create account" }).click();
    await page.waitForURL("/dashboard");
    await expect(page.getByTestId("tile-properties")).toBeVisible();
    await expect(page.getByTestId("tile-schedule")).toBeVisible();
    await expect(page.getByTestId("tile-notifications")).toBeVisible();

    await page.goto("/properties");
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
    await page.waitForURL("/dashboard");
    await page.goto("/properties");

    await expect(page.getByTestId("property-card")).toHaveCount(3);
    await page.getByTestId("tab-archived").click();
    await expect(page.getByTestId("property-card")).toHaveCount(1);
  });
});
