import { describe, expect, it } from "vitest";
import { Lesson, Stage, World } from "./index";

const world = { id: "candy-economy", lessonIds: ["money", "barter"] };
const lesson = {
  id: "barter",
  worldId: "candy-economy",
  stages: ["foundation-explorers", "money-navigators", "financial-strategists"],
  conceptIds: ["exchange", "double-coincidence"],
  previousLessonId: "money",
  checkPassMark: 0.6,
};

describe("draft world metadata", () => {
  it.each(["foundation-explorers", "money-navigators", "financial-strategists"])("accepts approved stage %s", (id) => {
    expect(Stage.parse(id)).toBe(id);
  });
  it.each(["grade-8-10", "grade-11-12", "beginner", null])("rejects non-stage %s", (id) => {
    expect(Stage.safeParse(id).success).toBe(false);
  });
  it("keeps authored lesson order and does not mutate a world", () => {
    expect(World.parse(world)).toEqual({ id: "candy-economy", lessonIds: ["money", "barter"] });
    expect(world.lessonIds).toEqual(["money", "barter"]);
  });
  it.each([
    { ...world, id: "Candy Economy" },
    { ...world, lessonIds: [] },
    { ...world, lessonIds: ["money", "money"] },
    { ...world, lessonIds: ["Money"] },
    { ...world, masteryUnlock: 0.95 },
  ])("rejects malformed world metadata", (input) => {
    expect(World.safeParse(input).success).toBe(false);
  });
  it("accepts a linked lesson and a root with no predecessor", () => {
    expect(Lesson.parse(lesson)).toEqual(lesson);
    expect(Lesson.parse({ ...lesson, id: "money", previousLessonId: null }).previousLessonId).toBeNull();
  });
  it.each([
    { ...lesson, id: "Money" },
    { ...lesson, worldId: "Candy" },
    { ...lesson, stages: [] },
    { ...lesson, stages: ["grade-8-10"] },
    { ...lesson, stages: ["money-navigators", "money-navigators"] },
    { ...lesson, conceptIds: [] },
    { ...lesson, conceptIds: ["exchange", "exchange"] },
    { ...lesson, previousLessonId: "barter" },
    { ...lesson, checkPassMark: -0.1 },
    { ...lesson, checkPassMark: 1.1 },
    { ...lesson, checkPassMark: Number.NaN },
    { ...lesson, unlockMastery: 0.95 },
    { ...lesson, xp: 500 },
  ])("rejects malformed lessons and unapproved gameplay fields", (input) => {
    expect(Lesson.safeParse(input).success).toBe(false);
  });
  it("requires an explicit quiz threshold and predecessor policy", () => {
    const { checkPassMark: _mark, previousLessonId: _previous, ...missing } = lesson;
    expect(Lesson.safeParse(missing).success).toBe(false);
  });
  it.each([0, 1])("accepts quiz threshold boundary %s without changing any unlock", (checkPassMark) => {
    expect(Lesson.parse({ ...lesson, checkPassMark }).checkPassMark).toBe(checkPassMark);
  });
});
