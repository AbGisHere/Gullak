import { expect, test } from "@playwright/test";

async function openLearner(page: import("@playwright/test").Page, gradeGroup = "grade-11-12") {
  await page.addInitScript((grade) => {
    window.localStorage.setItem(
      "gullak-onboarding-profile",
      JSON.stringify({
        id: "d7983cf9-97bd-4af8-817a-1936f32d8626",
        gradeGroup: grade,
        experience: "some",
        locale: "en",
        preferredFormats: ["simulation"],
        createdAt: "2026-10-11T00:00:00.000Z",
      }),
    );
  }, gradeGroup);
  await page.goto("/");
}

test("savings respond to keyboard, repeated deposits, goals, undo and reset", async ({ page }) => {
  // Class 6–7 with some experience starts with ₹3,000 (starting-capital.json), the amount onboarding shows.
  await openLearner(page, "grade-6-7");
  await page.getByRole("button", { name: "Portfolio", exact: true }).click();
  const save = page.getByRole("button", { name: "Save ₹100", exact: true });
  await save.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("jar-balance")).toHaveText("In the jar: ₹100");
  await expect(page.getByTestId("goal-progress")).toContainText("50% saved");
  await save.click();
  await expect(page.getByTestId("goal-progress")).toContainText("100% saved");
  await page.getByRole("button", { name: "Bicycle · ₹1,000" }).click();
  await expect(page.getByTestId("goal-progress")).toContainText("20% saved");
  await page.getByRole("button", { name: "Spend ₹50 on a treat" }).click();
  await expect(page.getByTestId("wallet-balance")).toHaveText("Wallet: ₹2,750");
  await page.getByRole("button", { name: "Undo last choice" }).click();
  await expect(page.getByTestId("wallet-balance")).toHaveText("Wallet: ₹2,800");
  for (let index = 0; index < 28; index++) await save.click();
  await expect(page.getByTestId("wallet-balance")).toHaveText("Wallet: ₹0");
  // A fully spent wallet is valid; attempt one more deposit to exercise rejection.
  await save.click();
  await expect(page.getByRole("status").filter({ hasText: "Your wallet cannot cover" })).toBeVisible();
  await expect(page.getByTestId("wallet-balance")).toHaveText("Wallet: ₹0");
  await page.getByRole("button", { name: "Reset playground" }).click();
  await expect(page.getByTestId("jar-balance")).toHaveText("In the jar: ₹0");
  await expect(page.getByRole("button", { name: "Undo last choice" })).toBeDisabled();
  await page.getByRole("button", { name: "Explain Opportunity cost" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Explain Opportunity cost" })).toBeFocused();
});

test("older learners can explore losses without changing jar balances", async ({ page }) => {
  await openLearner(page);
  await page.getByRole("button", { name: "Portfolio", exact: true }).click();
  await page.getByRole("button", { name: "50 in each business" }).click();
  await expect(page.getByText("After this event: 90 fictional tokens (started with 100).")).toBeVisible();
  await page.getByLabel("Choose a hypothetical event").selectOption("bothDown");
  await expect(page.getByText("After this event: 80 fictional tokens (started with 100).")).toBeVisible();
  await expect(page.getByTestId("jar-balance")).toHaveText("In the jar: ₹0");
});

test("quest retries, locks, one-time rewards, focus recovery and reset", async ({ page }) => {
  await openLearner(page);
  await page.getByRole("button", { name: "Rewards", exact: true }).click();
  const sort = page
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: "Needs or wants?", exact: true }) });
  const budget = page
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: "Make room for tomorrow", exact: true }) });
  await expect(budget.getByRole("button")).toBeDisabled();
  await sort.getByRole("button").click();
  await expect(page.getByRole("heading", { name: "Needs or wants?" }).last()).toBeFocused();
  await page.getByRole("button", { name: "Want", exact: true }).click();
  await expect(page.getByText("Try another choice.")).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Try another choice." })).toBeFocused();
  await expect(page.getByTestId("practice-xp")).toHaveText("0 practice XP");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await page.getByRole("button", { name: "Need", exact: true }).focus();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "Next step" }).click();
  await page.getByRole("button", { name: "Want", exact: true }).click();
  await expect(page.getByTestId("practice-xp")).toHaveText("20 practice XP");
  await expect(sort.getByRole("button")).toBeDisabled();
  await expect(budget.getByRole("button")).toBeEnabled();
  await page.getByRole("button", { name: "Back to board" }).click();
  await budget.getByRole("button").click();
  await page.keyboard.press("Escape");
  await expect(budget.getByRole("button")).toBeFocused();
  await page.getByRole("button", { name: "We discussed why context matters" }).click();
  await expect(page.getByTestId("practice-xp")).toHaveText("30 practice XP");
  await expect(page.getByRole("button", { name: "Conversation checked in" })).toBeDisabled();
  await page.getByRole("button", { name: "Reset all practice" }).click();
  const resetDialog = page.getByRole("dialog", { name: "Start every mission again?" });
  await expect(resetDialog).toBeVisible();
  await expect(page.getByTestId("practice-xp")).toHaveText("30 practice XP");
  await resetDialog.getByRole("button", { name: "Keep my progress", exact: true }).click();
  await expect(resetDialog).toHaveCount(0);
  await expect(page.getByTestId("practice-xp")).toHaveText("30 practice XP");
  await page.getByRole("button", { name: "Reset all practice" }).click();
  await resetDialog.getByRole("button", { name: "Clear missions", exact: true }).click();
  await expect(resetDialog).toHaveCount(0);
  await expect(page.getByTestId("practice-xp")).toHaveText("0 practice XP");
  await expect(sort.getByRole("button")).toBeEnabled();
  await expect(budget.getByRole("button")).toBeDisabled();
});

for (const [locale, portfolioTitle, missionsTitle, portfolioNav, rewardsNav] of [
  ["hi", "गुल्लू का बचत खेल", "गुल्लू का खोज बोर्ड", "पोर्टफोलियो", "पुरस्कार"],
  ["te", "గుల్లు పొదుపు ఆట", "గుల్లు అన్వేషణ బోర్డు", "పోర్ట్‌ఫోలియో", "రివార్డులు"],
]) {
  test(`module translations render in ${locale}`, async ({ page }) => {
    await page.context().addCookies([{ name: "GULLAK_LOCALE", value: locale ?? "en", url: "http://localhost:3000" }]);
    await openLearner(page);
    // Learn is now a link; select translated destinations rather than button positions.
    const nav = page.locator("nav:visible");
    await nav.getByRole("button", { name: portfolioNav, exact: true }).click();
    await expect(page.getByRole("heading", { name: portfolioTitle })).toBeVisible();
    await nav.getByRole("button", { name: rewardsNav, exact: true }).click();
    await expect(page.getByRole("heading", { name: missionsTitle })).toBeVisible();
  });
}

test("all quests teach their reasoning and unlock an earned cosmetic", async ({ page }) => {
  await openLearner(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Rewards", exact: true }).click();
  for (const [title, answers] of [
    ["Needs or wants?", ["Need", "Want"]],
    ["Spot the payment trap", ["Decline and verify with a trusted adult"]],
    ["Make room for tomorrow", ["₹40 supplies, ₹30 savings, ₹30 treats"]],
    ["Compare the pencil packs", ["Pack B"]],
  ] as const) {
    const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name: title, exact: true }) });
    await card.getByRole("button").click();
    for (let index = 0; index < answers.length; index++) {
      await page.getByRole("button", { name: answers[index], exact: true }).click();
      await expect(page.getByText("You worked it out!")).toBeVisible();
      if (index < answers.length - 1) await page.getByRole("button", { name: "Next step" }).click();
    }
    await expect(
      page.getByText("Quest complete! XP is awarded once for understanding, never for money returns."),
    ).toBeVisible();
    await page.getByRole("button", { name: "Back to board" }).click();
    await expect(page.getByRole("heading", { name: "Gullu’s quest board" })).toBeFocused();
  }
  await expect(page.getByTestId("practice-xp")).toHaveText("100 practice XP");
  await expect(page.getByText("Gullu’s explorer patch earned!")).toBeVisible();
});

test("younger learner gets touch-friendly saving without the older portfolio scenario", async ({ page, isMobile }) => {
  await openLearner(page, "grade-6-7");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Portfolio", exact: true }).click();
  await expect(page.getByRole("heading", { name: "One basket or several?" })).toHaveCount(0);
  const deposit = page.getByRole("button", { name: "Save ₹50", exact: true });
  if (isMobile) await deposit.tap();
  else await deposit.click();
  await expect(page.getByTestId("jar-balance")).toHaveText("In the jar: ₹50");
  await expect(page.getByTestId("goal-progress")).toContainText("25% saved");
});
