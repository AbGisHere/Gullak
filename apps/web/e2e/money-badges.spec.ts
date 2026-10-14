import { expect, test } from "@playwright/test";

test.use({ serviceWorkers: "block" });

test("money screens retain working controls without decorative money badges", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
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
    );
  });
  await page.route("**/api/market/**", (route) =>
    route.fulfill({ status: 503, contentType: "application/json", body: "{}" }),
  );
  for (const path of ["/practice", "/portfolio", "/portfolio/invest", "/portfolio/invest/TCS.NS"]) {
    await page.goto(path);
    await expect(page.getByTestId("app-back")).toBeVisible();
    await expect(page.locator('[data-slot="play-money-badge"]')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (path === "/practice") {
      await page.screenshot({ path: testInfo.outputPath("practice-without-badges.png"), fullPage: true });
    }
  }
  await page.goto("/");
  await page.getByRole("button", { name: /^Continue Nani’s story/ }).click();
  await expect(page.getByRole("heading", { name: "Come in. Nani’s waiting." })).toBeVisible();
  await expect(page.locator('[data-slot="play-money-badge"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Meet the household" }).click();
  await expect(page.getByRole("heading", { name: "Everyone has a plan." })).toBeVisible();
  await expect(page.locator('[data-slot="play-money-badge"]')).toHaveCount(0);
  for (const destination of [
    { button: /^Your living Gullak/, heading: "Your living Gullak" },
    { button: /^Rewards and quests/, heading: "Rewards and achievements" },
    { button: /^Gullu goes shopping/, heading: "Candy Economy · Mission 1" },
  ]) {
    await page.goto("/");
    await page.getByRole("button", { name: destination.button }).click();
    await expect(page.getByRole("heading", { name: destination.heading, exact: true })).toBeVisible();
    await expect(page.locator('[data-slot="play-money-badge"]')).toHaveCount(0);
  }
});
