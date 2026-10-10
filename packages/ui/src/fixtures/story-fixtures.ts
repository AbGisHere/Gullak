import type { StoryScenario } from "../components/story-choices";

/**
 * Example demo scenario fixture: The "Guaranteed High Return" chat group.
 * Development/demo fixture only — used for testing and UI demonstration.
 * Free of real scam details, credentials, or actionable phone numbers.
 */
export const exampleScamStoryScenario: StoryScenario = {
  id: "double-money-scam",
  title: "The 'Guaranteed Quick Return' Offer",
  topicIds: ["too-good-to-be-true", "upi-and-phishing-scams"],
  summaryTakeaway:
    "Treat unusually high or guaranteed returns as a warning sign and verify independently through official channels.",
  initialNodeId: "node-intro",
  nodes: {
    "node-intro": {
      id: "node-intro",
      contextNote: "After classes, Rohit pulls you aside with his phone screen buzzing.",
      dialogue: {
        speaker: "friend",
        text: "Look at this group! My cousin says you put in ₹1,000, and within three days you get back ₹2,000 guaranteed. The admin says slots close tonight!",
        terms: [
          {
            term: "Guaranteed Return",
            plainMeaning: "A promise that your money will grow by an exact amount without any chance of loss.",
            whereYouSeeIt: ["Fixed Deposits (backed by DICGC cover up to ₹5 lakh)", "Government small savings"],
            example: "An FD offering 7% per year is a regulated guaranteed return. A private chat admin offering 100% in 3 days is an extreme warning sign.",
            whyItMattersHere: "In genuine investing, higher potential returns always come with risk. Promises of quick doubling without risk are almost certainly fraudulent.",
            misconception: "Private apps or chat admins cannot legally guarantee quick doubling of money.",
          },
        ],
      },
      protagonistState: {
        variant: "blob",
        pose: "pondering",
        expression: "thinking",
        accent: "lime",
      },
      friendState: {
        name: "Rohit",
        variant: "pillar",
        pose: "celebrating",
        expression: "excited",
        accent: "lilac",
      },
      choices: [
        {
          id: "choice-send-money",
          text: "Send ₹1,000 immediately before the slots close tonight.",
          consequence: {
            title: "Urgent transfer sent under time pressure",
            description:
              "The money left your account immediately via UPI. The admin posted a fake confirmation slip, asked for ₹500 more for 'processing fees', and stopped responding.",
            financialPrinciple:
              "Urgency ('slots close tonight') is designed to prevent critical questions. Once a UPI transfer completes, reversing it without consent is extremely difficult.",
            whatToCheckNext: "Before sending money to unfamiliar recipients, pause and consult a trusted adult or official bank channel.",
            protagonistPose: "cautious",
            protagonistExpression: "concerned",
            friendPose: "cautious",
            friendExpression: "concerned",
          },
          reflection: {
            prompt: "What was the most critical warning sign here?",
            options: [
              "Guaranteed 100% return in 3 days",
              "Urgent deadline to act tonight",
              "Unregistered contact requesting direct UPI transfer",
            ],
          },
          outcomeTags: ["fell-for-urgency", "unverified-transfer"],
          nextNodeId: null,
        },
        {
          id: "choice-ask-proof",
          text: "Ask for entity details and check official registration, while keeping in mind that fraudsters often clone real names.",
          consequence: {
            title: "Pausing to verify documentation and entity claims",
            description:
              "Rohit asked for the registered business name. The admin became evasive, deleted the question, and removed Rohit from the group. Checking official records showed no such authorized investment entity.",
            financialPrinciple:
              "Verifying registration with regulators (like SEBI or RBI) is a vital filter, though not the only one—fraudsters often impersonate legitimate companies. Independent verification on official portals helps detect claims.",
            whatToCheckNext: "Check whether the entity is registered on the regulator's official directory and whether the payment account matches the company name.",
            protagonistPose: "explaining",
            protagonistExpression: "curious",
            friendPose: "pondering",
            friendExpression: "curious",
          },
          reflection: {
            prompt: "Why is asking for official credentials useful?",
            options: [
              "Legitimate companies provide transparent public registrations",
              "Fraudulent operators usually avoid direct verification questions",
            ],
          },
          outcomeTags: ["checked-registration", "paused-under-pressure"],
          nextNodeId: "node-verify-outcome",
        },
        {
          id: "choice-refuse-firmly",
          text: "Explain to Rohit why 100% returns in 3 days are unrealistic and advise pausing.",
          consequence: {
            title: "Comparing the offer to realistic financial growth",
            description:
              "You showed Rohit that even diversified market instruments and regulated deposits take years to double capital. Rohit decided not to send his pocket money.",
            financialPrinciple:
              "Risk and return are inseparable. Understanding realistic growth benchmarks helps identify mathematical impossibilities before committing funds.",
            whatToCheckNext: "Check benchmark return rates from regulated savings and market indexes to evaluate realistic expectations.",
            protagonistPose: "celebrating",
            protagonistExpression: "friendly",
            friendPose: "saving",
            friendExpression: "friendly",
          },
          reflection: {
            prompt: "What helped protect Rohit's money here?",
            options: [
              "Recognizing that higher return requires higher risk",
              "Evaluating realistic growth rates instead of promises",
            ],
          },
          outcomeTags: ["resisted-social-pressure", "spotted-unrealistic-return"],
          nextNodeId: null,
        },
      ],
    },
    "node-verify-outcome": {
      id: "node-verify-outcome",
      contextNote: "The next morning, Rohit comes over with a relieved look.",
      dialogue: {
        speaker: "friend",
        text: "I checked online, and multiple people reported that exact admin account on the national cybercrime portal (1930). Taking that pause saved my pocket money.",
      },
      protagonistState: {
        variant: "blob",
        pose: "celebrating",
        expression: "excited",
        accent: "lime",
      },
      friendState: {
        name: "Rohit",
        variant: "pillar",
        pose: "celebrating",
        expression: "friendly",
        accent: "lilac",
      },
      choices: [
        {
          id: "choice-finish-safe",
          text: "Agree that pausing to verify independently is a habit worth keeping.",
          consequence: {
            title: "Reflective verification habit reinforced",
            description:
              "Both of you recognized that taking time to verify prevents rushed mistakes, especially when promises appear attractive.",
            financialPrinciple:
              "Treat unusually high or guaranteed returns as a warning sign and verify independently through multiple official sources before transferring any money.",
            whatToCheckNext: "Report suspicious financial solicitations to the 1930 cyber helpline or cybercrime.gov.in.",
            protagonistPose: "saving",
            protagonistExpression: "friendly",
            friendPose: "neutral",
            friendExpression: "friendly",
          },
          outcomeTags: ["verified-safely", "financial-safety-habit"],
          nextNodeId: null,
        },
      ],
    },
  },
};
