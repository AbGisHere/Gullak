import { expect, test } from "@playwright/test";

test.use({ serviceWorkers: "block" });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "gullak-onboarding-profile",
      JSON.stringify({
        id: "d7983cf9-97bd-4af8-817a-1936f32d8626",
        gradeGroup: "grade-8-10",
        experience: "some",
        locale: "en",
        preferredFormats: ["story"],
        createdAt: "2026-10-11T00:00:00.000Z",
      }),
    ),
  );
});

for (const path of ["/~offline", "/missing-page"]) {
  test(`standalone recovery at ${path} has a safe keyboard Back action`, async ({ page }, testInfo) => {
    await page.goto(path);
    const back = page.getByTestId("recovery-back");
    await expect(back).toBeVisible();
    await expect(back).toHaveAccessibleName("Back");
    expect((await back.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    await page.screenshot({ path: testInfo.outputPath("recovery.png"), fullPage: true });
    const profile = await page.evaluate(() => localStorage.getItem("gullak-onboarding-profile"));
    await back.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "Around Nani’s lane" })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("gullak-onboarding-profile"))).toBe(profile);
  });
}

test("an unknown lesson keeps one shell Back control and its Home recovery link", async ({ page }) => {
  await page.goto("/learn/not-a-real-topic");
  await expect(page.getByRole("heading", { name: "We couldn't find that page" })).toBeVisible();
  await expect(page.getByTestId("app-back")).toHaveCount(1);
  await expect(page.getByTestId("recovery-back")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Back to Gullak", exact: true })).toBeVisible();
  await page.getByTestId("app-back").click();
  await expect(page).toHaveURL(/\/$/);
});

test("every routed learner destination exposes the shared Back control", async ({ page }) => {
  // Even unavailable market data must not remove navigation; never query live services.
  await page.route("**/api/market/**", (route) =>
    route.fulfill({ status: 503, contentType: "application/json", body: "{}" }),
  );
  for (const path of [
    "/learn",
    "/learn/money-basics",
    "/practice",
    "/portfolio",
    "/portfolio/invest",
    "/portfolio/invest/TCS.NS",
    "/me",
    "/help",
  ]) {
    await page.goto(path);
    await expect(page.getByTestId("app-back"), path).toBeVisible();
    await page.getByTestId("app-back").click();
    await expect(page).toHaveURL(/\/$/);
  }
});
