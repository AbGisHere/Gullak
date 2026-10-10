import type { SpotAndSortActivity } from "../components/spot-and-sort";

/**
 * Example demo fixture: "Need vs Want" classification round.
 * Development/demo fixture only — used for testing and UI demonstration.
 * Free of hardcoded curriculum authority.
 */
export const exampleNeedVsWantActivity: SpotAndSortActivity = {
  id: "needs-vs-wants-demo",
  title: "Need or Want?",
  instruction: "Classify each monthly expense to see how budgeting decisions work.",
  topicIds: ["needs-vs-wants", "making-a-budget"],
  allowRetry: true,
  categories: [
    {
      id: "need",
      label: "Essential Need",
      shortHint: "Necessary for health, safety, or education",
      accent: "lime",
    },
    {
      id: "want",
      label: "Discretionary Want",
      shortHint: "Adds comfort, can wait if funds are limited",
      accent: "lilac",
    },
  ],
  items: [
    {
      id: "item-bus-pass",
      prompt: "Monthly bus pass to travel to school and coaching classes every weekday.",
      contextNote: "Monthly Transportation",
      expectedCategoryId: "need",
      explanation: {
        whyItFits: "Regular travel to school directly supports daily education and attendance.",
        whatToNotice: "Going without transport directly impacts schooling and cannot be skipped without consequences.",
        clueForNextTime: "Ask: 'Does skipping this harm my basic health, safety, or schooling?'",
      },
      outcomeTags: ["essential-transport", "education-need"],
    },
    {
      id: "item-gaming-headset",
      prompt: "A branded gaming headset to chat with classmates after school.",
      contextNote: "Personal Electronics",
      expectedCategoryId: "want",
      terms: [
        {
          term: "Opportunity Cost",
          plainMeaning: "The next best thing you give up when you choose to spend money on one purchase instead.",
          whereYouSeeIt: ["Budgeting decisions", "Choosing between saving vs buying today"],
          example: "Spending ₹2,000 on a headset means ₹2,000 less for your upcoming exam fee or emergency savings.",
          whyItMattersHere: "Recognizing wants helps you decide which purchases can wait until your essential needs are funded.",
        },
      ],
      explanation: {
        whyItFits: "While social and enjoyable, existing audio earphones work, and upgrading can be postponed if savings are needed.",
        whatToNotice: "Comfort items bring happiness, but living safely does not depend on having this brand.",
        clueForNextTime: "Ask: 'Can this purchase wait another month without causing an emergency?'",
      },
      outcomeTags: ["discretionary-upgrade", "peer-comfort"],
    },
    {
      id: "item-fever-medicine",
      prompt: "Doctor-prescribed medication for a sudden high fever.",
      contextNote: "Healthcare",
      expectedCategoryId: "need",
      explanation: {
        whyItFits: "Health recovery and prescribed treatment are fundamental survival needs.",
        whatToNotice: "Delaying essential medical treatment harms health and often leads to higher emergency costs later.",
        clueForNextTime: "Essential healthcare always takes priority in an emergency fund.",
      },
      outcomeTags: ["health-necessity", "emergency-reserve"],
    },
  ],
};
