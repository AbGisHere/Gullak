import { expect, test } from "@playwright/test";

test("home shows play-money label and computed starting cash", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Gullak" })).toBeVisible();
  await expect(page.getByText("Play money")).toBeVisible();
  await expect(page.getByTestId("starting-cash")).toHaveText("₹10,000");
});

test("serves a web app manifest", async ({ request }) => {
  const res = await request.get("/manifest.webmanifest");
  expect(res.ok()).toBe(true);
  expect((await res.json()).short_name).toBe("Gullak");
});
