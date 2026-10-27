import { capture } from "./capture";
import { test, expect } from "@playwright/test";
test("save, restart, map, visit, edit and remove a local restaurant", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Get Started", exact: true }).click();
  await page
    .getByRole("button", { name: "Add a Food Spot", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "TikTok URL", exact: true })
    .fill("https://www.tiktok.com/@biteradar/video/1234567890");
  await page
    .getByRole("textbox", { name: "Restaurant name", exact: true })
    .fill("BKK Noodle House");
  await page
    .getByRole("textbox", { name: "Personal notes", exact: true })
    .fill("Try the handmade noodles.");
  await page.getByRole("button", { name: "Noodles", exact: true }).click();
  await capture(page, "artifacts/add-390.png");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Adjust pin / enter location manually",
      exact: true,
    })
    .click();
  await page
    .getByRole("textbox", { name: "Restaurant address", exact: true })
    .fill("Street 310, BKK 1, Phnom Penh");
  await page
    .getByRole("textbox", { name: "Latitude", exact: true })
    .fill("11.551");
  await page
    .getByRole("textbox", { name: "Longitude", exact: true })
    .fill("104.925");
  await page.getByRole("button", { name: "Save Spot", exact: true }).click();
  await expect(
    page.getByText("BKK Noodle House is on your radar."),
  ).toBeVisible();
  await capture(page, "artifacts/success-390.png");
  await page
    .getByRole("button", {
      name: "Not now · Back to my collection",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", {
      name: "BKK Noodle House, Want to try",
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", {
      name: "BKK Noodle House, Want to try",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Map", exact: true }).click();
  const pin = page.getByRole("button", {
    name: "BKK Noodle House, want to try, demo pin",
    exact: true,
  });
  await expect(pin).toBeVisible();
  await capture(page, "artifacts/map-workflow.png");
  await pin.click({ timeout: 3000 });
  await page
    .getByRole("button", { name: "View BKK Noodle House details", exact: true })
    .click();
  await expect(
    page.getByText("Try the handmade noodles.", { exact: true }),
  ).toBeVisible();
  const originalLink = page.waitForEvent("popup");
  await page
    .getByRole("button", { name: "Open Original TikTok", exact: true })
    .click();
  const popup = await originalLink;
  await expect(popup).toHaveURL(
    "https://www.tiktok.com/@biteradar/video/1234567890",
  );
  await popup.close();
  await page.getByRole("button", { name: "✓ Visited", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "✓ Visited", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: "Edit restaurant", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Restaurant name", exact: true })
    .fill("BKK Noodle House Updated");
  await page
    .getByRole("button", { name: "Continue to location", exact: true })
    .click();
  await page.getByRole("button", { name: "Save Changes", exact: true }).click();
  await expect(
    page.getByText("BKK Noodle House Updated is on your radar."),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Not now · Back to my collection",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", {
      name: "BKK Noodle House Updated, Visited",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Remove place", exact: true }).click();
  await expect(
    page.getByText("Remove BKK Noodle House Updated?"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await expect(
    page.getByText("BKK Noodle House Updated", { exact: true }).last(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Remove place", exact: true }).click();
  await page
    .getByRole("button", { name: "Remove this place", exact: true })
    .click();
  await expect(
    page.getByRole("searchbox", { name: "Search saved food", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "BKK Noodle House Updated, Visited",
      exact: true,
    }),
  ).toHaveCount(0);
  await page.reload();
  await expect(page.getByText("3 little reasons to go out.")).toBeVisible();
  expect(errors).toEqual([]);
});

test("manual entry can choose a demo location", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Get Started", exact: true }).click();
  await page
    .getByRole("button", { name: "Add a Food Spot", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Enter restaurant manually", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Restaurant name", exact: true })
    .fill("Malis");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Choose Malis", exact: true }).click();
  await capture(page, "artifacts/confirm-390.png");
  await page.getByRole("button", { name: "Save Spot", exact: true }).click();
  await expect(page.getByText("Malis is on your radar.")).toBeVisible();
});
