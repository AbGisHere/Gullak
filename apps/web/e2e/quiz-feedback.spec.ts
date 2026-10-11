import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`checked quiz explains every answer and scrolls to the score in ${theme} mode`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript((selectedTheme) => {
      window.localStorage.setItem("theme", selectedTheme);
      window.localStorage.setItem(
        "gullak-onboarding-profile",
        JSON.stringify({
          id: "11111111-1111-4111-8111-111111111111",
          gradeGroup: "grade-8-10",
          experience: "none",
          locale: "en",
          preferredFormats: ["transcript"],
          createdAt: "2026-10-11T00:00:00.000Z",
        }),
      );
    }, theme);
    await page.goto("/learn/money-basics");
    const firstQuestion = page.getByRole("group", { name: /Which of these is money coming in/ });
    const secondQuestion = page.getByRole("group", { name: /Paying the electricity bill/ });
    const incorrectOption = firstQuestion.getByRole("radio", { name: "Buying a snack" });
    const correctOption = secondQuestion.getByRole("radio", { name: "Money going out" });
    await incorrectOption.check();
    await correctOption.check();
    const uncheckedColor = await incorrectOption
      .locator("..")
      .evaluate((label) => getComputedStyle(label).backgroundColor);
    const check = page.getByRole("button", { name: "Check answers" });
    await check.click();

    const results = page.getByRole("status", { name: "Your quiz results" });
    await expect(results).toBeFocused();
    await expect(results).toBeInViewport();
    await expect(results).toContainText("50%");
    await expect(firstQuestion).toContainText("Your answer needs another look");
    await expect(firstQuestion).toContainText("Correct answer: Pocket money from family");
    await expect(firstQuestion).toContainText("Pocket money is money coming in; buying a snack is money going out.");
    await expect(secondQuestion).toContainText("Your answer is correct");
    await expect(secondQuestion).toContainText("Paying a bill means money leaves your hands.");
    const incorrectColor = await incorrectOption
      .locator("..")
      .evaluate((label) => getComputedStyle(label).backgroundColor);
    const correctColor = await correctOption.locator("..").evaluate((label) => getComputedStyle(label).backgroundColor);
    expect(incorrectColor).not.toBe(uncheckedColor);
    expect(correctColor).not.toBe(incorrectColor);
    await expect(check).toBeDisabled();

    // An edited answer must not retain a stale mark, explanation or score.
    await firstQuestion.getByRole("radio", { name: "Pocket money from family" }).check();
    await expect(results).toHaveCount(0);
    await expect(firstQuestion.getByText("Your answer needs another look")).toHaveCount(0);
    await expect(check).toBeEnabled();
    await check.click();
    await expect(results).toContainText("Passed · 100%");
    await expect(results).toBeFocused();
    await expect(results).toBeInViewport();
  });
}
