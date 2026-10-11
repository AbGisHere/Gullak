import { describe, expect, it } from "vitest";
import { episodeToSimulation } from "./practice-adapter";

describe("episodeToSimulation", () => {
  it("uses the authored March episode and hospital event in the UI contract", () => {
    const { episode, state } = episodeToSimulation();
    expect(episode.episodeId).toBe("march-2020-hospital-bill");
    expect(episode.learningGoals[0]).toContain("accessible savings");
    expect(state.currentEvent?.id).toBe("hospital-bill");
    expect(state.currentEvent?.amountPaise).toBe(1_500_000);
    expect(state.protagonist.label).toBe("Asha");
    expect(state.protagonist.dialogue).toBeUndefined();
  });
});
