import { capture } from "./capture";
import { test, expect } from "@playwright/test";
test("M1 main screens render and navigate", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByText("Never forget a food spot again.")).toBeVisible();
  await capture(page, "artifacts/welcome-390.png");
  await page.getByRole("button", { name: "Get Started", exact: true }).click();
  await expect(
    page.getByText("Your next craving is already on the map."),
  ).toBeVisible();
  await capture(page, "artifacts/home-390.png");
  await page.getByRole("tab", { name: "Saved", exact: true }).click();
  await expect(page.getByText("My Saved Food", { exact: true })).toBeVisible();
  await capture(page, "artifacts/saved-390.png");
  await page.getByRole("tab", { name: "Map", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Search map" })).toBeVisible();
  await capture(page, "artifacts/map-390.png");
  await page.getByRole("tab", { name: "Home", exact: true }).click();
  await page.getByRole("button", { name: "Settings and reminders" }).click();
  await expect(page.getByText("Your radar, your rules.")).toBeVisible();
  await capture(page, "artifacts/settings-390.png");
  expect(errors).toEqual([]);
});
