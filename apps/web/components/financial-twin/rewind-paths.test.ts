import { describe, expect, it } from "vitest";
import {
  march2020Decisions,
  precomputedMarch2020Outcomes,
} from "../../../../packages/ui/src/fixtures/simulation-fixtures";
import { rewindPaths } from "./rewind-paths";

describe("Financial Twin rewind paths", () => {
  it.each(march2020Decisions)("can compare both alternatives after $id", (decision) => {
    const original = JSON.stringify(precomputedMarch2020Outcomes);
    const paths = rewindPaths(decision.id, march2020Decisions, precomputedMarch2020Outcomes);
    expect(paths?.chosenPath.decisionId).toBe(decision.id);
    expect(paths?.chosenPath.decisionLabel).toBe(decision.label);
    expect(paths?.alternatives).toHaveLength(2);
    expect(paths?.alternatives.every((alternative) => alternative.decisionId !== decision.id)).toBe(true);
    expect(JSON.stringify(precomputedMarch2020Outcomes)).toBe(original);
  });

  it("keeps authored metrics only for their original chosen path", () => {
    const reserve = rewindPaths("decision-emergency-reserve", march2020Decisions, precomputedMarch2020Outcomes);
    expect(reserve?.alternatives[0]?.comparisonMetrics?.length).toBeGreaterThan(0);
    const deposit = rewindPaths("decision-break-fd", march2020Decisions, precomputedMarch2020Outcomes);
    expect(deposit?.alternatives.every((alternative) => !alternative.comparisonMetrics)).toBe(true);
  });

  it("does not invent missing outcomes or accept mismatched decision identities", () => {
    expect(rewindPaths("unknown", march2020Decisions, precomputedMarch2020Outcomes)).toBeNull();
    expect(rewindPaths("decision-break-fd", march2020Decisions, {})).toBeNull();
    const reserveOutcome = precomputedMarch2020Outcomes["decision-emergency-reserve"];
    if (!reserveOutcome) throw new Error("Missing expected fixture");
    expect(rewindPaths("decision-break-fd", march2020Decisions, { "decision-break-fd": reserveOutcome })).toBeNull();
    const paths = rewindPaths("decision-emergency-reserve", march2020Decisions, {
      "decision-emergency-reserve": { ...reserveOutcome, alternativeOutcomes: undefined },
    });
    expect(paths?.alternatives).toEqual([]);
  });
});
