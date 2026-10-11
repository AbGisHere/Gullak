import { expect, test } from "@playwright/test";
import en from "../../messages/en.json" with { type: "json" };
import hi from "../../messages/hi.json" with { type: "json" };
import te from "../../messages/te.json" with { type: "json" };
import { HOUSEHOLD_DECISIONS, STORY_STAGES } from "./household-fixture";

for (const width of [320, 390, 430, 1440]) {
  test(`complete story, decisions and rewind at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(() =>
      localStorage.setItem(
        "gullak-onboarding-profile",
        JSON.stringify({
          id: "11111111-1111-4111-8111-111111111111",
          gradeGroup: "grade-8-10",
          experience: "some",
          locale: "en",
          preferredFormats: ["story"],
          createdAt: "2026-10-11T00:00:00.000Z",
        }),
      ),
    );
    await page.goto("/");
    await page
      .getByRole("button", { name: new RegExp(`^${en.nav.twin}`) })
      .filter({ visible: true })
      .click();
    const journey = page.getByTestId("financial-twin-journey");
    const footer = journey.locator("footer");
    const forward = () => footer.getByRole("button").last().click();
    const back = () => footer.getByRole("button", { name: en.onboarding.back, exact: true }).click();
    const capture = async (stage: string) => {
      if (width !== 390 && width !== 1440) return;
      await journey
        .locator("img")
        .evaluateAll(async (images) =>
          Promise.all(images.map((image) => (image instanceof HTMLImageElement ? image.decode() : Promise.resolve()))),
        );
      await page.evaluate(async () => {
        await document.fonts.ready;
        scrollTo(0, 0);
        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      });
      await page.screenshot({
        path: test.info().outputPath(`${width}-${stage}.png`),
        fullPage: true,
        animations: "disabled",
      });
      if (width === 390 && ["arrive", "reflection"].includes(stage)) {
        const action = footer.getByRole("button").last();
        await action.evaluate((button) => button.scrollIntoView({ block: "center" }));
        expect(
          await action.evaluate((button) => {
            const r = button.getBoundingClientRect();
            return button.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
          }),
        ).toBe(true);
        await page.screenshot({
          path: test.info().outputPath(`${width}-${stage}-controls.png`),
          animations: "disabled",
        });
      }
    };
    for (const stage of STORY_STAGES) {
      await expect(journey.locator(`[data-stage="${stage}"]`)).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const smallButtons = await journey
        .locator("button")
        .evaluateAll((buttons) => buttons.filter((button) => button.getBoundingClientRect().height < 44).length);
      expect(smallButtons).toBe(0);
      if (stage === "household") {
        for (const name of ["Amma", "Gullu", "Nani"]) {
          const button = journey.getByRole("button", { name, exact: true });
          await button.click();
          await expect(button).toHaveAttribute("aria-pressed", "true");
        }
      }
      if (stage === "decision") {
        await capture(stage);
        await journey.getByTestId("twin-decision-emergency").click();
      }
      if (stage === "rewind") {
        for (const id of ["fd", "market"]) {
          await journey.getByTestId(`rewind-tab-${id}`).click();
          await expect(journey.getByTestId(`rewind-tab-${id}`)).toHaveAttribute("aria-selected", "true");
        }
        await journey.getByTestId("rewind-toggle-compare-btn").click();
        await expect(journey.getByTestId("rewind-chosen-path-card")).toContainText(
          en.twin.story.choices.emergency.label,
        );
        await journey.getByTestId("rewind-return-chosen-btn").click();
        await expect(journey.locator('[data-stage="consequence"]')).toBeVisible();
        await forward();
        await journey.getByTestId("rewind-toggle-compare-btn").click();
      }
      if (stage === "reflection") {
        await expect(footer.getByRole("button").last()).toBeDisabled();
        await journey.locator("fieldset button").first().click();
        await expect(journey).toContainText(en.twin.story.takeHome);
      }
      if (stage !== "decision") await capture(stage);
      if (stage !== "decision" && stage !== "reflection") await forward();
    }
    for (let index = 6; index > 0; index--) {
      await back();
      await expect(journey.locator(`[data-stage="${STORY_STAGES[index - 1]}"]`)).toBeVisible();
    }
    // Replay every other actual choice; alternatives must never repeat it.
    for (const selected of HOUSEHOLD_DECISIONS) {
      for (let index = 0; index < 3; index++) await forward();
      await journey.getByTestId(`twin-decision-${selected}`).click();
      await expect(journey).toContainText(en.twin.story.choices[selected].consequence);
      await forward();
      await expect(journey.getByTestId(`rewind-tab-${selected}`)).toHaveCount(0);
      for (const alternative of HOUSEHOLD_DECISIONS.filter((id) => id !== selected)) {
        await journey.getByTestId(`rewind-tab-${alternative}`).click();
        await expect(journey.getByTestId("rewind-chosen-path-card")).toContainText(
          en.twin.story.choices[selected].label,
        );
      }
      for (let index = 5; index > 0; index--) await back();
    }
    await forward();
    await forward();
    await forward();
    await journey.getByTestId("twin-decision-emergency").click();
    await forward();
    await forward();
    await journey.locator("fieldset button").first().click();
    await forward();
    await expect(journey.locator('[data-stage="arrive"]')).toBeVisible();
    expect(errors).toEqual([]);
  });
}

for (const [locale, messages] of Object.entries({ hi, te })) {
  test(`translated journey (${locale})`, async ({ page, context }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await context.addCookies([{ name: "GULLAK_LOCALE", value: locale, domain: "localhost", path: "/" }]);
    await page.addInitScript(() =>
      localStorage.setItem(
        "gullak-onboarding-profile",
        JSON.stringify({
          id: "11111111-1111-4111-8111-111111111111",
          gradeGroup: "grade-8-10",
          experience: "some",
          locale: "en",
          preferredFormats: ["story"],
          createdAt: "2026-10-11T00:00:00.000Z",
        }),
      ),
    );
    await page.goto("/");
    await page
      .getByRole("button", { name: new RegExp(`^${messages.nav.twin}`) })
      .filter({ visible: true })
      .click();
    const journey = page.getByTestId("financial-twin-journey");
    for (const stage of STORY_STAGES) {
      await expect(journey.locator(`[data-stage="${stage}"]`)).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (stage === "decision") await journey.getByTestId("twin-decision-fd").click();
      else if (stage !== "reflection") await journey.locator("footer button").last().click();
      else await journey.locator("fieldset button").first().click();
    }
    await expect(journey).toContainText(messages.twin.story.takeHome);
    await expect(journey).not.toContainText("twin.story.");
  });
}
