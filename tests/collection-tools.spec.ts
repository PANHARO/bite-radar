import { test, expect } from "@playwright/test";
test("collection search, filters, sort and list/grid controls change results", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Get Started", exact: true }).click();
  await page.getByRole("tab", { name: "Saved", exact: true }).click();
  await page.getByRole("button", { name: "Visited · 1", exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: "Eleven One Kitchen, Visited",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Malis, Want to try", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "All · 3", exact: true }).click();
  await page
    .getByRole("button", { name: "Focus food search", exact: true })
    .click();
  await expect(
    page.getByRole("searchbox", { name: "Search saved food", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("searchbox", { name: "Search saved food", exact: true })
    .fill("handmade");
  await expect(
    page.getByRole("button", {
      name: "David’s Restaurant, Want to try",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Malis, Want to try", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("searchbox", { name: "Search saved food", exact: true })
    .fill("");
  await page
    .getByRole("button", { name: "Sort restaurants", exact: true })
    .click();
  await page.getByRole("button", { name: "Nearest", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Sort restaurants", exact: true }),
  ).toContainText("Nearest");
  await page.getByRole("button", { name: "List view", exact: true }).click();
  const cards = page
    .getByRole("button")
    .filter({
      hasText: /Khmer comfort food|Fresh Khmer plates|Handmade noodles/,
    });
  await expect(cards).toHaveCount(3);
  await expect(cards.nth(0)).toContainText("Malis");
  await expect(cards.nth(1)).toContainText("Eleven One Kitchen");
  await page.getByRole("button", { name: "Grid view", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Malis, Want to try", exact: true }),
  ).toBeVisible();
});
