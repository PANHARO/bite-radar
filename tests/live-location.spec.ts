import { test, expect } from "@playwright/test";
test("real browser location updates distances; web notifications stay unavailable", async ({
  page,
  context,
}) => {
  await context.setGeolocation({
    latitude: 11.555,
    longitude: 104.928,
    accuracy: 10,
  });
  await context.grantPermissions(["geolocation"]);
  await page.goto("/");
  await page.getByRole("button", { name: "Get Started", exact: true }).click();
  await expect(
    page.getByText("Current location", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Settings and reminders", exact: true })
    .click();
  await expect(
    page.getByText(/Current position: 11.55500, 104.92800/),
  ).toBeVisible();
  await expect(
    page.getByRole("switch", { name: "Nearby reminders", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByText(
      "Web supports live distances. Use the Android or iOS app for nearby notifications.",
    ),
  ).toBeVisible();
});
test("new manual places require coordinates and can use current position explicitly", async ({
  page,
  context,
}) => {
  await context.setGeolocation({
    latitude: 11.555,
    longitude: 104.928,
    accuracy: 10,
  });
  await context.grantPermissions(["geolocation"]);
  await page.goto("/");
  await page.getByRole("button", { name: "Get Started", exact: true }).click();
  await page
    .getByRole("button", { name: "Add a Food Spot", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Restaurant name", exact: true })
    .fill("Real lunch spot");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Adjust pin / enter location manually",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Latitude", exact: true }),
  ).toHaveValue("");
  await page
    .getByRole("textbox", { name: "Restaurant address", exact: true })
    .fill("My actual address");
  await page.getByRole("button", { name: "Save Spot", exact: true }).click();
  await expect(
    page.getByText(
      "Enter valid latitude (−90 to 90) and longitude (−180 to 180).",
    ),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Use my current location as pin",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Latitude", exact: true }),
  ).toHaveValue("11.555");
  await page.getByRole("button", { name: "Save Spot", exact: true }).click();
  await expect(
    page.getByText("Real lunch spot is on your radar."),
  ).toBeVisible();
});
