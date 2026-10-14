import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
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
});

test("back from Nani's story returns home without changing learner data", async ({ page }, testInfo) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "gullak-learner-state",
      JSON.stringify({
        passedTopics: ["money-basics"],
        quizAttempts: [{ topicId: "money-basics", score: 1, at: "2026-10-11T00:00:00.000Z" }],
        mastery: { "money-in": 0.8, "money-out": 0.7 },
        practiceCashPaise: 100000,
      }),
    ),
  );
  await page.goto("/");
  await page.getByRole("button", { name: /^Continue Nani’s story/ }).click();
  await expect(page.getByRole("heading", { name: "Come in. Nani’s waiting." })).toBeVisible();
  const saved = await page.evaluate(() => localStorage.getItem("gullak-learner-state"));
  expect(JSON.parse(saved ?? "{}").passedTopics).toContain("money-basics");
  const back = page.getByTestId("app-back");
  await expect(back).toBeVisible();
  expect((await back.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("story-back.png"), fullPage: true });
  await back.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Around Nani’s lane" })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("gullak-learner-state"))).toBe(saved);
  await expect(page.getByTestId("app-back")).toHaveCount(0);
});

test("routed back restores the home section that opened it", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /^Continue Nani’s story/ }).click();
  await page.getByRole("link", { name: "How Gullak works", exact: true }).first().click();
  await expect(page).toHaveURL(/\/help$/);
  await page.getByTestId("app-back").click();
  await expect(page.getByRole("heading", { name: "Come in. Nani’s waiting." })).toBeVisible();
  await page.getByTestId("app-back").click();
  await expect(page.getByRole("heading", { name: "Around Nani’s lane" })).toBeVisible();
});

test("back exits an opened level check without marking it taken", async ({ page }) => {
  await page.goto("/");
  const saved = await page.evaluate(() => localStorage.getItem("gullak-learner-state"));
  await page.getByRole("button", { name: "Start the level check", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Find your level", exact: true })).toBeVisible();
  await expect(page.getByTestId("app-back")).toBeVisible();
  await page.getByTestId("app-back").click();
  await expect(page.getByRole("heading", { name: "Around Nani’s lane" })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("gullak-learner-state"))).toBe(saved);
});

test("directly opened learner pages fall back to home, not an external site", async ({ page }) => {
  await page.route("https://outside.example/**", (route) =>
    route.fulfill({ contentType: "text/html", body: "Outside Gullak" }),
  );
  await page.goto("https://outside.example/");
  await page.goto("/me");
  await expect(page.getByRole("heading", { name: "Learner profile" })).toBeVisible();
  await page.getByTestId("app-back").click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "Around Nani’s lane" })).toBeVisible();
});

test("story-step back stays within the story while app back leaves it", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /^Continue Nani’s story/ }).click();
  await page.getByRole("button", { name: "Meet the household" }).click();
  await expect(page.getByRole("heading", { name: "Everyone has a plan." })).toBeVisible();
  await page.locator("main").getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Come in. Nani’s waiting." })).toBeVisible();
  await page.getByTestId("app-back").click();
  await expect(page.getByRole("heading", { name: "Around Nani’s lane" })).toBeVisible();
});

test("browser back and forward keep app back usable without a return loop", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Me", exact: true }).first().click();
  await expect(page).toHaveURL(/\/me$/);
  await page.goBack();
  await expect(page.getByTestId("app-back")).toHaveCount(0);
  await page.goForward();
  await expect(page).toHaveURL(/\/me$/);
  await page.getByTestId("app-back").click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId("app-back")).toHaveCount(0);
});

test("skipping browser entries cannot send app back outside Gullak", async ({ page }) => {
  await page.route("https://outside.example/**", (route) =>
    route.fulfill({ contentType: "text/html", body: "Outside Gullak" }),
  );
  await page.goto("https://outside.example/");
  await page.goto("/");
  await page.getByRole("link", { name: "Me", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "Learner profile" })).toBeVisible();
  await page.getByRole("link", { name: "How Gullak works", exact: true }).first().click();
  await expect(page).toHaveURL(/\/help$/);
  await expect(page.getByRole("heading", { name: "How Gullak works", exact: true })).toBeVisible();
  await page.evaluate(() => history.go(-2));
  await expect(page.getByRole("heading", { name: "Around Nani’s lane" })).toBeVisible();
  await expect(page.getByTestId("app-back")).toHaveCount(0);
});

test("native traversal between repeated Home visits clears skipped return screens", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Me", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "Learner profile" })).toBeVisible();
  await page.getByRole("link", { name: "Home", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "Around Nani’s lane" })).toBeVisible();
  await expect(page.getByTestId("app-back")).toBeVisible();
  await page.evaluate(() => history.go(-2));
  await expect(page.getByTestId("app-back")).toHaveCount(0);
});

test("redirected onboarding starts a fresh in-app return history", async ({ context }) => {
  // A new page has no profile-injection script, so the route really redirects.
  const page = await context.newPage();
  await page.goto("/me");
  await expect(page.getByRole("heading", { name: "Learn money by doing, with play money." })).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Class 8–10" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Skip" }).click();
  await page.getByRole("button", { name: "Skip" }).click();
  await page.getByRole("button", { name: "Start learning" }).click();
  await expect(page.getByRole("heading", { name: "Find your level", exact: true })).toBeVisible();
  await page.getByTestId("app-back").click();
  await expect(page.getByRole("heading", { name: "Around Nani’s lane" })).toBeVisible();
  await expect(page.getByTestId("app-back")).toHaveCount(0);
  await page.close();
});

for (const [locale, label] of [
  ["en", "Back"],
  ["hi", "वापस"],
  ["te", "వెనక్కి"],
]) {
  test(`back has a translated label in ${locale}`, async ({ page, context, baseURL }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await context.addCookies([{ name: "GULLAK_LOCALE", value: locale ?? "", url: baseURL ?? "http://localhost:3032" }]);
    await page.goto("/me");
    await expect(page.getByTestId("app-back")).toHaveAccessibleName(label ?? "");
    await expect(page.locator("main input").first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    const backBox = await page.getByTestId("app-back").boundingBox();
    const helpBox = await page.locator("header a[href='/help']").boundingBox();
    expect(backBox).not.toBeNull();
    expect(helpBox).not.toBeNull();
    expect((backBox?.x ?? 0) + (backBox?.width ?? 0)).toBeLessThanOrEqual(helpBox?.x ?? 0);
    const logoBox = await page.locator("header a[href='/']").first().boundingBox();
    if (logoBox) expect(logoBox.x + logoBox.width).toBeLessThanOrEqual(helpBox?.x ?? 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`${locale}-320.png`), fullPage: true });
    await page.getByTestId("app-back").click();
    await expect(page).toHaveURL(/\/$/);
  });
}

test("back follows routed navigation and preserves the lesson's map link", async ({ page }) => {
  await page.goto("/learn");
  await page.getByRole("link", { name: "Start lesson", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "Quick check" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to Learn" })).toBeVisible();
  await page.getByTestId("app-back").click();
  await expect(page).toHaveURL(/\/learn$/);
  await page.getByTestId("app-back").click();
  await expect(page).toHaveURL(/\/$/);
});
