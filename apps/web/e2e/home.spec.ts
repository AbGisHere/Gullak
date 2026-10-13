import { expect, test } from "@playwright/test";

test("learner can complete onboarding with a local profile", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Learn money by doing, with play money." })).toBeVisible();
  // Account setup omits the badge; money screens still label virtual balances.
  await expect(page.getByText("Play money", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Continue" }).click();

  // Grade group is required before continuing; experience only sets a starting point.
  await expect(page.getByRole("button", { name: "Continue" })).toBeDisabled();
  await page.getByRole("button", { name: "Class 11–12" }).click();
  await page.getByRole("button", { name: "I know a few basics" }).click();
  await expect(page.getByText("Your virtual starting balance will be ₹15,000.")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();

  // Format preference is optional: "Mix it up" is the default and Skip moves on.
  await expect(page.getByRole("button", { name: "Mix it up" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Skip" }).click();

  await page.getByLabel("What is the goal?").fill("Laptop");
  await page.getByLabel("Target amount (₹)").fill("50000");
  await page.getByLabel("When would you like it?").fill("2027-06-01");
  await page.getByRole("button", { name: "Create my path" }).click();

  await expect(page.getByRole("heading", { name: "Your learning path is ready." })).toBeVisible();
  const saved = await page.evaluate(() => window.localStorage.getItem("gullak-onboarding-profile"));
  expect(JSON.parse(saved ?? "{}")).toMatchObject({
    gradeGroup: "grade-11-12",
    experience: "some",
    preferredFormats: ["video", "story", "visual", "formula", "transcript", "simulation", "quiz", "audio"],
    goal: { label: "Laptop", targetPaise: 5_000_000 },
  });
});

test("serves a web app manifest", async ({ request }) => {
  const res = await request.get("/manifest.webmanifest");
  expect(res.ok()).toBe(true);
  expect((await res.json()).short_name).toBe("Gullak");
});
