import type { LearnerProfile } from "@gullak/types";
import { describe, expect, it } from "vitest";
import type { Tables } from "./database.types";
import { learnerFromRow, learnerToRow, memoryLearners } from "./learners";

const id = "8f14e45f-ceea-467f-a0e6-1c2f1a3b4d5e";

const profile: LearnerProfile = {
  id,
  displayName: "Asha",
  ageBand: "college",
  experience: "none",
  locale: "hi",
  preferredFormats: ["story", "quiz"],
  goal: {
    id: "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
    label: "Bike",
    targetPaise: 8_000_000,
    targetDate: "2027-12-31",
    currentSavingsPaise: 500_000,
    createdAt: "2026-10-10T10:00:00+05:30",
  },
  createdAt: "2026-10-10T10:00:00+05:30",
};

const row: Tables<"learners"> = {
  id,
  display_name: null,
  age_band: "teen",
  experience: "some",
  locale: "te",
  preferred_formats: ["video"],
  goal: null,
  cohort_id: null,
  // Postgres returns timestamptz with microseconds and a +00:00 offset.
  created_at: "2026-10-10T04:30:00.123456+00:00",
};

describe("learner mappers", () => {
  it("round-trips a full profile through a row", () => {
    expect(learnerFromRow(learnerToRow(profile) as Tables<"learners">)).toEqual(profile);
  });

  it("maps snake_case columns and nulls to the schema", () => {
    expect(learnerFromRow(row)).toEqual({
      id,
      ageBand: "teen",
      experience: "some",
      locale: "te",
      preferredFormats: ["video"],
      createdAt: "2026-10-10T04:30:00.123456+00:00",
    });
  });

  it("rejects rows that break the schema", () => {
    expect(() => learnerFromRow({ ...row, age_band: "retired" })).toThrow();
    expect(() => learnerFromRow({ ...row, preferred_formats: [] })).toThrow();
    expect(() => learnerFromRow({ ...row, goal: { label: "no id or target" } })).toThrow();
  });

  it("refuses to write an invalid profile", () => {
    expect(() => learnerToRow({ ...profile, locale: "Hindi" })).toThrow();
  });
});

describe("memoryLearners", () => {
  it("saves and reads back a profile", async () => {
    const learners = memoryLearners();
    expect(await learners.get(id)).toBeNull();
    await learners.save(profile);
    expect(await learners.get(id)).toEqual(profile);
  });
});
