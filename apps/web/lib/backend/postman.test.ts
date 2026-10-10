import { readFileSync } from "node:fs";
import {
  FdInvestmentRequest,
  GoalPlanRequest,
  LessonProgressRequest,
  OnboardingRequest,
  QuizSubmission,
  ReplayRequest,
  SaveLearningBookmarkRequest,
  StartLearningRunRequest,
} from "@gullak/types";
import { describe, expect, it } from "vitest";
import { z } from "zod";

const RequestFixture = z.object({
  name: z.string(),
  request: z.object({ url: z.string(), body: z.object({ raw: z.string() }).optional() }).optional(),
  item: z.array(z.unknown()).optional(),
});
const collection = z
  .object({ item: z.array(z.unknown()) })
  .parse(JSON.parse(readFileSync(new URL("../../../../docs/gullak-backend.postman.json", import.meta.url), "utf8")));
describe("Postman request compatibility", () => {
  it("keeps onboarding, quizzes and progress examples compatible with current strict contracts", () => {
    let checked = 0;
    const visit = (items: unknown[]) => {
      for (const raw of items) {
        const item = RequestFixture.parse(raw);
        if (item.item) visit(item.item);
        if (!item.request?.body) continue;
        const url = item.request.url;
        const schema = url.endsWith("/onboarding")
          ? OnboardingRequest
          : url.endsWith("/quiz")
            ? QuizSubmission
            : url.endsWith("/progress")
              ? LessonProgressRequest
              : url.endsWith("/portfolio/fd")
                ? FdInvestmentRequest
                : url.endsWith("/goals/plan")
                  ? GoalPlanRequest
                  : url.endsWith("/time-machine")
                    ? ReplayRequest
                    : url.endsWith("/bookmark")
                      ? SaveLearningBookmarkRequest
                      : url.endsWith("/runs")
                        ? StartLearningRunRequest
                        : null;
        if (!schema) continue;
        const body: unknown = JSON.parse(item.request.body.raw);
        expect(schema.safeParse(body).success, item.name).toBe(!item.name.startsWith("Reject"));
        checked++;
      }
    };
    visit(collection.item);
    expect(checked).toBeGreaterThan(10);
  });
});
