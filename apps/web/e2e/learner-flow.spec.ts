import { expect, test } from "@playwright/test";

test("onboarding to passed quiz opens the next topic", async ({ page }, testInfo) => {
  const viewportName = testInfo.project.name;
  async function auditScreen(name: string) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      await page.evaluate(() => window.innerWidth),
    );
    await page.screenshot({ path: testInfo.outputPath(`${viewportName}-${name}.png`), fullPage: true });
  }
  await page.goto("/");
  await auditScreen("onboarding");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Class 8–10" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Skip" }).click();
  await page.getByRole("button", { name: "Skip" }).click();
  await page.getByRole("button", { name: "Start learning" }).click();
  // "/" opens the tabbed learner app; the routed learning map stays at /learn.
  await expect(page.getByRole("button", { name: "Start learning" })).toBeHidden();
  await page.goto("/learn");

  await expect(page.getByRole("heading", { name: "Your learning map" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Where money comes from and goes" }).first()).toBeVisible();
  await auditScreen("learn");
  await page
    .getByRole("link", { name: /Continue/ })
    .first()
    .click();
  await expect(page.getByRole("heading", { name: "Quick check" })).toBeVisible();
  await auditScreen("lesson-quiz");

  await page.getByRole("radio").nth(0).check();
  await page.getByRole("radio").nth(2).check();
  await page.getByRole("button", { name: "Check answers" }).click();
  await expect(page.getByText("Passed · 100%")).toBeVisible();
  await page.getByRole("link", { name: "See your updated learning map" }).click();
  await expect(page.getByRole("heading", { name: "Needs and wants" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open topic Needs and wants" })).toBeVisible();
  await page.getByRole("link", { name: "Practice" }).click();
  await expect(page.getByRole("heading", { name: "Practice with a real moment" })).toBeVisible();
  await expect(page.getByText("March 2020: the hospital bill")).toBeVisible();
  await auditScreen("practice");
  await page.getByRole("link", { name: "Portfolio" }).click();
  await expect(page.getByRole("heading", { name: "Your paper portfolio" })).toBeVisible();
  await auditScreen("portfolio");
  await page.getByRole("link", { name: "Me" }).click();
  await expect(page.getByRole("heading", { name: "About this device" })).toBeVisible();
  await auditScreen("me");
});
