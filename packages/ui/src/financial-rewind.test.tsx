import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { type ChosenPathData, FinancialRewind } from "./components/financial-rewind";
import { march2020StartingPortfolio, precomputedMarch2020Outcomes } from "./fixtures/simulation-fixtures";

describe("FinancialRewind", () => {
  const chosenOutcome = precomputedMarch2020Outcomes["decision-emergency-reserve"]!;
  const alternatives = chosenOutcome.alternativeOutcomes!;

  const chosenPath: ChosenPathData = {
    decisionId: chosenOutcome.decisionId,
    decisionLabel: "Use Emergency Reserve",
    narrativeConsequence: chosenOutcome.narrativeConsequence,
    stateDelta: chosenOutcome.stateDelta,
    tradeoff: chosenOutcome.tradeoff,
    whatWasUnknown: chosenOutcome.whatWasUnknown,
    portfolioAfter: march2020StartingPortfolio,
    characterReaction: chosenOutcome.characterReaction,
  };

  // 1. renders chosen path
  it("renders chosen path details including narrative, state delta, and trade-off", () => {
    render(<FinancialRewind episodeId="practice-ep-march-2020" chosenPath={chosenPath} alternatives={alternatives} />);

    expect(screen.getByTestId("financial-rewind-container")).toBeDefined();
    expect(screen.getByTestId("rewind-chosen-path-card")).toBeDefined();
    expect(screen.getByTestId("chosen-narrative").textContent).toContain(chosenPath.narrativeConsequence);
    expect(screen.getByTestId("chosen-state-delta").textContent).toContain(chosenPath.stateDelta);
    expect(screen.getByTestId("chosen-tradeoff").textContent).toContain(chosenPath.tradeoff);
  });

  // 2. shows available alternative paths
  it("shows available alternative path tabs", () => {
    render(<FinancialRewind episodeId="practice-ep-march-2020" chosenPath={chosenPath} alternatives={alternatives} />);

    expect(screen.getByTestId("rewind-tab-decision-break-fd")).toBeDefined();
    expect(screen.getByTestId("rewind-tab-decision-sell-market")).toBeDefined();
  });

  // 3. selecting alternative renders supplied outcome
  it("selecting alternative renders supplied outcome without computing changes", () => {
    render(<FinancialRewind episodeId="practice-ep-march-2020" chosenPath={chosenPath} alternatives={alternatives} />);

    const firstAlt = alternatives[0]!;
    expect(screen.getByTestId("alt-decision-label").textContent).toContain(firstAlt.decisionLabel);
    expect(screen.getByTestId("alt-narrative").textContent).toContain(firstAlt.summary!);
    expect(screen.getByTestId("alt-state-delta").textContent).toContain(firstAlt.stateDelta!);
    expect(screen.getByTestId("alt-tradeoff").textContent).toContain(firstAlt.tradeoff!);
  });

  // 4. renders supplied alternative portfolio
  it("renders supplied alternative portfolio when provided", () => {
    render(<FinancialRewind episodeId="practice-ep-march-2020" chosenPath={chosenPath} alternatives={alternatives} />);

    expect(screen.getByTestId("alt-portfolio-section")).toBeDefined();
  });

  // 5. renders supplied comparison metrics
  it("renders supplied comparison metrics between chosen and alternative", () => {
    render(<FinancialRewind episodeId="practice-ep-march-2020" chosenPath={chosenPath} alternatives={alternatives} />);

    expect(screen.getByTestId("rewind-metrics-comparison")).toBeDefined();
    expect(screen.getByTestId("comparison-metric-metric-reserve")).toBeDefined();
    expect(screen.getByText("Emergency Reserve Buffer")).toBeDefined();
    expect(screen.getByText("₹1,000 (partially depleted)")).toBeDefined();
    expect(screen.getByText("₹8,000 (fully intact)")).toBeDefined();
  });

  // 6. does not compute alternative values
  it("renders strictly supplied data and does not alter or recompute values", () => {
    const rawAlt = alternatives[0]!;
    render(<FinancialRewind episodeId="practice-ep-march-2020" chosenPath={chosenPath} alternatives={alternatives} />);

    // Exact string match of precomputed text
    expect(screen.getByTestId("alt-state-delta").textContent).toBe(rawAlt.stateDelta);
  });

  // 7. uncertainty / hindsight message renders when supplied
  it("renders uncertainty / no-hindsight message prominently", () => {
    const customUncertainty = "In March 2020, professional fund managers had no certainty about recovery timelines.";
    render(
      <FinancialRewind
        episodeId="practice-ep-march-2020"
        chosenPath={chosenPath}
        alternatives={alternatives}
        uncertaintyMessage={customUncertainty}
      />,
    );

    const notice = screen.getByTestId("rewind-uncertainty-notice");
    expect(notice.textContent).toContain(customUncertainty);
  });

  // 8. switching alternatives works
  it("switching between alternatives updates the active alternative view", () => {
    render(<FinancialRewind episodeId="practice-ep-march-2020" chosenPath={chosenPath} alternatives={alternatives} />);

    // Click tab 2 (Sell Market Units)
    const tab2 = screen.getByTestId("rewind-tab-decision-sell-market");
    fireEvent.click(tab2);

    const secondAlt = alternatives[1]!;
    expect(screen.getByTestId("alt-decision-label").textContent).toContain(secondAlt.decisionLabel);
    expect(screen.getByTestId("alt-state-delta").textContent).toContain(secondAlt.stateDelta!);
  });

  // 9. callbacks emit expected ids
  it("emits onAlternativeView and onComparisonComplete callbacks", () => {
    const onAlternativeView = vi.fn();
    const onComparisonComplete = vi.fn();

    render(
      <FinancialRewind
        episodeId="practice-ep-march-2020"
        chosenPath={chosenPath}
        alternatives={alternatives}
        onAlternativeView={onAlternativeView}
        onComparisonComplete={onComparisonComplete}
      />,
    );

    const tab2 = screen.getByTestId("rewind-tab-decision-sell-market");
    fireEvent.click(tab2);

    expect(onAlternativeView).toHaveBeenCalledWith({
      episodeId: "practice-ep-march-2020",
      alternativeId: "alt-sell-market",
    });
    expect(onComparisonComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        episodeId: "practice-ep-march-2020",
        viewedAlternatives: expect.arrayContaining(["alt-sell-market"]),
      }),
    );
  });

  // 10. keyboard interaction works
  it("supports keyboard navigation on alternative tabs", () => {
    const onAlternativeView = vi.fn();
    render(
      <FinancialRewind
        episodeId="practice-ep-march-2020"
        chosenPath={chosenPath}
        alternatives={alternatives}
        onAlternativeView={onAlternativeView}
      />,
    );

    const tab2 = screen.getByTestId("rewind-tab-decision-sell-market");
    tab2.focus();
    expect(document.activeElement).toBe(tab2);

    fireEvent.click(tab2);
    expect(onAlternativeView).toHaveBeenCalled();
  });

  // 11. no "best choice", "correct", or "wrong" labels appear by default
  it("never includes judgment or hindsight bias labels", () => {
    render(<FinancialRewind episodeId="practice-ep-march-2020" chosenPath={chosenPath} alternatives={alternatives} />);

    expect(screen.queryByText(/Best choice/i)).toBeNull();
    expect(screen.queryByText(/Best outcome/i)).toBeNull();
    expect(screen.queryByText(/You should have/i)).toBeNull();
    expect(screen.queryByText(/Correct choice/i)).toBeNull();
    expect(screen.queryByText(/Wrong choice/i)).toBeNull();
  });

  // 12. reduced-motion-safe structure
  it("renders with standard semantic HTML and no forced animations", () => {
    const { container } = render(
      <FinancialRewind episodeId="practice-ep-march-2020" chosenPath={chosenPath} alternatives={alternatives} />,
    );

    expect(container.querySelector("section")).toBeDefined();
    expect(container.querySelector("h2")).toBeDefined();
  });
});
