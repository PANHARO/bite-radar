import { test, expect } from "@playwright/test";
import { capture } from "./capture";
test("invalid link recovers without losing notes", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Get Started", exact: true }).click();
  await page
    .getByRole("button", { name: "Add a Food Spot", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "TikTok URL", exact: true })
    .fill("https://tiktok.com.evil.test/@food/video/123");
  await page
    .getByRole("textbox", { name: "Restaurant name", exact: true })
    .fill("My lunch spot");
  await page
    .getByRole("textbox", { name: "Personal notes", exact: true })
    .fill("Keep this note");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByText("Still worth saving.")).toBeVisible();
  await page
    .getByRole("button", { name: "Enter restaurant manually", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Personal notes", exact: true }),
  ).toHaveValue("Keep this note");
});
test("settings persist and corrupt storage is not overwritten", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Get Started", exact: true }).click();
  await page
    .getByRole("button", { name: "Settings and reminders", exact: true })
    .click();
  await page.getByRole("button", { name: "200 m", exact: true }).click();
  await page
    .getByRole("switch", { name: "Reminder preview", exact: true })
    .click();
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "200 m", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: "Dark", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByText("Preview on · No live alerts", { exact: true }),
  ).toBeVisible();
  await capture(page, "artifacts/settings-dark.png");
  await page.evaluate(() =>
    localStorage.setItem("@biteradar/personal/v1", "broken"),
  );
  await page.reload();
  await expect(
    page.getByText(
      "Your saved collection could not be read. Your data has not been overwritten.",
    ),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("@biteradar/personal/v1")),
  ).toBe("broken");
});
test("offline collection, empty and permission previews are usable", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (
      m.type() === "error" &&
      !m.text().includes("net::ERR_INTERNET_DISCONNECTED")
    )
      errors.push(m.text());
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Get Started", exact: true }).click();
  await page.getByRole("tab", { name: "Saved", exact: true }).click();
  await context.setOffline(true);
  await expect(
    page.getByText("You’re offline · Your saved places are still here →"),
  ).toBeVisible();
  await page
    .getByText("You’re offline · Your saved places are still here →")
    .click();
  await expect(page.getByText("Good taste travels.")).toBeVisible();
  await expect(
    page.getByText("136 Norodom Boulevard, Phnom Penh", { exact: true }).last(),
  ).toBeVisible();
  await context.setOffline(false);
  await page
    .getByRole("button", { name: "Try connection again", exact: true })
    .click();
  for (const [kind, title] of [
    ["empty", "Your next favorite starts here."],
    ["loading", "One delicious moment…"],
    ["location", "A city is a good start."],
    ["reminders", "Your spot is safe."],
    ["notification", "A nudge, not a feed."],
  ]) {
    await page.goto(`/state/${kind}`);
    await expect(
      page.getByText(title, { exact: kind !== "reminders" }),
    ).toBeVisible();
    if (kind !== "loading") await capture(page, `artifacts/state-${kind}.png`);
  }
  expect(errors).toEqual([]);
});
for (const width of [360, 800])
  test(`layout fits ${width}px and core navigation works`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 800 ? 1280 : 900 });
    await page.goto("/");
    await page
      .getByRole("button", { name: "Get Started", exact: true })
      .click();
    await capture(page, `artifacts/home-${width}.png`);
    await page.getByRole("tab", { name: "Saved", exact: true }).click();
    await capture(page, `artifacts/saved-${width}.png`);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    await page
      .getByRole("button", { name: "Add a Food Spot", exact: true })
      .click();
    await capture(page, `artifacts/add-${width}.png`);
    await expect(
      page.getByRole("textbox", { name: "Restaurant name", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  });
