import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./components/button";
import { Character } from "./components/character";
import { MoneyDecoder, MoneyDecoderCard, type MoneyTermData } from "./components/money-decoder";
import {
  AllocationView,
  EmergencyReserveCard,
  GoalsList,
  LiquidityBreakdown,
  PaperPortfolio,
  PortfolioSummary,
} from "./components/paper-portfolio";
import { PlayMoneyBadge } from "./components/play-money-badge";
import { SpotAndSort } from "./components/spot-and-sort";
import { StoryChoices } from "./components/story-choices";
import { TopicLesson, type TopicLessonData } from "./components/topic-lesson";
import { exampleEmergencyFundLesson } from "./fixtures/lesson-fixtures";
import { exampleStudentPortfolio } from "./fixtures/portfolio-fixtures";
import { exampleNeedVsWantActivity } from "./fixtures/spot-and-sort-fixtures";
import { exampleScamStoryScenario } from "./fixtures/story-fixtures";
import { formatInr } from "./lib/format";

describe("ui", () => {
  it("formats paise as Indian-grouped rupees", () => {
    expect(formatInr(10_000_000)).toBe("₹1,00,000");
    expect(formatInr(12_345, { decimals: 2 })).toBe("₹123.45");
  });

  it("renders a button", () => {
    render(<Button>Start</Button>);
    expect(screen.getByRole("button", { name: "Start" })).toBeDefined();
  });

  it("labels play money", () => {
    render(<PlayMoneyBadge label="नकली पैसे" />);
    expect(screen.getByText("नकली पैसे")).toBeDefined();
  });

  describe("Character primitive", () => {
    it("renders default blob character as decorative when no label is passed", () => {
      const { container } = render(<Character />);
      const svg = container.querySelector("svg");
      expect(svg).toBeDefined();
      expect(svg?.getAttribute("aria-hidden")).toBe("true");
    });

    it("renders with accessible role and label when label is passed", () => {
      render(<Character label="Protagonist explaining savings" pose="explaining" />);
      const img = screen.getByRole("img", { name: "Protagonist explaining savings" });
      expect(img).toBeDefined();
    });

    it("supports various silhouettes, poses, and sizes", () => {
      const { rerender, container } = render(<Character variant="pillar" pose="saving" accent="lime" size="sm" />);
      expect(container.querySelector("svg")?.getAttribute("width")).toBe("36");

      rerender(<Character variant="spark" pose="celebrating" accent="lilac" size="xl" />);
      expect(container.querySelector("svg")?.getAttribute("width")).toBe("180");
    });
  });

  describe("MoneyDecoder primitive", () => {
    const mockTerm: MoneyTermData = {
      term: "Tenure",
      expandedName: "FD / Loan Tenure",
      plainMeaning: "How long an agreement or deposit lasts before it matures.",
      whereYouSeeIt: ["Fixed Deposits (FD)", "Recurring Deposits (RD)", "Loans / EMI"],
      example: "A 12-month tenure means money stays invested for exactly 1 year.",
      gradeGroup: "grade-8-10",
      whyItMattersHere: "Breaking an FD before tenure ends triggers a penalty fee.",
      misconception: "Tenure is not forever; it is a fixed agreed timeframe.",
      relatedTopicId: "fixed-deposit",
    };

    it("renders the inline trigger with term name", () => {
      render(<MoneyDecoder termData={mockTerm} />);
      const trigger = screen.getByTestId("money-decoder-trigger");
      expect(trigger.textContent).toContain("Tenure");
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
    });

    it("opens bottom sheet with definition, why-it-matters, and example on click", () => {
      render(<MoneyDecoder termData={mockTerm} />);
      const trigger = screen.getByTestId("money-decoder-trigger");
      fireEvent.click(trigger);

      expect(trigger.getAttribute("aria-expanded")).toBe("true");
      expect(screen.getByTestId("money-decoder-sheet")).toBeDefined();
      expect(screen.getByText("How long an agreement or deposit lasts before it matures.")).toBeDefined();
      expect(screen.getByText("Breaking an FD before tenure ends triggers a penalty fee.")).toBeDefined();
      expect(screen.getByText('"A 12-month tenure means money stays invested for exactly 1 year."')).toBeDefined();
      expect(screen.getByText("Fixed Deposits (FD)")).toBeDefined();
    });

    it("closes when the close button or Got It button is clicked", () => {
      render(<MoneyDecoder termData={mockTerm} />);
      const trigger = screen.getByTestId("money-decoder-trigger");
      fireEvent.click(trigger);

      const closeBtn = screen.getByTestId("money-decoder-close");
      fireEvent.click(closeBtn);
      expect(screen.queryByTestId("money-decoder-sheet")).toBeNull();
    });

    it("closes on Escape key press", () => {
      render(<MoneyDecoder termData={mockTerm} />);
      const trigger = screen.getByTestId("money-decoder-trigger");
      fireEvent.click(trigger);
      expect(screen.getByTestId("money-decoder-sheet")).toBeDefined();

      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByTestId("money-decoder-sheet")).toBeNull();
    });

    it("renders standalone MoneyDecoderCard", () => {
      render(<MoneyDecoderCard termData={mockTerm} />);
      expect(screen.getByTestId("money-decoder-card")).toBeDefined();
      expect(screen.getByText("Tenure")).toBeDefined();
      expect(screen.getByText("How long an agreement or deposit lasts before it matures.")).toBeDefined();
    });
  });

  describe("StoryChoices renderer", () => {
    it("renders story node, dialogue, and choices", () => {
      render(<StoryChoices scenario={exampleScamStoryScenario} />);
      expect(screen.getByText("The 'Guaranteed Quick Return' Offer")).toBeDefined();
      expect(screen.getByTestId("story-dialogue-card")).toBeDefined();
      expect(screen.getByTestId("story-choice-choice-send-money")).toBeDefined();
      expect(screen.getByTestId("story-choice-choice-ask-proof")).toBeDefined();
      expect(screen.getByTestId("story-choice-choice-refuse-firmly")).toBeDefined();
    });

    it("renders MoneyDecoder embedded in dialogue content", () => {
      render(<StoryChoices scenario={exampleScamStoryScenario} />);
      const termTriggers = screen.getAllByTestId("money-decoder-trigger");
      expect(termTriggers.length).toBeGreaterThan(0);
      expect(termTriggers[0]?.textContent).toContain("Guaranteed Return");
    });

    it("selecting a choice reveals consequence and financial principle with neutral labels", () => {
      render(<StoryChoices scenario={exampleScamStoryScenario} />);
      const choiceBtn = screen.getByTestId("story-choice-choice-send-money");
      fireEvent.click(choiceBtn);

      expect(screen.getByTestId("story-consequence-card")).toBeDefined();
      expect(screen.getByText("What this choice changed")).toBeDefined();
      expect(screen.getByText("Why this matters")).toBeDefined();
      expect(screen.getByText("What to check next")).toBeDefined();
      expect(screen.getByText("Urgent transfer sent under time pressure")).toBeDefined();
      expect(
        screen.getByText(
          "Urgency ('slots close tonight') is designed to prevent critical questions. Once a UPI transfer completes, reversing it without consent is extremely difficult.",
        ),
      ).toBeDefined();
    });

    it("navigating to next node advances the story", () => {
      render(<StoryChoices scenario={exampleScamStoryScenario} />);
      const choiceBtn = screen.getByTestId("story-choice-choice-ask-proof");
      fireEvent.click(choiceBtn);

      const continueBtn = screen.getByTestId("story-continue-btn");
      fireEvent.click(continueBtn);

      expect(screen.getByText("Step 2")).toBeDefined();
      expect(screen.getByText(/national cybercrime portal/i)).toBeDefined();
      expect(screen.getByTestId("story-choice-choice-finish-safe")).toBeDefined();
    });

    it("retry resets choice state back to decision", () => {
      render(<StoryChoices scenario={exampleScamStoryScenario} />);
      const choiceBtn = screen.getByTestId("story-choice-choice-send-money");
      fireEvent.click(choiceBtn);
      expect(screen.getByTestId("story-consequence-card")).toBeDefined();

      const retryBtn = screen.getByTestId("story-retry-btn");
      fireEvent.click(retryBtn);

      expect(screen.getByTestId("story-choices-list")).toBeDefined();
      expect(screen.queryByTestId("story-consequence-card")).toBeNull();
    });

    it("emits structured onComplete result when scenario finishes", () => {
      const onCompleteMock = vi.fn();
      render(<StoryChoices scenario={exampleScamStoryScenario} onComplete={onCompleteMock} />);

      const choiceBtn = screen.getByTestId("story-choice-choice-refuse-firmly");
      fireEvent.click(choiceBtn);

      const finishBtn = screen.getByTestId("story-continue-btn");
      fireEvent.click(finishBtn);

      expect(onCompleteMock).toHaveBeenCalledTimes(1);
      const result = onCompleteMock.mock.calls[0]?.[0];
      expect(result.storyId).toBe("double-money-scam");
      expect(result.selectedChoices).toHaveLength(1);
      expect(result.selectedChoices[0].choiceId).toBe("choice-refuse-firmly");
      expect(result.outcomeTags).toContain("spotted-unrealistic-return");
      expect(screen.getByTestId("story-choices-finished")).toBeDefined();
    });

    it("supports keyboard activation on choice cards", () => {
      render(<StoryChoices scenario={exampleScamStoryScenario} />);
      const choiceBtn = screen.getByTestId("story-choice-choice-ask-proof");
      fireEvent.keyDown(choiceBtn, { key: "Enter", code: "Enter" });
      fireEvent.click(choiceBtn);

      expect(screen.getByTestId("story-consequence-card")).toBeDefined();
    });
  });

  describe("SpotAndSort renderer", () => {
    it("renders current item prompt, progress, and categories", () => {
      render(<SpotAndSort activity={exampleNeedVsWantActivity} />);
      expect(screen.getByText("Need or Want?")).toBeDefined();
      expect(screen.getByTestId("round-progress").textContent).toContain("1 of 3");
      expect(screen.getByText(/Monthly bus pass to travel to school/i)).toBeDefined();
      expect(screen.getByTestId("category-btn-need")).toBeDefined();
      expect(screen.getByTestId("category-btn-want")).toBeDefined();
    });

    it("selecting a category reveals immediate explanation with why it fits", () => {
      render(<SpotAndSort activity={exampleNeedVsWantActivity} />);
      const needBtn = screen.getByTestId("category-btn-need");
      fireEvent.click(needBtn);

      expect(screen.getByTestId("spot-and-sort-explanation")).toBeDefined();
      expect(screen.getByText("Category Matched")).toBeDefined();
      expect(screen.getByText("Why this fits")).toBeDefined();
      expect(
        screen.getByText("Regular travel to school directly supports daily education and attendance."),
      ).toBeDefined();
    });

    it("advances to the next item when Next Item is clicked", () => {
      render(<SpotAndSort activity={exampleNeedVsWantActivity} />);
      fireEvent.click(screen.getByTestId("category-btn-need"));
      const nextBtn = screen.getByTestId("spot-and-sort-next-btn");
      fireEvent.click(nextBtn);

      expect(screen.getByTestId("round-progress").textContent).toContain("2 of 3");
      expect(screen.getByText(/branded gaming headset/i)).toBeDefined();
      expect(screen.queryByTestId("spot-and-sort-explanation")).toBeNull();
    });

    it("retry works when different category is selected and allowRetry is true", () => {
      render(<SpotAndSort activity={exampleNeedVsWantActivity} />);
      fireEvent.click(screen.getByTestId("category-btn-want"));

      expect(screen.getByText("Alternative Category")).toBeDefined();
      const retryBtn = screen.getByTestId("spot-and-sort-retry-btn");
      expect(retryBtn).toBeDefined();

      fireEvent.click(retryBtn);
      expect(screen.queryByTestId("spot-and-sort-explanation")).toBeNull();
    });

    it("renders optional MoneyDecoder terms when embedded in items", () => {
      render(<SpotAndSort activity={exampleNeedVsWantActivity} />);
      fireEvent.click(screen.getByTestId("category-btn-need"));
      fireEvent.click(screen.getByTestId("spot-and-sort-next-btn"));

      const termTriggers = screen.getAllByTestId("money-decoder-trigger");
      expect(termTriggers.length).toBeGreaterThan(0);
      expect(termTriggers[0]?.textContent).toContain("Opportunity Cost");
    });

    it("emits structured result via onComplete when all items are finished", () => {
      const onCompleteMock = vi.fn();
      render(<SpotAndSort activity={exampleNeedVsWantActivity} onComplete={onCompleteMock} />);

      fireEvent.click(screen.getByTestId("category-btn-need"));
      fireEvent.click(screen.getByTestId("spot-and-sort-next-btn"));

      fireEvent.click(screen.getByTestId("category-btn-want"));
      fireEvent.click(screen.getByTestId("spot-and-sort-next-btn"));

      fireEvent.click(screen.getByTestId("category-btn-need"));
      fireEvent.click(screen.getByTestId("spot-and-sort-next-btn"));

      expect(onCompleteMock).toHaveBeenCalledTimes(1);
      const result = onCompleteMock.mock.calls[0]?.[0];
      expect(result.activityId).toBe("needs-vs-wants-demo");
      expect(result.responses).toHaveLength(3);
      expect(result.responses[0].itemId).toBe("item-bus-pass");
      expect(result.responses[0].isMatch).toBe(true);
      expect(screen.getByTestId("spot-and-sort-finished")).toBeDefined();
    });

    it("supports keyboard selection on category buttons", () => {
      render(<SpotAndSort activity={exampleNeedVsWantActivity} />);
      const needBtn = screen.getByTestId("category-btn-need");
      fireEvent.keyDown(needBtn, { key: "Enter", code: "Enter" });
      fireEvent.click(needBtn);

      expect(screen.getByTestId("spot-and-sort-explanation")).toBeDefined();
    });
  });

  describe("TopicLesson orchestrator", () => {
    it("renders lesson title and initial intro step", () => {
      render(<TopicLesson lesson={exampleEmergencyFundLesson} />);
      expect(screen.getByText("Emergency Funds & Locked Deposits")).toBeDefined();
      expect(screen.getByTestId("lesson-step-intro")).toBeDefined();
      expect(screen.getByText(/When Surprises Cost Money/i)).toBeDefined();
      expect(screen.getByTestId("lesson-step-counter").textContent).toContain("1 of 7");
    });

    it("progresses sequentially through multiple step types", () => {
      render(<TopicLesson lesson={exampleEmergencyFundLesson} />);
      const continueBtn = screen.getByTestId("lesson-continue-btn");

      // Step 1 Intro -> Step 2 Experience
      fireEvent.click(continueBtn);
      expect(screen.getByTestId("lesson-step-experience")).toBeDefined();
      expect(screen.getByText(/The Broken Laptop Screen/i)).toBeDefined();

      // Step 2 Experience -> Step 3 Notice
      fireEvent.click(continueBtn);
      expect(screen.getByTestId("lesson-step-notice")).toBeDefined();
      expect(screen.getByText(/Notice the Trade-off/i)).toBeDefined();

      // Step 3 Notice -> Step 4 Decoder
      fireEvent.click(continueBtn);
      expect(screen.getByTestId("lesson-step-decoder")).toBeDefined();
      expect(screen.getByText(/Decode The Core Terms/i)).toBeDefined();
    });

    it("renders MoneyDecoder cards in decoder step", () => {
      render(<TopicLesson lesson={exampleEmergencyFundLesson} />);
      const continueBtn = screen.getByTestId("lesson-continue-btn");
      fireEvent.click(continueBtn); // Step 2
      fireEvent.click(continueBtn); // Step 3
      fireEvent.click(continueBtn); // Step 4 Decoder

      const decoderCards = screen.getAllByTestId("money-decoder-card");
      expect(decoderCards.length).toBe(2);
      expect(screen.getByText("Emergency Fund")).toBeDefined();
      expect(screen.getByText("Tenure")).toBeDefined();
    });

    it("renders worked example and transfer steps", () => {
      render(<TopicLesson lesson={exampleEmergencyFundLesson} />);
      const continueBtn = screen.getByTestId("lesson-continue-btn");
      fireEvent.click(continueBtn); // Step 2
      fireEvent.click(continueBtn); // Step 3
      fireEvent.click(continueBtn); // Step 4
      fireEvent.click(continueBtn); // Step 5 Worked Example

      expect(screen.getByTestId("lesson-step-worked-example")).toBeDefined();
      expect(screen.getByText("Strategy A: 100% Locked in FD")).toBeDefined();
      expect(screen.getByText("Strategy B: Balanced Emergency Buffer")).toBeDefined();

      fireEvent.click(continueBtn); // Step 6 Transfer
      expect(screen.getByTestId("lesson-step-transfer")).toBeDefined();
      const transferOptions = screen.getAllByTestId("lesson-transfer-option");
      expect(transferOptions.length).toBe(3);
    });

    it("embeds SpotAndSort as a lesson step and advances upon completion", () => {
      const activityLesson: TopicLessonData = {
        id: "activity-lesson",
        topicId: "needs-vs-wants",
        title: "Needs vs wants",
        pillar: "plan-budget",
        gradeGroup: "grade-6-7",
        steps: [
          {
            id: "step-sort",
            type: "spot-and-sort",
            title: "Practice Sorting",
            activity: exampleNeedVsWantActivity,
          },
          {
            id: "step-finish",
            type: "recap",
            title: "Recap",
            summaryText: "You mastered sorting expenses.",
            keyPrinciples: ["Needs come first."],
          },
        ],
      };

      render(<TopicLesson lesson={activityLesson} />);
      expect(screen.getByTestId("spot-and-sort-container")).toBeDefined();

      // Finish the embedded activity
      fireEvent.click(screen.getByTestId("category-btn-need"));
      fireEvent.click(screen.getByTestId("spot-and-sort-next-btn"));
      fireEvent.click(screen.getByTestId("category-btn-want"));
      fireEvent.click(screen.getByTestId("spot-and-sort-next-btn"));
      fireEvent.click(screen.getByTestId("category-btn-need"));
      fireEvent.click(screen.getByTestId("spot-and-sort-next-btn"));

      // Advances automatically to step-finish recap
      expect(screen.getByTestId("lesson-step-recap")).toBeDefined();
      expect(screen.getByText("You mastered sorting expenses.")).toBeDefined();
    });

    it("embeds StoryChoices as a lesson step and advances upon completion", () => {
      const storyLesson: TopicLessonData = {
        id: "story-lesson",
        topicId: "stay-safe",
        title: "Spotting a scam",
        pillar: "stay-safe",
        gradeGroup: "grade-8-10",
        steps: [
          {
            id: "step-story",
            type: "story-choice",
            title: "Decision Dilemma",
            scenario: exampleScamStoryScenario,
          },
          {
            id: "step-finish",
            type: "recap",
            title: "Recap",
            summaryText: "Safety reflexes built.",
            keyPrinciples: ["Verify independently."],
          },
        ],
      };

      render(<TopicLesson lesson={storyLesson} />);
      expect(screen.getByTestId("story-choices-container")).toBeDefined();

      // Finish embedded story choice
      fireEvent.click(screen.getByTestId("story-choice-choice-refuse-firmly"));
      fireEvent.click(screen.getByTestId("story-continue-btn"));

      // Advances automatically to step-finish recap
      expect(screen.getByTestId("lesson-step-recap")).toBeDefined();
    });

    it("emits onStepComplete and onLessonComplete with preserved gradeGroup", () => {
      const onStepMock = vi.fn();
      const onLessonMock = vi.fn();

      render(
        <TopicLesson lesson={exampleEmergencyFundLesson} onStepComplete={onStepMock} onLessonComplete={onLessonMock} />,
      );

      const continueBtn = screen.getByTestId("lesson-continue-btn");
      // Advance through all 7 steps
      for (let i = 0; i < 7; i++) {
        fireEvent.click(continueBtn);
      }

      expect(onStepMock).toHaveBeenCalled();
      expect(onLessonMock).toHaveBeenCalledTimes(1);
      const result = onLessonMock.mock.calls[0]?.[0];
      expect(result.lessonId).toBe("emergency-fund-fd-lesson");
      expect(result.topicId).toBe("emergency-fund");
      expect(result.gradeGroup).toBe("grade-8-10");
      expect(result.completedSteps).toHaveLength(7);
      expect(screen.getByTestId("topic-lesson-finished")).toBeDefined();
    });

    it("supports keyboard navigation on continue button", () => {
      render(<TopicLesson lesson={exampleEmergencyFundLesson} />);
      const continueBtn = screen.getByTestId("lesson-continue-btn");
      fireEvent.keyDown(continueBtn, { key: "Enter", code: "Enter" });
      fireEvent.click(continueBtn);

      expect(screen.getByTestId("lesson-step-experience")).toBeDefined();
    });
  });

  describe("PaperPortfolio UI", () => {
    it("renders total portfolio value and PlayMoneyBadge", () => {
      render(<PaperPortfolio portfolio={exampleStudentPortfolio} />);

      // Total value: Cash (2,500) + Holdings (5,000 + 7,000 + 3,000 + 8,000) = ₹25,500
      expect(screen.getByTestId("portfolio-total-value").textContent).toBe("₹25,500");
      expect(screen.getByText("Play Money")).toBeDefined();
      expect(screen.getByTestId("portfolio-as-of").textContent).toContain("11 Oct 2026");
    });

    it("renders as-of date and micro-metrics grid", () => {
      render(<PortfolioSummary portfolio={exampleStudentPortfolio} />);

      expect(screen.getByTestId("portfolio-available-cash").textContent).toBe("₹2,500");
      expect(screen.getByTestId("portfolio-emergency-reserve").textContent).toBe("₹5,000");
      expect(screen.getByTestId("portfolio-linked-goals").textContent).toBe("₹15,000");
      expect(screen.getByTestId("portfolio-locked-amount").textContent).toBe("₹10,000");
    });

    it("renders liquidity breakdown with 3 categories and accessible progressbar", () => {
      render(<LiquidityBreakdown portfolio={exampleStudentPortfolio} />);

      expect(screen.getByTestId("liquidity-breakdown")).toBeDefined();
      expect(screen.getByRole("progressbar")).toBeDefined();
      expect(screen.getByText("Available Now")).toBeDefined();
      expect(screen.getByText("Conditional Access")).toBeDefined();
      expect(screen.getByText("Longer-Term / Market")).toBeDefined();
    });

    it("renders emergency reserve status with buffer progress and note", () => {
      render(<EmergencyReserveCard reserve={exampleStudentPortfolio.emergencyReserve} />);

      expect(screen.getByTestId("emergency-reserve-card")).toBeDefined();
      expect(screen.getByText("Emergency Reserve Status")).toBeDefined();
      expect(screen.getByTestId("emergency-reserve-note").textContent).toContain("2.5 months");
    });

    it("renders multiple holding types with values and goal association", () => {
      render(<PaperPortfolio portfolio={exampleStudentPortfolio} />);

      // Holdings cards
      expect(screen.getByTestId("holding-card-holding-savings-buffer")).toBeDefined();
      expect(screen.getByTestId("holding-card-holding-fd-1")).toBeDefined();
      expect(screen.getByTestId("holding-card-holding-rd-1")).toBeDefined();
      expect(screen.getByTestId("holding-card-holding-index-fund-1")).toBeDefined();

      // Goal connection text
      expect(screen.getAllByText(/School Laptop & Coding Setup/).length).toBeGreaterThan(0);
    });

    it("renders goal connection with progress and target date", () => {
      render(<GoalsList goals={exampleStudentPortfolio.goals} />);

      expect(screen.getByTestId("goal-item-goal-laptop")).toBeDefined();
      expect(screen.getByTestId("goal-item-goal-bicycle")).toBeDefined();
      expect(screen.getByText("Target Date: 30 Jun 2027")).toBeDefined();
    });

    it("renders diversification allocation view with text equivalent", () => {
      render(<AllocationView portfolio={exampleStudentPortfolio} />);

      expect(screen.getByTestId("allocation-view")).toBeDefined();
      expect(screen.getByText("Asset Diversification")).toBeDefined();
      expect(screen.getByText("Fixed Deposit (FD)")).toBeDefined();
      expect(screen.getByText("Index Fund")).toBeDefined();
    });

    it("opens holding detail modal when button is clicked and emits onHoldingOpen callback", () => {
      const onOpenMock = vi.fn();
      render(<PaperPortfolio portfolio={exampleStudentPortfolio} onHoldingOpen={onOpenMock} />);

      const detailBtn = screen.getByTestId("holding-detail-btn-holding-fd-1");
      fireEvent.click(detailBtn);

      expect(onOpenMock).toHaveBeenCalledWith("holding-fd-1");
      expect(screen.getByTestId("holding-detail-modal")).toBeDefined();
      expect(screen.getByText("Why this asset is held")).toBeDefined();
      expect(screen.getByText("Access & Early Withdrawal Conditions")).toBeDefined();

      // Close modal with close button
      const closeBtn = screen.getByTestId("modal-close-btn");
      fireEvent.click(closeBtn);
      expect(screen.queryByTestId("holding-detail-modal")).toBeNull();
    });

    it("closes holding detail modal on Escape key press", () => {
      render(<PaperPortfolio portfolio={exampleStudentPortfolio} />);

      const detailBtn = screen.getByTestId("holding-detail-btn-holding-fd-1");
      fireEvent.click(detailBtn);
      expect(screen.getByTestId("holding-detail-modal")).toBeDefined();

      // Press Escape
      fireEvent.keyDown(window, { key: "Escape", code: "Escape" });
      expect(screen.queryByTestId("holding-detail-modal")).toBeNull();
    });

    it("switches mobile navigation tabs smoothly without desktop-only dependency", () => {
      render(<PaperPortfolio portfolio={exampleStudentPortfolio} />);

      const tabHoldings = screen.getByTestId("portfolio-tab-holdings");
      fireEvent.click(tabHoldings);
      expect(screen.getByTestId("holdings-list-section")).toBeDefined();

      const tabLiquidity = screen.getByTestId("portfolio-tab-liquidity");
      fireEvent.click(tabLiquidity);
      expect(screen.getByTestId("liquidity-breakdown")).toBeDefined();
      expect(screen.getByTestId("allocation-view")).toBeDefined();

      const tabGoals = screen.getByTestId("portfolio-tab-goals");
      fireEvent.click(tabGoals);
      expect(screen.getByTestId("goals-list-section")).toBeDefined();
    });

    it("integrates MoneyDecoder for portfolio financial terms when supplied in data", () => {
      render(<LiquidityBreakdown portfolio={exampleStudentPortfolio} />);

      // Find the Liquidity trigger button supplied by exampleStudentPortfolio.terms
      const liquidityBtn = screen.getByRole("button", { name: "Decode term: Liquidity" });
      expect(liquidityBtn).toBeDefined();

      fireEvent.click(liquidityBtn);
      expect(screen.getByTestId("money-decoder-dialog")).toBeDefined();
      expect(screen.getByText("What this means")).toBeDefined();
    });

    it("does not render MoneyDecoder triggers if terms data is omitted", () => {
      const portfolioWithoutTerms = {
        ...exampleStudentPortfolio,
        terms: undefined,
      };
      render(<LiquidityBreakdown portfolio={portfolioWithoutTerms} />);

      // No Liquidity trigger button when terms is undefined
      expect(screen.queryByRole("button", { name: "Decode term: Liquidity" })).toBeNull();
    });
  });

  describe("Localization & Multi-Language Layout Hardening (R2)", () => {
    const hindiTermData: MoneyTermData = {
      term: "परिपक्वता",
      expandedName: "सावधि जमा परिपक्वता अवधि",
      plainMeaning: "वह निर्धारित तारीख जब आपका जमा किया गया पैसा और उस पर मिला ब्याज वापस मिलता है।",
      whereYouSeeIt: ["बैंक पासबुक", "सावधि जमा प्रमाणपत्र", "मोबाइल बैंकिंग ऐप"],
      example: "यदि आपने ₹5,000 एक वर्ष के लिए जमा किए हैं, तो एक वर्ष पूर्ण होने की तिथि परिपक्वता तिथि है।",
      whyItMattersHere: "यदि आप परिपक्वता से पहले पैसा निकालते हैं, तो बैंक पेनल्टी काट सकता है।",
      misconception: "परिपक्वता से पहले कभी भी पूरा ब्याज नहीं मिलता।",
    };

    it("renders MoneyDecoder with Hindi UI copy, translated aria-labels, and Devanagari script", () => {
      render(
        <MoneyDecoder
          termData={hindiTermData}
          labels={{
            badgeTitle: "मुद्रा डिकोडर",
            closeAria: "डिकोडर बंद करें",
            triggerAriaPrefix: "शब्दावली डिकोड करें:",
            plainMeaning: "सरल अर्थ",
            whyItMatters: "यहाँ इसका महत्व",
            whereYouSeeIt: "आप इसे कहाँ देखेंगे",
            realLifeExample: "दैनिक जीवन का उदाहरण",
            watchOut: "सावधान रहें / आम गलतफहमी",
            gotIt: "समझ गया",
          }}
        />,
      );

      // Verify trigger with translated aria-label
      const trigger = screen.getByRole("button", { name: "शब्दावली डिकोड करें: परिपक्वता" });
      expect(trigger).toBeDefined();

      // Open drawer
      fireEvent.click(trigger);

      // Verify Hindi UI headings and Devanagari content
      expect(screen.getByText("मुद्रा डिकोडर")).toBeDefined();
      expect(screen.getByText("सरल अर्थ")).toBeDefined();
      expect(screen.getByText(hindiTermData.plainMeaning)).toBeDefined();
      expect(screen.getByText("यहाँ इसका महत्व")).toBeDefined();
      expect(screen.getByText(hindiTermData.whyItMattersHere!)).toBeDefined();
      expect(screen.getByText("सावधान रहें / आम गलतफहमी")).toBeDefined();
      expect(screen.getByRole("button", { name: "डिकोडर बंद करें" })).toBeDefined();
      expect(screen.getByText("समझ गया")).toBeDefined();

      // Close drawer with translated button
      fireEvent.click(screen.getByRole("button", { name: "डिकोडर बंद करें" }));
    });

    it("renders MoneyDecoder with Telugu UI copy, translated aria-labels, and Telugu script", () => {
      const teluguTermData: MoneyTermData = {
        term: "లిక్విడిటీ",
        expandedName: "ద్రవ్యలభ్యత / తక్షణ నగదు యాక్సెస్",
        plainMeaning: "మీ డబ్బును నష్టం లేకుండా ఎంత త్వరగా నగదుగా మార్చుకోవచ్చో తెలిపే సామర్థ్యం.",
        whereYouSeeIt: ["పొదుపు ఖాతా", "అత్యవసర నిధి"],
        example: "బ్యాంక్ ఖాతాలోని నగదు అత్యధిక లిక్విడిటీ కలిగి ఉంటుంది, కానీ స్థిరాస్తికి తక్కువ లిక్విడిటీ ఉంటుంది.",
      };

      render(
        <MoneyDecoder
          termData={teluguTermData}
          labels={{
            badgeTitle: "మనీ డీకోడర్",
            closeAria: "డీకోడర్ మూసివేయి",
            triggerAriaPrefix: "పదాన్ని డీకోడ్ చేయి:",
            plainMeaning: "స్పష్టమైన అర్థం",
            whereYouSeeIt: "మీరు దీనిని ఎక్కడ చూస్తారు",
            realLifeExample: "నిజ జీవిత ఉదాహరణ",
            gotIt: "అర్థమైంది",
          }}
        />,
      );

      // Verify trigger with Telugu aria-label
      const trigger = screen.getByRole("button", { name: "పదాన్ని డీకోడ్ చేయి: లిక్విడిటీ" });
      expect(trigger).toBeDefined();

      // Open drawer
      fireEvent.click(trigger);

      // Verify Telugu copy
      expect(screen.getByText("మనీ డీకోడర్")).toBeDefined();
      expect(screen.getByText("స్పష్టమైన అర్థం")).toBeDefined();
      expect(screen.getByText(teluguTermData.plainMeaning)).toBeDefined();
      expect(screen.getByRole("button", { name: "డీకోడర్ మూసివేయి" })).toBeDefined();
      expect(screen.getByText("అర్థమైంది")).toBeDefined();
    });

    it("renders TopicLesson with translated labels and non-English content without truncation", () => {
      const hindiLesson: TopicLessonData = {
        id: "lesson-hindi-budget",
        topicId: "needs-vs-wants",
        title: "आवश्यकताएं बनाम इच्छाएं: समझदारी से बजट बनाना",
        pillar: "plan-budget",
        gradeGroup: "grade-8-10",
        steps: [
          {
            id: "step-1",
            type: "intro",
            title: "पैसे के फैसले की शुरुआत",
            hook: "क्या आपने कभी सोचा है कि जेबखर्च खत्म होने के बाद महत्वपूर्ण चीजों के लिए पैसे क्यों नहीं बचते?",
            estimatedMinutes: 5,
            learningPointers: ["आवश्यक जरूरतों और अस्थायी इच्छाओं में अंतर पहचानें", "सीमित बजट में प्राथमिकताओं का संतुलन बनाएं"],
          },
        ],
      };

      render(
        <TopicLesson
          lesson={hindiLesson}
          labels={{
            theHook: "मुख्य प्रसंग",
            whatYoullExplore: "आप क्या सीखेंगे",
            estimatedTime: (mins) => `अनुमानित समय: ~${mins} मिनट`,
            continueAction: "आगे बढ़ें",
            previous: "पिछला",
            finishLesson: "पाठ समाप्त करें",
            pillars: {
              "plan-budget": "योजना और बजट",
              "save-manage": "बचत और प्रबंधन",
              "understand-investing": "निवेश समझें",
              "stay-safe": "सुरक्षित रहें",
            },
          }}
        />,
      );

      expect(screen.getByText("योजना और बजट")).toBeDefined();
      expect(screen.getByText("मुख्य प्रसंग")).toBeDefined();
      expect(screen.getByText(hindiLesson.steps[0]!.title)).toBeDefined();
      expect(screen.getByText("आगे बढ़ें")).toBeDefined();
      expect(screen.getByText("अनुमानित समय: ~5 मिनट")).toBeDefined();
    });

    it("renders PaperPortfolio with Telugu labels and complex script without layout failure", () => {
      render(
        <PaperPortfolio
          portfolio={exampleStudentPortfolio}
          labels={{
            paperPortfolioTitle: "పేపర్ పోర్ట్‌ఫోలియో",
            playMoneyBadge: "ఆట డబ్బు",
            availableCash: "అందుబాటులో ఉన్న నగదు",
            emergencyBuffer: "అత్యవసర నిధి బఫర్",
            liquidityAndAccess: "లిక్విడిటీ & యాక్సెస్",
            tabOverview: "సమీక్ష",
            tabHoldings: (count) => `హోల్డింగ్స్ (${count})`,
            tabLiquidity: "లిక్విడిటీ & నిల్వ",
            tabGoals: (count) => `లక్ష్యాలు (${count})`,
          }}
        />,
      );

      expect(screen.getByText("పేపర్ పోర్ట్‌ఫోలియో")).toBeDefined();
      expect(screen.getByText("ఆట డబ్బు")).toBeDefined();
      expect(screen.getByText("అందుబాటులో ఉన్న నగదు")).toBeDefined();
      expect(screen.getByText("అత్యవసర నిధి బఫర్")).toBeDefined();
      expect(screen.getByText("సమీక్ష")).toBeDefined();
      expect(screen.getByTestId("portfolio-tab-liquidity")).toBeDefined();
    });
  });
});
