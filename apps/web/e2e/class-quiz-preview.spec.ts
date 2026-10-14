import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "gullak-onboarding-profile",
      JSON.stringify({
        id: "d7983cf9-97bd-4af8-817a-1936f32d8626",
        gradeGroup: "grade-6-7",
        experience: "none",
        locale: "en",
        preferredFormats: ["story"],
        createdAt: "2026-10-11T00:00:00.000Z",
      }),
    );
  });
});

test("switching classes shows the selected quiz and preserves separate drafts", async ({ page }) => {
  await page.goto("/learn/money-basics");
  await expect(page.getByRole("radio")).toHaveCount(8);
  await page.getByRole("radio").nth(0).check();
  await page.getByRole("button", { name: /Class 8–10/ }).click();
  await expect(page.getByRole("radio")).toHaveCount(4);
  await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
  await page.getByRole("button", { name: /Class 11–12/ }).click();
  await expect(page.getByRole("radio")).toHaveCount(16);
  await expect(page.getByText(/Kiran earns ₹18,000/)).toBeVisible();
  await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
  await page.getByRole("radio").nth(1).check();
  await page.getByRole("button", { name: /Class 6–7/ }).click();
  await expect(page.getByRole("radio")).toHaveCount(8);
  await expect(page.getByRole("radio").nth(0)).toBeChecked();
  await page.getByRole("button", { name: /Class 11–12/ }).click();
  await expect(page.getByRole("radio").nth(1)).toBeChecked();
  await page.reload();
  await expect(page.getByRole("radio")).toHaveCount(8);
  await page.getByRole("button", { name: /Class 11–12/ }).click();
  await expect(page.getByRole("radio").nth(1)).toBeChecked();
});

test("another class quiz gives feedback without saving mastery, attempts or unlocks", async ({ page }, testInfo) => {
  await page.goto("/learn/money-basics");
  await expect(page.getByRole("radio")).toHaveCount(8);
  const before = await page.evaluate(() => localStorage.getItem("gullak-learner-state"));
  const profileBefore = await page.evaluate(() => localStorage.getItem("gullak-onboarding-profile"));
  await page.getByRole("button", { name: /Class 11–12/ }).click();
  await expect(page.getByRole("radio")).toHaveCount(16);
  await expect(page.getByText(/Your answers update concept mastery/)).toHaveCount(0);
  for (const fieldset of await page.locator("fieldset").all()) {
    await fieldset.locator('input[value="1"]').check();
  }
  await page.getByRole("button", { name: "Check answers", exact: true }).click();
  await expect(page.getByText("Practice score: 100%. Your progress is unchanged.", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "See your updated learning map", exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("gullak-learner-state"))).toBe(before);
  expect(await page.evaluate(() => localStorage.getItem("gullak-onboarding-profile"))).toBe(profileBefore);
  await page.screenshot({ path: testInfo.outputPath("class-quiz-practice.png"), fullPage: true });
  await page.getByRole("button", { name: /Class 6–7/ }).click();
  await expect(page.getByText(/Practice score: /)).toHaveCount(0);
  await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
  // Authored answers: a gift comes in; buying and overspending take money out.
  await page.locator("fieldset").nth(0).locator('input[value="0"]').check();
  await page.locator("fieldset").nth(1).locator('input[value="1"]').check();
  await page.locator("fieldset").nth(2).locator('input[value="1"]').check();
  await page.getByRole("button", { name: "Check answers", exact: true }).click();
  await expect(page.getByText("Passed · 100%", { exact: true })).toBeVisible();
  const ownState = await page.evaluate(() => JSON.parse(localStorage.getItem("gullak-learner-state") ?? "{}"));
  expect(ownState.passedTopics).toContain("money-basics");
  expect(ownState.quizAttempts).toMatchObject([{ topicId: "money-basics", score: 1 }]);
  await page.getByRole("button", { name: /Class 11–12/ }).click();
  await expect(page.getByText(/Practice score: /)).toBeVisible();
  await expect(page.getByText("Passed · 100%", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: /Class 6–7/ }).click();
  await expect(page.getByText("Passed · 100%", { exact: true })).toBeVisible();
});

test("an older learner can preview younger questions without changing their class", async ({ page }) => {
  await page.addInitScript(() => {
    const profile = JSON.parse(localStorage.getItem("gullak-onboarding-profile") ?? "{}");
    localStorage.setItem("gullak-onboarding-profile", JSON.stringify({ ...profile, gradeGroup: "grade-11-12" }));
  });
  await page.goto("/learn/money-basics");
  await expect(page.getByRole("radio")).toHaveCount(16);
  await page.getByRole("radio").nth(1).check();
  await page.getByRole("button", { name: /Class 6–7/ }).click();
  await expect(page.getByRole("radio")).toHaveCount(8);
  await expect(page.getByText(/Nani gives you ₹50/)).toBeVisible();
  await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
  await page.getByRole("button", { name: /Class 11–12/ }).click();
  await expect(page.getByRole("radio").nth(1)).toBeChecked();
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem("gullak-onboarding-profile") ?? "{}").gradeGroup),
  ).toBe("grade-11-12");
});
