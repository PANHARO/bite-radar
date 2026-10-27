import { expect, Page } from "@playwright/test";
export async function capture(page: Page, path: string) {
  await expect
    .poll(() =>
      page.locator("img").evaluateAll((nodes) =>
        nodes
          .filter((n) => {
            const r = n.getBoundingClientRect();
            return (
              n.checkVisibility() &&
              r.width > 0 &&
              r.height > 0 &&
              r.top < innerHeight &&
              r.bottom > 0 &&
              r.left < innerWidth &&
              r.right > 0
            );
          })
          .every(
            (n) =>
              (n as HTMLImageElement).complete &&
              (n as HTMLImageElement).naturalWidth > 0,
          ),
      ),
    )
    .toBeTruthy();
  await page.screenshot({ path, animations: "disabled" });
}
