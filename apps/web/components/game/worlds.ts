import {
  Candy,
  Compass,
  Hourglass,
  Landmark,
  type LucideIcon,
  PiggyBank,
  Sprout,
  Store,
  TrendingUp,
} from "lucide-react";

export interface WorldDef {
  id: number;
  slug: string;
  title: string;
  tagline: string;
  setting: string;
  icon: LucideIcon;
  season: 1 | 2 | 3;
  seasonLabel: string;
  topics: string[];
  isLocked: boolean;
  unlockReason?: string;
  accent: "lime" | "yellow" | "coral" | "lilac";
  missionTitle: string;
  missionDuration: string;
  /** True when the world's first mission is playable today; open worlds without one show a "coming soon" state. */
  hasMission?: boolean;
}

export const CURRICULUM_WORLDS: WorldDef[] = [
  {
    id: 1,
    slug: "candy-economy",
    title: "Candy Economy",
    tagline: "Ravi uncle's kirana shop",
    setting: "Local Kirana & Street Corner",
    icon: Candy,
    season: 1,
    seasonLabel: "Season 1 · Class 6–7",
    topics: ["money-basics", "needs-vs-wants", "opportunity-cost"],
    isLocked: false,
    accent: "lime",
    missionTitle: "Gullu Goes Shopping",
    missionDuration: "3 min",
    hasMission: true,
  },
  {
    id: 2,
    slug: "savings-quest",
    title: "Savings Quest",
    tagline: "Nani's household courtyard",
    setting: "Old Hyderabad Courtyard",
    icon: PiggyBank,
    season: 1,
    seasonLabel: "Season 1 · Class 6–7",
    topics: ["saving-habit", "tracking-spending", "setting-goals", "making-a-budget"],
    isLocked: false,
    accent: "yellow",
    missionTitle: "The Leaky Pocket Mystery",
    missionDuration: "4 min",
  },
  {
    id: 3,
    slug: "bankopolis",
    title: "Bankopolis",
    tagline: "The Bank Branch & UPI Stall",
    setting: "Neighborhood Bank & Post Office",
    icon: Landmark,
    season: 1,
    seasonLabel: "Season 1 · Class 6–7",
    topics: ["bank-accounts-upi", "recurring-deposit", "protect-your-info", "upi-and-phishing-scams"],
    isLocked: false,
    accent: "lilac",
    missionTitle: "Nani's First Bank Passbook",
    missionDuration: "5 min",
  },
  {
    id: 4,
    slug: "market-mayhem",
    title: "Market Mayhem",
    tagline: "Sunday street bazaar",
    setting: "Sultan Bazaar",
    icon: Store,
    season: 2,
    seasonLabel: "Season 2 · Class 8–10",
    topics: ["prices-and-inflation", "too-good-to-be-true", "fake-apps-and-loans", "report-a-fraud"],
    isLocked: true,
    unlockReason: "Pass Bankopolis & UPI Safety quiz to enter the Bazaar",
    accent: "coral",
    missionTitle: "Lucky Bhai's Scheme",
    missionDuration: "5 min",
  },
  {
    id: 5,
    slug: "grow-your-money",
    title: "Grow Your Money",
    tagline: "Rooftop plant nursery",
    setting: "Terrace Garden",
    icon: Sprout,
    season: 2,
    seasonLabel: "Season 2 · Class 8–10",
    topics: ["emergency-fund", "fixed-deposit", "ppf-small-savings", "compounding"],
    isLocked: true,
    unlockReason: "Unlock after saving 3 days in Gullak",
    accent: "lime",
    missionTitle: "The Compounding Sapling",
    missionDuration: "6 min",
  },
  {
    id: 6,
    slug: "stock-street",
    title: "Stock Street",
    tagline: "The busy commercial road",
    setting: "Financial District Junction",
    icon: TrendingUp,
    season: 2,
    seasonLabel: "Season 2 · Class 8–10",
    topics: [
      "risk-and-return",
      "mutual-funds-sip",
      "index-funds-etfs",
      "stocks",
      "diversification",
      "market-ups-and-downs",
    ],
    isLocked: true,
    unlockReason: "Master compounding & emergency fund fundamentals",
    accent: "yellow",
    missionTitle: "The Index Rollercoaster",
    missionDuration: "6 min",
  },
  {
    id: 7,
    slug: "life-simulator",
    title: "Life Simulator",
    tagline: "The ₹15,000 Hospital Bill & Crash",
    setting: "Nani's Living Room",
    icon: Hourglass,
    season: 2,
    seasonLabel: "Season 2 · Class 8–10",
    topics: ["borrowing-and-credit", "insurance-basics"],
    isLocked: false,
    accent: "coral",
    missionTitle: "The Financial Twin Dilemma",
    missionDuration: "7 min",
    hasMission: true,
  },
  {
    id: 8,
    slug: "finance-tycoon",
    title: "Finance Tycoon",
    tagline: "Family Future · Planning for Nani & Parents",
    setting: "Clock Tower Terrace",
    icon: Compass,
    season: 3,
    seasonLabel: "Season 3 · Class 11–12",
    topics: ["gold", "bonds", "debt-funds", "money-market", "future-goals", "retirement-nps"],
    isLocked: true,
    unlockReason: "Complete Season 2 Life Simulator to unlock Class 11–12 future planning",
    accent: "lilac",
    missionTitle: "Building Generational Security",
    missionDuration: "8 min",
  },
];
