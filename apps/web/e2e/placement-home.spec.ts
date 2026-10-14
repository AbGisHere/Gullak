import { expect, type Page, test } from "@playwright/test";

async function startOnboardingQuiz(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Class 8–10", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Skip", exact: true }).click();
  await page.getByRole("button", { name: "Skip", exact: true }).click();
  await page.getByRole("button", { name: "Start learning", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Find your level", exact: true })).toBeVisible();
}

async function expectHome(page: Page) {
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "Around Nani’s lane", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Continue Nani’s story/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recommended next, because…", exact: true })).toBeVisible();
}

test("skipping the starting quiz reveals Home without creating quiz evidence", async ({ page }) => {
  await startOnboardingQuiz(page);
  await page.getByRole("button", { name: "Skip for now", exact: true }).click();
  await expectHome(page);
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem("gullak-learner-state") ?? "{}"));
  expect(state.placement).toMatchObject({ passed: 0, skipped: true });
  expect(state.quizAttempts).toEqual([]);
});

test("a failed starting round reveals Home and preserves its scored attempt", async ({ page }, testInfo) => {
  await startOnboardingQuiz(page);
  await page.getByRole("button", { name: "Start the level check", exact: true }).click();
  await page.getByRole("radio").nth(1).check();
  await page.getByRole("radio").nth(3).check();
  await page.getByRole("button", { name: "Check this round", exact: true }).click();
  await expectHome(page);
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem("gullak-learner-state") ?? "{}"));
  expect(state.placement).toMatchObject({ passed: 0, skipped: false });
  expect(state.quizAttempts).toMatchObject([{ topicId: "money-basics", score: 0 }]);
  expect(state.passedTopics).not.toContain("money-basics");
  await page.screenshot({ path: testInfo.outputPath("home-after-placement.png"), fullPage: true });
});

test("stopping after a passed starting round reveals Home and keeps its unlock", async ({ page }) => {
  await startOnboardingQuiz(page);
  await page.getByRole("button", { name: "Start the level check", exact: true }).click();
  await page.getByRole("radio").nth(0).check();
  await page.getByRole("radio").nth(2).check();
  await page.getByRole("button", { name: "Check this round", exact: true }).click();
  await page.getByRole("button", { name: "Stop here", exact: true }).click();
  await expectHome(page);
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem("gullak-learner-state") ?? "{}"));
  expect(state.placement).toMatchObject({ passed: 1, skipped: false });
  expect(state.passedTopics).toContain("money-basics");
  expect(state.quizAttempts).toMatchObject([{ topicId: "money-basics", score: 1 }]);
});

test("Home keeps the learning shortcut while Learn shows only the learning map", async ({ page }) => {
  await startOnboardingQuiz(page);
  await page.getByRole("button", { name: "Skip for now", exact: true }).click();
  await expectHome(page);
  await page.getByRole("button", { name: /^Visit Nani’s lane/ }).click();
  await expect(page).toHaveURL(/\/learn$/);
  await expect(page.getByTestId("stage-path")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recommended next, because…", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Nani’s lane", exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Step inside: Where money comes from and goes", exact: true }),
  ).toBeVisible();
  await page.getByTestId("app-back").click();
  await expectHome(page);
});

test("passing every starting round reveals Home with both lesson passes saved", async ({ page }) => {
  await startOnboardingQuiz(page);
  await page.getByRole("button", { name: "Start the level check", exact: true }).click();
  await page.getByRole("radio").nth(0).check();
  await page.getByRole("radio").nth(2).check();
  await page.getByRole("button", { name: "Check this round", exact: true }).click();
  await page.getByRole("button", { name: "Next round", exact: true }).click();
  // Authored answer keys: a need, the optional treat, and a work-essential phone.
  await page.locator("fieldset").nth(0).locator('input[value="0"]').check();
  await page.locator("fieldset").nth(1).locator('input[value="2"]').check();
  await page.locator("fieldset").nth(2).locator('input[value="0"]').check();
  await page.getByRole("button", { name: "Check this round", exact: true }).click();
  await expectHome(page);
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem("gullak-learner-state") ?? "{}"));
  expect(state.placement).toMatchObject({ passed: 2, rounds: 2, skipped: false });
  expect(state.passedTopics).toEqual(["money-basics", "needs-vs-wants"]);
  expect(state.quizAttempts).toMatchObject([
    { topicId: "money-basics", score: 1 },
    { topicId: "needs-vs-wants", score: 1 },
  ]);
});
