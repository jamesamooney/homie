import type { Page } from "@playwright/test";

export function uniqueUsername(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

export async function signUp(page: Page, username: string, password = "password123") {
  await page.goto("/login");
  await page.getByRole("tab", { name: "Sign up" }).click();
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL("/dashboard");
  // Most flows still act on the property list, which is one level in from the dashboard.
  await page.goto("/properties");
}
