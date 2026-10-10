import { expect, test } from "@playwright/test";

test("learner can complete onboarding with a local profile", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Money learning, made for your next move." })).toBeVisible();
  await expect(page.getByText("Play money", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "First job" }).click();
  await page.getByRole("button", { name: "I know a few basics" }).click();
  await expect(page.getByText("Your virtual starting balance will be ₹75,000.")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Short videos" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("What is the goal?").fill("Emergency fund");
  await page.getByLabel("Target amount (₹)").fill("25000");
  await page.getByLabel("When would you like it?").fill("2027-01-01");
  await page.getByRole("button", { name: "Create my path" }).click();

  await expect(page.getByRole("heading", { name: "Your learning path is ready." })).toBeVisible();
  await expect(page.evaluate(() => window.localStorage.getItem("gullak-onboarding-profile"))).resolves.toContain("Emergency fund");
});

test("serves a web app manifest", async ({ request }) => {
  const res = await request.get("/manifest.webmanifest");
  expect(res.ok()).toBe(true);
  expect((await res.json()).short_name).toBe("Gullak");
});
