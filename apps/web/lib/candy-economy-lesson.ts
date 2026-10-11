import type { GradeGroup } from "@gullak/types";
import type { TopicLessonData } from "@gullak/ui/components/topic-lesson";

/**
 * Candy Economy — Lesson 1: "The Origin of Money: From Barter to Candy Coins"
 *
 * Authored according to the Gullak pedagogical loop:
 * intro → experience → story-choice → notice → explanation → spot-and-sort → transfer → reflection → recap.
 *
 * Adheres strictly to:
 * - Play money only (Candy Coins, integer virtual value)
 * - No real product advice
 * - Responsive 2–4 choice branches on story nodes
 * - Normalized spot-and-sort and story-choice data models
 */
export function getCandyEconomyLesson1(gradeGroup: GradeGroup = "grade-6-7"): TopicLessonData {
  return {
    id: "candy-economy-lesson-1",
    topicId: "money-basics",
    pillar: "plan-budget",
    gradeGroup,
    title: "The Origin of Money: From Barter to Candy Coins",
    steps: [
      {
        id: "step-1-intro",
        type: "intro",
        title: "Welcome to Candyville: What Is Money?",
        sectionLabel: "Start",
        character: {
          variant: "blob",
          pose: "explaining",
          expression: "friendly",
          accent: "lime",
          label: "Gullu",
        },
        hook: "Imagine walking into a bakery with two bags of wheat, but the baker only wants shoes. How would anyone ever buy bread?",
        estimatedMinutes: 4,
        learningPointers: [
          "Why direct barter breaks down when trade desires do not match",
          "How money works as a universal token accepted by everyone",
          "Distinguishing your essential needs from tempting treats before spending",
        ],
      },
      {
        id: "step-2-experience",
        type: "experience",
        title: "The Lemon Drop Dilemma",
        sectionLabel: "Experience",
        contextNote: "Trading day in Candyville lane",
        scenario:
          "Gullu has 4 homemade lemon drops and desperately needs a school notebook from Meera. But Meera does not like lemon drops—she only wants chocolate buttons. Kabir has chocolate buttons, but Kabir only wants shiny marbles!",
        dilemmaPrompt:
          "To get one notebook, Gullu has to coordinate three separate trades across town. If anyone says no or changes their mind, Gullu gets stuck without a notebook for tomorrow's class.",
        terms: [
          {
            term: "Barter System",
            expandedName: "Direct Good-for-Good Exchange",
            plainMeaning: "Exchanging items or services directly with another person without using any money.",
            whereYouSeeIt: ["Ancient marketplaces", "Trading cards with classmates", "Informal swaps"],
            example: "Swapping 2 comic books for 1 pencil box.",
            whyItMattersHere: "Barter only works when both people want what the other has at the exact same moment.",
          },
        ],
      },
      {
        id: "step-3-story-choice",
        type: "story-choice",
        title: "The Great Barter Chain",
        sectionLabel: "Decide",
        scenario: {
          id: "barter-chain-scenario",
          title: "Navigate the Trading Lane",
          topicIds: ["money-basics"],
          initialNodeId: "node-marbles-trade",
          nodes: {
            "node-marbles-trade": {
              id: "node-marbles-trade",
              dialogue: {
                speaker: "protagonist",
                text: "Kabir is holding chocolate buttons. He says: 'I'll give you chocolate buttons if you bring me marbles from the bazaar.' How should we proceed?",
              },
              contextNote: "Gullu has 4 lemon drops in pocket.",
              choices: [
                {
                  id: "choice-accept-candy-coins",
                  text: "Ask the market elder to exchange lemon drops for standard Candy Coins first.",
                  consequence: {
                    title: "Universal Medium Adopted",
                    description:
                      "The market elder gave Gullu standard Candy Coins. Both Meera and Kabir accept coins gladly, completely skipping the complex marble trade!",
                    financialPrinciple:
                      "Common currency solves the 'double coincidence of wants' because everyone in the community trusts and accepts it.",
                    whatToCheckNext: "Check how many coins are left after buying the school notebook.",
                    protagonistPose: "celebrating",
                    protagonistExpression: "friendly",
                  },
                  nextNodeId: "node-coins-success",
                  outcomeTags: ["chose-common-currency", "solved-double-coincidence"],
                },
                {
                  id: "choice-chase-marbles",
                  text: "Spend the afternoon running to the bazaar to swap lemon drops for marbles.",
                  consequence: {
                    title: "High Trade Friction",
                    description:
                      "By the time Gullu found the marble seller, the bazaar was closing and Meera had already traded the notebook to someone else.",
                    financialPrinciple:
                      "Barter carries huge search and negotiation costs. When trades require long chains, market efficiency collapses.",
                    whatToCheckNext: "Notice why standard coins prevent wasted time and lost trades.",
                    protagonistPose: "cautious",
                    protagonistExpression: "concerned",
                  },
                  nextNodeId: "node-barter-friction",
                  outcomeTags: ["chased-barter-chain", "trade-friction"],
                },
              ],
            },
            "node-coins-success": {
              id: "node-coins-success",
              dialogue: {
                speaker: "friend",
                text: "With Candy Coins in hand, Meera accepted 2 coins for the notebook immediately. You still have 2 coins remaining in your pocket!",
              },
              choices: [
                {
                  id: "choice-save-remaining",
                  text: "Place the remaining 2 Candy Coins in your Gullak for tomorrow.",
                  consequence: {
                    title: "Prudent Reserve Built",
                    description: "Your school notebook is secured, and your savings buffer has begun to grow.",
                    financialPrinciple:
                      "Money acts as a store of value that preserves purchasing power for future needs.",
                  },
                  nextNodeId: null,
                },
                {
                  id: "choice-spend-all-treats",
                  text: "Spend the remaining 2 coins on extra sugar candies right away.",
                  consequence: {
                    title: "Discretionary Spending",
                    description:
                      "The treats tasted sweet, but your pocket is completely empty if another surprise expense arrives.",
                    financialPrinciple:
                      "Distinguish between essential needs and discretionary wants to keep savings intact.",
                  },
                  nextNodeId: null,
                },
              ],
            },
            "node-barter-friction": {
              id: "node-barter-friction",
              dialogue: {
                speaker: "narrator",
                text: "The lane elders gather at dusk to establish an easier rule for everyone in Candyville.",
              },
              choices: [
                {
                  id: "choice-join-coin-system",
                  text: "Agree to use official Candy Coins for all future lane transactions.",
                  consequence: {
                    title: "Community Accord",
                    description:
                      "All vendors agree on standard coin prices, eliminating endless barter negotiations forever.",
                    financialPrinciple:
                      "A shared unit of account and medium of exchange makes fair commerce possible for everyone.",
                  },
                  nextNodeId: null,
                },
              ],
            },
          },
        },
      },
      {
        id: "step-4-notice",
        type: "notice",
        title: "Notice the Magic of Common Currency",
        sectionLabel: "Notice",
        observationText:
          "In barter, trades only succeed if both parties want what the other owns at that exact minute. Money eliminates that barrier entirely.",
        guidingQuestion: "Why does a metal coin or paper note have value when you can't eat or wear it?",
        keyTakeaway:
          "Money has value because the whole community agrees to accept it as a measure and payment for real goods and services.",
        terms: [
          {
            term: "Medium of Exchange",
            plainMeaning: "An intermediate token used in trade to avoid the inconveniences of pure barter.",
            whereYouSeeIt: ["Cash notes", "Coins", "Digital bank accounts / UPI"],
            example: "Using a ₹10 coin to purchase a pen instead of offering a sandwich.",
            whyItMattersHere: "Everyone accepts money, so trade happens in one simple step instead of complex chains.",
          },
        ],
      },
      {
        id: "step-5-explanation",
        type: "explanation",
        title: "The Three Superpowers of Money",
        sectionLabel: "Understand",
        coreConcept:
          "Money solves the fundamental problems of trade through three core functions: Medium of Exchange, Unit of Account, and Store of Value.",
        breakdownPoints: [
          "Medium of Exchange: Widely accepted by everyone in exchange for goods and services.",
          "Unit of Account: Provides a standard price tag so you can compare the cost of different items.",
          "Store of Value: Unlike perishable bananas or melting ice cream, saved money holds its value for the future.",
        ],
        visualCallout: {
          title: "Double Coincidence of Wants",
          description:
            "Barter requires both people to desire each other's goods simultaneously. Money breaks this bottleneck forever.",
        },
      },
      {
        id: "step-6-spot-and-sort",
        type: "spot-and-sort",
        title: "Spot & Sort: Need vs Want in Candyville",
        sectionLabel: "Practice",
        activity: {
          id: "candy-needs-vs-wants",
          title: "Candyville Market Expense Sort",
          instruction: "Classify each market item: Is it an essential Need or a discretionary Want?",
          topicIds: ["money-basics", "needs-vs-wants"],
          allowRetry: true,
          categories: [
            {
              id: "need",
              label: "Essential Need",
              shortHint: "Required for health, education, or basic living",
              accent: "lime",
            },
            {
              id: "want",
              label: "Discretionary Want",
              shortHint: "Nice to have, but life continues safely without it",
              accent: "lilac",
            },
          ],
          items: [
            {
              id: "item-school-book",
              prompt: "A mathematics workbook for tomorrow's school lesson.",
              contextNote: "Education Expense",
              expectedCategoryId: "need",
              explanation: {
                whyItFits: "School materials directly support your education and daily learning.",
                whatToNotice: "Without this workbook, you cannot complete class assignments.",
                clueForNextTime: "Ask: 'Does this directly affect my ability to learn and attend school?'",
              },
              outcomeTags: ["education", "need"],
            },
            {
              id: "item-cough-syrup",
              prompt: "Doctor-prescribed cough syrup for a cold.",
              contextNote: "Healthcare",
              expectedCategoryId: "need",
              explanation: {
                whyItFits: "Medicine cures illness and protects basic physical health.",
                whatToNotice: "Health and safety expenses must always be funded before non-essentials.",
                clueForNextTime: "Health recovery is always an essential need.",
              },
              outcomeTags: ["health", "need"],
            },
            {
              id: "item-extra-gummies",
              prompt: "A third bag of fizzy gummy worms after you already had lunch.",
              contextNote: "Snacks",
              expectedCategoryId: "want",
              explanation: {
                whyItFits: "While tasty, extra treats are optional comforts that can be postponed.",
                whatToNotice: "Skipping extra treats does not harm your safety or education.",
                clueForNextTime: "Ask: 'Can I postpone this purchase without any negative consequence?'",
              },
              outcomeTags: ["snack", "want"],
            },
          ],
        },
      },
      {
        id: "step-7-transfer",
        type: "transfer",
        title: "Real World Application: Your Monthly Pocket Allowance",
        sectionLabel: "Transfer",
        newContextDescription:
          "You receive ₹100 in pocket allowance. Your monthly school bus pass renewal costs ₹70 and is due on Monday. Your classmates are heading to the arcade after school.",
        transferQuestion: "How should you allocate your ₹100 allowance to stay financially resilient?",
        options: [
          "Set aside ₹70 for the bus pass first; consider spending ₹15 on a small snack and saving ₹15 in your Gullak.",
          "Spend the entire ₹100 at the arcade today, and hope someone loans you bus fare on Monday.",
          "Refuse to ever spend any money on anything, walking 10 km to school each day.",
        ],
        takeaway:
          "Pay for essential needs first. Only discretionary surplus should be used for wants or divided into your savings Gullak.",
      },
      {
        id: "step-8-reflection",
        type: "reflection",
        title: "Check Your Understanding",
        sectionLabel: "Reflect",
        prompt:
          "Why was introducing standardized Candy Coins better than continuing the complex lemon-drop barter trade?",
        options: [
          "Candy Coins are universally accepted by every shopkeeper, removing the need to find a perfect barter match.",
          "Candy Coins are heavier and louder in your pocket.",
          "Candy Coins prevent prices from ever changing in the future.",
        ],
        explanationAfterSelection:
          "Money functions as a universal medium of exchange. Because everyone in the market trusts and accepts it, trade happens effortlessly without barter chains.",
      },
      {
        id: "step-9-recap",
        type: "recap",
        title: "Lesson 1 Summary: Mastered!",
        sectionLabel: "Recap",
        summaryText:
          "You have discovered why money exists: it frees humanity from barter bottlenecks, establishes clear prices, and lets you save your hard work for tomorrow.",
        keyPrinciples: [
          "Money is a universal medium of exchange that eliminates the double coincidence of wants.",
          "Cover essential Needs (health, safety, schooling) before indulging discretionary Wants.",
          "Coins saved in your Gullak act as a store of value that protects you from future emergencies.",
        ],
        nextRecommendationNote:
          "Next up: Try the Candyville Market Stall simulation to practice shopping on limited coins!",
      },
    ],
  };
}
