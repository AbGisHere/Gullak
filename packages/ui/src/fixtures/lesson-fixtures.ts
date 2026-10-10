import type { TopicLessonData } from "../components/topic-lesson";

/**
 * Example demo fixture: "Emergency Fund & Fixed Deposits".
 * Demonstrates: EXPERIENCE -> NOTICE -> DECODE -> UNDERSTAND -> DECIDE -> TRANSFER -> RECAP.
 * Development/demo fixture only — strictly isolated in packages/ui/src/fixtures.
 */
export const exampleEmergencyFundLesson: TopicLessonData = {
  id: "emergency-fund-fd-lesson",
  topicId: "emergency-fund",
  pillar: "save-manage",
  gradeGroup: "grade-8-10",
  title: "Emergency Funds & Locked Deposits",
  steps: [
    {
      id: "step-1-intro",
      type: "intro",
      title: "When Surprises Cost Money",
      sectionLabel: "Start",
      character: {
        variant: "blob",
        pose: "pondering",
        expression: "curious",
        accent: "lime",
        label: "Curious learner",
      },
      hook: "Imagine you put all your savings into a locked Fixed Deposit for 12 months to earn high interest. Then two weeks later, your school laptop screen cracks. What happens next?",
      estimatedMinutes: 4,
      learningPointers: [
        "Why liquidity matters when life throws unexpected expenses",
        "How a Fixed Deposit (FD) locks money for a specific tenure",
        "Balancing locked returns with an accessible emergency reserve",
      ],
    },
    {
      id: "step-2-experience",
      type: "experience",
      title: "The Broken Laptop Screen",
      sectionLabel: "Experience",
      contextNote: "A real financial dilemma",
      scenario:
        "Aarav saved ₹10,000 from birthdays and internships. To earn interest, he placed all ₹10,000 into a 1-year Fixed Deposit. In Month 2, his screen broke during exam week, requiring ₹4,000 for immediate repair.",
      dilemmaPrompt:
        "The bank branch tells Aarav that pulling money out early triggers a premature withdrawal penalty and forfeits the promised interest.",
      terms: [
        {
          term: "Fixed Deposit",
          expandedName: "Term Deposit / FD",
          plainMeaning:
            "A deposit where money is locked with a bank for a fixed duration in exchange for a fixed interest rate.",
          whereYouSeeIt: ["Bank branches", "Banking mobile apps", "Postal savings"],
          example: "Depositing ₹10,000 in a 1-year FD at 6.5% interest.",
          whyItMattersHere: "FDs offer safety and guaranteed interest, but money is committed for the agreed duration.",
        },
      ],
    },
    {
      id: "step-3-notice",
      type: "notice",
      title: "Notice the Trade-off",
      sectionLabel: "Notice",
      observationText:
        "Aarav had money, but none of it was liquid. Committing 100% of savings to a locked tenure meant an unexpected expense forced a costly decision.",
      guidingQuestion: "Why is having savings different from having accessible cash?",
      keyTakeaway:
        "Higher return instruments often trade off immediate access. An emergency reserve provides access without breaking investments.",
      terms: [
        {
          term: "Liquidity",
          plainMeaning: "How quickly and easily you can convert an asset into spendable cash without losing value.",
          whereYouSeeIt: ["Savings accounts (high liquidity)", "Fixed deposits & real estate (lower liquidity)"],
          example: "Cash in your wallet is 100% liquid; land or locked FDs are illiquid.",
          whyItMattersHere:
            "Emergency expenses require high liquidity so you don't face penalties or distress selling.",
        },
      ],
    },
    {
      id: "step-4-decoder",
      type: "decoder",
      title: "Decode The Core Terms",
      sectionLabel: "Decode",
      introduction: "These two concepts work together to protect your finances from sudden surprises.",
      terms: [
        {
          term: "Emergency Fund",
          plainMeaning:
            "A pool of readily accessible savings kept strictly for unpredictable, urgent expenses like medical bills or critical repairs.",
          whereYouSeeIt: ["High-interest savings accounts", "Liquid mutual funds", "Cash reserves"],
          example: "Keeping ₹5,000 in a savings account untouched until a genuine emergency hits.",
          whyItMattersHere:
            "Having an emergency fund means you never have to break locked FDs or borrow money at high interest.",
        },
        {
          term: "Tenure",
          expandedName: "Agreed Deposit or Loan Duration",
          plainMeaning: "The agreed length of time an investment stays locked before it reaches maturity.",
          whereYouSeeIt: ["FDs (e.g. 12-month tenure)", "Recurring deposits", "Loan repayment periods"],
          example: "A 1-year FD has a 12-month tenure.",
          whyItMattersHere: "Ending an investment before the tenure completes usually incurs a penalty.",
        },
      ],
    },
    {
      id: "step-5-worked-example",
      type: "worked-example",
      title: "Locked vs Balanced Allocation",
      sectionLabel: "Worked Example",
      scenarioDescription:
        "Compare what happens when an unexpected ₹4,000 expense arrives under two different savings strategies:",
      comparisonItems: [
        {
          title: "Strategy A: 100% Locked in FD",
          details: [
            "₹10,000 locked for 12 months",
            "Emergency hits: Must break entire FD early",
            "Penalty deducted: 1% interest penalty applied",
            "Total friction: Investment destroyed prematurely",
          ],
        },
        {
          title: "Strategy B: Balanced Emergency Buffer",
          details: [
            "₹5,000 liquid Emergency Fund in savings account",
            "₹5,000 locked in 12-month FD",
            "Emergency hits: Pay ₹4,000 from liquid buffer",
            "FD continues earning interest uninterrupted",
          ],
          highlight: "Preserves Investment Growth",
        },
      ],
      lessonLearned: "An emergency buffer protects your long-term investments from being broken during life surprises.",
    },
    {
      id: "step-6-transfer",
      type: "transfer",
      title: "Applying to a New Scenario",
      sectionLabel: "Transfer",
      newContextDescription:
        "Priyan plans to start college next semester. She has ₹25,000 saved from tutoring. Her friends suggest putting all ₹25,000 into a 3-year locked deposit for the highest rate.",
      transferQuestion: "What should Priyan evaluate before choosing a 3-year tenure for all her money?",
      options: [
        "Keep 1-2 months of living expenses in an accessible buffer first, then lock the rest",
        "Lock 100% into the 3-year deposit because returns are the only priority",
        "Never use Fixed Deposits under any circumstances",
      ],
      takeaway:
        "Always calculate upcoming cash needs and an emergency buffer before locking capital into a multi-year tenure.",
    },
    {
      id: "step-7-recap",
      type: "recap",
      title: "Summary Principles",
      sectionLabel: "Recap",
      summaryText:
        "Financial resilience comes from matching the liquidity of your money to the timeline of your needs.",
      keyPrinciples: [
        "Liquid Emergency Funds handle immediate, unpredictable shocks without penalties.",
        "Fixed Deposits grow savings safely when you are certain you won't need the money during the tenure.",
        "A healthy financial plan combines both: safety first, then locked growth.",
      ],
      nextRecommendationNote: "Try the Spot & Sort round on Needs vs Wants to practice categorizing expenses.",
    },
  ],
};
