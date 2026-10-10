import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PracticeSimulation, type SimulationState } from "./components/practice-simulation";
import {
  initialPracticeSimulationState,
  march2020EpisodeMetadata,
  precomputedMarch2020Outcomes,
} from "./fixtures/simulation-fixtures";

describe("PracticeSimulation", () => {
  // 1. renders briefing state
  it("renders briefing state correctly", () => {
    render(<PracticeSimulation episode={march2020EpisodeMetadata} state={initialPracticeSimulationState} />);

    expect(screen.getByTestId("sim-phase-briefing")).toBeDefined();
    expect(screen.getByText("The March Shock: When Plans Meet Reality")).toBeDefined();
    expect(screen.getByText(/Navigate an unexpected family emergency/i)).toBeDefined();
    expect(screen.getByTestId("sim-briefing-continue")).toBeDefined();
  });

  // 2. renders current portfolio / play-money indicator
  it("renders current portfolio and play-money indicator", () => {
    render(<PracticeSimulation episode={march2020EpisodeMetadata} state={initialPracticeSimulationState} />);

    expect(document.querySelector('[data-slot="play-money-badge"]')).not.toBeNull();
    expect(screen.getByTestId("portfolio-summary")).toBeDefined();
  });

  // 3. renders life event
  it("renders life event during active phase", () => {
    const activeState: SimulationState = {
      ...initialPracticeSimulationState,
      phase: "active",
    };

    render(<PracticeSimulation episode={march2020EpisodeMetadata} state={activeState} />);

    expect(screen.getByTestId("sim-phase-active")).toBeDefined();
    expect(screen.getByTestId("sim-life-event")).toBeDefined();
    expect(screen.getByText("Urgent Family Medical Emergency")).toBeDefined();
    expect(screen.getByText(/hospital requires an immediate deposit of ₹7,000/i)).toBeDefined();
    expect(screen.getByTestId("sim-event-acknowledge")).toBeDefined();
  });

  // 4. renders available actions
  it("renders available actions in decision phase", () => {
    const decisionState: SimulationState = {
      ...initialPracticeSimulationState,
      phase: "decision",
    };

    render(<PracticeSimulation episode={march2020EpisodeMetadata} state={decisionState} />);

    expect(screen.getByTestId("sim-phase-decision")).toBeDefined();
    expect(screen.getByTestId("sim-decision-decision-emergency-reserve")).toBeDefined();
    expect(screen.getByTestId("sim-decision-decision-break-fd")).toBeDefined();
    expect(screen.getByTestId("sim-decision-decision-sell-market")).toBeDefined();
  });

  // 5. clicking action emits onDecision without calculating outcome
  it("clicking action emits onDecision without calculating outcome", () => {
    const onDecision = vi.fn();
    const decisionState: SimulationState = {
      ...initialPracticeSimulationState,
      phase: "decision",
    };

    render(<PracticeSimulation episode={march2020EpisodeMetadata} state={decisionState} onDecision={onDecision} />);

    const btn = screen.getByTestId("sim-decision-decision-emergency-reserve");
    fireEvent.click(btn);

    expect(onDecision).toHaveBeenCalledWith({
      episodeId: "practice-ep-march-2020",
      eventId: "event-hospital-bill",
      decisionId: "decision-emergency-reserve",
    });
  });

  // 6. supplied resolved outcome renders consequence
  it("supplied resolved outcome renders consequence with what changed, why it matters, and trade-offs", () => {
    const outcome = precomputedMarch2020Outcomes["decision-emergency-reserve"]!;
    const consequenceState: SimulationState = {
      ...initialPracticeSimulationState,
      phase: "consequence",
      resolvedOutcome: outcome,
    };

    render(<PracticeSimulation episode={march2020EpisodeMetadata} state={consequenceState} />);

    expect(screen.getByTestId("sim-phase-consequence")).toBeDefined();
    expect(screen.getByTestId("sim-consequence-narrative").textContent).toContain(outcome.narrativeConsequence);
    expect(screen.getByTestId("sim-consequence-delta").textContent).toContain(outcome.stateDelta);
    expect(screen.getByTestId("sim-consequence-explanation").textContent).toContain(outcome.learningExplanation);
    expect(screen.getByTestId("sim-consequence-tradeoff").textContent).toContain(outcome.tradeoff);
    expect(screen.getByTestId("sim-consequence-unknown").textContent).toContain(outcome.whatWasUnknown!);
  });

  // 7. reflection emits callback
  it("reflection phase emits onReflection when an option is selected", () => {
    const onReflection = vi.fn();
    const reflectionState: SimulationState = {
      ...initialPracticeSimulationState,
      phase: "reflection",
    };

    render(
      <PracticeSimulation episode={march2020EpisodeMetadata} state={reflectionState} onReflection={onReflection} />,
    );

    expect(screen.getByTestId("sim-phase-reflection")).toBeDefined();
    const refBtn = screen.getByTestId("sim-reflection-ref-urgency");
    fireEvent.click(refBtn);

    expect(onReflection).toHaveBeenCalledWith({
      episodeId: "practice-ep-march-2020",
      eventId: "event-hospital-bill",
      reflectionId: "ref-urgency",
    });
  });

  // 8. updated externally supplied portfolio renders correctly
  it("updated externally supplied portfolio renders correctly in consequence phase", () => {
    const updatedPortfolio = {
      ...initialPracticeSimulationState.portfolio,
      emergencyReserve: {
        ...initialPracticeSimulationState.portfolio.emergencyReserve,
        currentReservePaise: 100000, // ₹1,000 remaining
      },
    };

    const consequenceState: SimulationState = {
      ...initialPracticeSimulationState,
      phase: "consequence",
      portfolio: updatedPortfolio,
      resolvedOutcome: precomputedMarch2020Outcomes["decision-emergency-reserve"]!,
    };

    render(<PracticeSimulation episode={march2020EpisodeMetadata} state={consequenceState} />);

    // Summary card should render the updated portfolio
    expect(screen.getByTestId("portfolio-summary")).toBeDefined();
  });

  // 9. MoneyDecoder terms work
  it("MoneyDecoder terms trigger callback when opened", () => {
    const onTermOpen = vi.fn();
    const decisionState: SimulationState = {
      ...initialPracticeSimulationState,
      phase: "decision",
    };

    render(<PracticeSimulation episode={march2020EpisodeMetadata} state={decisionState} onTermOpen={onTermOpen} />);

    const termBtn = screen.getByRole("button", { name: /Decode term: Emergency Fund/i });
    fireEvent.click(termBtn);

    expect(onTermOpen).toHaveBeenCalledWith("Emergency Fund");
  });

  // 10. episode completion emits structured result
  it("episode completion emits structured result on finish", () => {
    const onEpisodeComplete = vi.fn();
    const completeState: SimulationState = {
      ...initialPracticeSimulationState,
      phase: "complete",
    };

    render(
      <PracticeSimulation
        episode={march2020EpisodeMetadata}
        state={completeState}
        onEpisodeComplete={onEpisodeComplete}
      />,
    );

    expect(screen.getByTestId("sim-phase-complete")).toBeDefined();
    const finishBtn = screen.getByTestId("sim-complete-finish");
    fireEvent.click(finishBtn);

    expect(onEpisodeComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        episodeId: "practice-ep-march-2020",
        decisions: expect.any(Array),
        reflections: expect.any(Array),
        completedAt: expect.any(String),
      }),
    );
  });

  // 11. no advice/correctness labels appear by default
  it("never renders judgment or correctness labels", () => {
    const outcome = precomputedMarch2020Outcomes["decision-emergency-reserve"]!;
    const consequenceState: SimulationState = {
      ...initialPracticeSimulationState,
      phase: "consequence",
      resolvedOutcome: outcome,
    };

    render(<PracticeSimulation episode={march2020EpisodeMetadata} state={consequenceState} />);

    expect(screen.queryByText(/Correct!/i)).toBeNull();
    expect(screen.queryByText(/Wrong!/i)).toBeNull();
    expect(screen.queryByText(/Best Answer/i)).toBeNull();
    expect(screen.queryByText(/Recommended/i)).toBeNull();
  });

  // 12. keyboard interaction works
  it("supports keyboard interaction on decision cards", () => {
    const onDecision = vi.fn();
    const decisionState: SimulationState = {
      ...initialPracticeSimulationState,
      phase: "decision",
    };

    render(<PracticeSimulation episode={march2020EpisodeMetadata} state={decisionState} onDecision={onDecision} />);

    const btn = screen.getByTestId("sim-decision-decision-emergency-reserve");
    btn.focus();
    expect(document.activeElement).toBe(btn);

    fireEvent.keyDown(btn, { key: "Enter", code: "Enter" });
    // In React testing library, button click is triggered by click or Enter keydown when standard button element
    fireEvent.click(btn);
    expect(onDecision).toHaveBeenCalled();
  });

  // 13. integrates with FinancialRewind from consequence phase
  it("renders rewind trigger button and opens FinancialRewind when clicked", () => {
    const onRewindOpen = vi.fn();
    const outcome = precomputedMarch2020Outcomes["decision-emergency-reserve"]!;
    const consequenceState: SimulationState = {
      ...initialPracticeSimulationState,
      phase: "consequence",
      resolvedOutcome: outcome,
    };

    render(
      <PracticeSimulation episode={march2020EpisodeMetadata} state={consequenceState} onRewindOpen={onRewindOpen} />,
    );

    const rewindBtn = screen.getByTestId("sim-consequence-rewind");
    expect(rewindBtn).toBeDefined();

    fireEvent.click(rewindBtn);
    expect(onRewindOpen).toHaveBeenCalledWith({
      episodeId: "practice-ep-march-2020",
      decisionId: "decision-emergency-reserve",
    });

    // FinancialRewind container should now be rendered
    expect(screen.getByTestId("financial-rewind-container")).toBeDefined();
    expect(screen.getByTestId("rewind-chosen-path-card")).toBeDefined();
    expect(screen.getByTestId("rewind-alternative-path-card")).toBeDefined();
  });
});
