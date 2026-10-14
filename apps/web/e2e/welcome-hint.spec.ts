import { expect, test } from "@playwright/test";

const learnerId = "d7983cf9-97bd-4af8-817a-1936f32d8626";

test.use({ serviceWorkers: "block" });

test.beforeEach(async ({ page }) => {
  await page.addInitScript((id) => {
    if (!localStorage.getItem("gullak-onboarding-profile")) {
      localStorage.setItem(
        "gullak-onboarding-profile",
        JSON.stringify({
          id,
          gradeGroup: "grade-8-10",
          experience: "some",
          locale: "en",
          preferredFormats: ["story"],
          createdAt: "2026-10-11T00:00:00.000Z",
        }),
      );
    }
  }, learnerId);
});

test("Home welcomes learners on two app visits, never on Learn", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "New here?", exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("home-welcome.png"), fullPage: true });
  await page.getByRole("link", { name: "Learn", exact: true }).first().click();
  await expect(page).toHaveURL(/\/learn$/);
  await expect(page.getByRole("heading", { name: "New here?", exact: true })).toHaveCount(0);
  await page.getByRole("link", { name: "Home", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "New here?", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "New here?", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Around Nani’s lane" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "New here?", exact: true })).toHaveCount(0);
});

test("Got it persists while Me keeps the guide accessible", async ({ page }) => {
  await page.goto("/");
  const profile = await page.evaluate(() => localStorage.getItem("gullak-onboarding-profile"));
  const evidence = await page.evaluate(() => localStorage.getItem("gullak-learner-state"));
  await page.getByRole("button", { name: "Got it", exact: true }).click();
  await expect(page.getByRole("heading", { name: "New here?", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Start the level check", exact: true })).toBeFocused();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Around Nani’s lane" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "New here?", exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("gullak-onboarding-profile"))).toBe(profile);
  expect(await page.evaluate(() => localStorage.getItem("gullak-learner-state"))).toBe(evidence);
  await page.getByRole("link", { name: "Me", exact: true }).first().click();
  const guide = page.locator("main").getByRole("link", { name: "How Gullak works", exact: true });
  await expect(guide).toHaveCount(1);
  await guide.click();
  await expect(page.getByRole("heading", { name: "How Gullak works", exact: true })).toBeVisible();
});

test("shared-phone learners do not inherit another learner's dismissal", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Got it", exact: true }).click();
  await page.evaluate(() => {
    const profile = JSON.parse(localStorage.getItem("gullak-onboarding-profile") ?? "{}");
    localStorage.setItem(
      "gullak-onboarding-profile",
      JSON.stringify({ ...profile, id: "1e857b10-4e8d-440d-b943-f9b42244fce1" }),
    );
  });
  await page.reload();
  await expect(page.getByRole("heading", { name: "New here?", exact: true })).toBeVisible();
});

test("an earlier map dismissal is preserved without affecting a new learner", async ({ page }) => {
  await page.goto("/learn");
  await page.evaluate(() => localStorage.setItem("gullak-map-hint-seen", "1"));
  await page.getByRole("link", { name: "Home", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "Around Nani’s lane" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "New here?", exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("gullak-map-hint-seen"))).toBeNull();
  await page.evaluate(() => {
    const profile = JSON.parse(localStorage.getItem("gullak-onboarding-profile") ?? "{}");
    localStorage.setItem(
      "gullak-onboarding-profile",
      JSON.stringify({ ...profile, id: "1e857b10-4e8d-440d-b943-f9b42244fce1" }),
    );
  });
  await page.reload();
  await expect(page.getByRole("heading", { name: "New here?", exact: true })).toBeVisible();
});

test("blocked welcome storage still permits dismissal and navigation", async ({ page }) => {
  await page.addInitScript(() => {
    const get = Storage.prototype.getItem;
    const set = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) {
      if (key.startsWith("gullak-home-hint:")) throw new Error("Storage blocked");
      return get.call(this, key);
    };
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith("gullak-home-hint:")) throw new Error("Storage blocked");
      return set.call(this, key, value);
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Got it", exact: true }).click();
  await page.getByRole("link", { name: "Learn", exact: true }).first().click();
  await page.getByRole("link", { name: "Home", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "Around Nani’s lane" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "New here?", exact: true })).toHaveCount(0);
});

for (const [locale, title, dismiss] of [
  ["hi", "यहाँ नए हो?", "समझ गया"],
  ["te", "ఇక్కడ కొత్తా?", "అర్థమైంది"],
] as const) {
  test(`Home guide remains translated and dismissible in ${locale}`, async ({ page, context, baseURL }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await context.addCookies([{ name: "GULLAK_LOCALE", value: locale, url: baseURL ?? "http://localhost:3032" }]);
    await page.goto("/");
    await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: dismiss, exact: true }).click();
    await expect(page.getByRole("heading", { name: title, exact: true })).toHaveCount(0);
  });
}

test("changing language does not consume another app visit", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "New here?", exact: true })).toBeVisible();
  await page.getByRole("combobox", { name: "Choose language", exact: true }).selectOption("hi");
  await expect(page.getByRole("heading", { name: "यहाँ नए हो?", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "यहाँ नए हो?", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "समझ गया", exact: true })).toHaveCount(0);
});
