import { expect, type Page, test } from "@playwright/test";

// Market routes are mocked: e2e tests never call Yahoo Finance. The offline service worker
// would otherwise answer API requests itself and bypass these mocks.
test.use({ serviceWorkers: "block" });

const quote = {
  symbol: "TCS.NS",
  name: "Tata Consultancy Services Limited",
  exchange: "NSE",
  kind: "stock",
  price: 3000.5,
  previousClose: 2990,
  dayLow: 2980,
  dayHigh: 3010,
  week52Low: 2500,
  week52High: 4000,
  volume: 1234567,
  yearAgoPrice: 4000,
  currency: "INR",
  asOf: "2026-10-09T09:45:00.000Z",
  source: "yahoo-finance",
};

const fundQuote = {
  ...quote,
  symbol: "0P0000XVLA.BO",
  name: "Example Liquid Dir Gr",
  exchange: "BSE",
  kind: "mutual-fund",
  price: 4100.25,
};

async function openLearner(page: Page, passedTopics: string[]) {
  await page.addInitScript((passed) => {
    window.localStorage.setItem(
      "gullak-onboarding-profile",
      JSON.stringify({
        id: "d7983cf9-97bd-4af8-817a-1936f32d8626",
        gradeGroup: "grade-8-10",
        experience: "some",
        locale: "en",
        preferredFormats: ["simulation"],
        createdAt: "2026-10-11T00:00:00.000Z",
      }),
    );
    if (!window.localStorage.getItem("gullak-learner-state"))
      window.localStorage.setItem(
        "gullak-learner-state",
        JSON.stringify({ passedTopics: passed, quizAttempts: [], mastery: {}, practiceCashPaise: 0, activities: [] }),
      );
  }, passedTopics);
  await page.route("**/api/market/search?*", (route) =>
    route.fulfill({
      json: {
        data: {
          results: new URL(route.request().url()).searchParams.get("category")
            ? [{ symbol: "0P0000XVLA.BO", name: "Example Liquid Dir Gr", exchange: "BSE", kind: "mutual-fund" }]
            : [{ symbol: quote.symbol, name: quote.name, exchange: "NSE", kind: "stock" }],
        },
      },
    }),
  );
  await page.route("**/api/market/live/*", (route) =>
    route.fulfill({ json: { data: { quote: route.request().url().includes("0P0000XVLA") ? fundQuote : quote } } }),
  );
}

test("a locked stock explains which lesson opens it", async ({ page }) => {
  await openLearner(page, []);
  await page.goto("/portfolio");
  await page.getByRole("link", { name: "Buy", exact: true }).click();
  await expect(page).toHaveURL(/\/portfolio\/invest$/);
  await page.getByLabel("Search Indian stocks, ETFs, mutual funds and indices").fill("tcs");
  await page.getByRole("link", { name: /Tata Consultancy Services Limited/ }).click();
  await expect(page.getByRole("heading", { name: "Not unlocked yet" })).toBeVisible();
  await expect(page.getByText("₹3,000.50")).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to the lesson" })).toHaveAttribute("href", "/learn/stocks");
  await expect(page.getByRole("link", { name: /^Learn: / })).toHaveAttribute("href", "/learn/stocks");
  await expect(page.getByRole("button", { name: "Buy with play money" })).toHaveCount(0);
  // Locked listings still show their numbers, each with a plain-language explanation.
  await expect(page.getByText("₹2,500.00 – ₹4,000.00")).toBeVisible();
  await expect(page.getByText("-25%")).toBeVisible();
  await page.getByRole("button", { name: "What is 52-week range?" }).click();
  await expect(page.getByText("The lowest and highest prices in the past year.", { exact: false })).toBeVisible();
});

test("a fund category lists its funds without typing", async ({ page, isMobile }) => {
  await openLearner(page, []);
  await page.goto("/portfolio/invest");
  if (isMobile) await page.getByRole("combobox", { name: "Category" }).selectOption("liquid");
  else {
    // Fund groups start closed and open on click.
    const debt = page.getByRole("button", { name: "Debt", exact: true });
    await expect(debt).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("button", { name: "Liquid fund", exact: true })).toBeHidden();
    await debt.click();
    await page.getByRole("button", { name: "Liquid fund", exact: true }).click();
  }
  await page.getByRole("link", { name: /Example Liquid Dir Gr/ }).click();
  // The fund's page teaches its exact category, locked or not.
  await expect(page.getByText("Category: Liquid fund")).toBeVisible();
  await expect(page.getByRole("link", { name: /^Learn: / })).toHaveAttribute("href", "/learn/money-market");
});

test("stocks sit above the fund categories and list without typing", async ({ page, isMobile }) => {
  await openLearner(page, []);
  await page.unroute("**/api/market/search?*");
  await page.goto("/portfolio/invest");
  if (isMobile) await page.getByRole("combobox", { name: "Category" }).selectOption("stocks");
  else await page.getByRole("button", { name: "Stocks", exact: true }).click();
  await expect(page.getByRole("link", { name: /Reliance Industries/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Infosys/ })).toBeVisible();
});

test("after the lesson, buy with play money and sell from the holding", async ({ page }) => {
  await openLearner(page, ["stocks"]);
  await page.goto("/portfolio/invest/TCS.NS");
  await page.getByLabel("How many units?").fill("2");
  await expect(page.getByText("Costs about ₹6,001.00")).toBeVisible();
  await page.getByRole("button", { name: "Buy with play money" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Bought 2 units for ₹6,001.00 of play money." }),
  ).toBeVisible();
  await page.getByLabel("How many units?").fill("1");
  await page.getByRole("button", { name: "Buy with play money" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Not enough play money for that." })).toBeVisible();

  await page.goto("/portfolio");
  await page.getByRole("link", { name: "Sell Tata Consultancy Services Limited" }).first().click();
  await expect(page.getByRole("button", { name: "Sell", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Sell all" }).click();
  await page.getByRole("button", { name: "Sell for play money" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Sold 2 units for ₹6,001.00 of play money." })).toBeVisible();
  await page.goto("/portfolio/invest");
  await expect(page.getByText("You don't hold anything yet.")).toBeVisible();
});
