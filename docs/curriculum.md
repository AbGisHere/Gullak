# Curriculum

Gullak is an eight-world financial-learning journey for Indian students in Classes 6–12. It starts with familiar choices—candies, pocket money, toys, and school supplies—and progressively introduces banking, markets, investing, personal finance, and entrepreneurship.

> **Guardrail:** Every balance, transaction, investment, reward and outcome is virtual. Gullak teaches decision-making; it never recommends a real product or tells a learner to buy or sell. Rewards recognise reasoning, risk awareness, diversification and reflection—not the largest short-term return.

## Learner stages

The worlds are shared, not separate courses. A learner's class group changes the vocabulary, numbers, scenario realism and depth.

| Stage | Classes | Learning style |
|---|---|---|
| Foundation Explorers | 6–7 | Visual, short, familiar examples and simple arithmetic |
| Money Navigators | 8–9 | Pocket money, shops, bank accounts, digital payments and simple markets |
| Financial Strategists | 10–12 | Salaries, portfolios, business choices, uncertainty, taxes, loans and trade-offs |

Onboarding records class group, current experience and preferred formats. Older learners may complete a placement challenge to skip mastered introductions. Every lesson remains 3–5 minutes; longer simulations are divided into short segments.

## The learner loop

Every lesson follows this cycle:

**Experience → Decide → Observe consequences → Understand → Apply → Review**

1. Start with a familiar scenario, not a definition.
2. Ask the learner to make a meaningful choice.
3. Show the result and allow recovery from mistakes without shaming.
4. Reveal the real financial term in simple language.
5. Ask the learner to apply it in a new scenario.
6. End with a short recall activity, XP, progress update and next unlock.

## The eight worlds

| World | Theme and final challenge | Core mechanics |
|---|---|---|
| 1. **The Candy Economy** | Money, barter, prices, needs, wants, scarcity, opportunity cost, earning, spending and saving. Final: complete a shopping day with limited Candy Coins while covering needs and saving some. | Barter chain, limited-coin shop, need/want sort, price comparison, earning missions |
| 2. **The Savings Quest** | Pocket money, expenses, goals, budgets, delayed gratification, emergency savings and tracking. Final: reach a desired purchase while handling an unexpected expense. | Budget allocation, savings streak, goal tracker, event cards |
| 3. **Bankopolis** | Bank accounts, deposits, withdrawals, interest, cards, UPI, statements, PIN/OTP safety and scams. Final: manage a virtual account and spot suspicious activity. | Mock UPI payment, transaction matching, statement puzzle, scam spotting |
| 4. **Market Mayhem** | Buyers, sellers, supply and demand, costs, prices, profit, discounts, competition and inflation. Final: run a shop through changing demand and costs. | Virtual shop, inventory, price setting, demand events, profit/loss |
| 5. **Grow Your Money** | Saving versus investing, simple and compound interest, time, inflation, risk, fixed deposits, diversification and goal horizons. Final: plan for three goals with different timeframes. | Money-growth simulator, inflation comparison, goal planner, risk scenarios |
| 6. **Stock Street** | Companies, shares, exchanges, indices, dividends, volatility, mutual funds, SIPs, ETFs and diversification. Final: explain a virtual portfolio for a fictional goal and risk profile. | Fictional-company cards, paper portfolio, market correction, diversification review |
| 7. **Life Simulator** | Salary, taxes, monthly budgets, essential costs, emergency funds, credit, loans, EMIs, insurance, fraud and long-term goals. Final: manage six simulated months while remaining stable. | Month-by-month life sim, bills, emergency events, EMI affordability, scam decisions |
| 8. **Finance Tycoon** | Startup capital, business models, revenue, costs, cash flow, assets, liabilities, break-even, ROI, loans, allocation and economic cycles. Final: operate a business responsibly across simulated periods. | Business builder, inventory, staffing, cash-flow view, supply shocks and expansion choices |

## Standard lesson structure

Each lesson data entry contains:

- title, world, stage variants, objective and estimated duration;
- narrative hook and interactive mechanic;
- decisions, outcomes, supportive feedback and recovery path;
- concept reveal, application challenge and review questions;
- XP, mastery signal, world/lesson unlock and optional reward;
- English, Hindi and Telugu content.

## Reusable mechanics

- Drag-and-drop budgeting
- Branching decision stories
- Virtual shop and business simulation
- Money-growth and inflation simulators
- Paper-portfolio and fictional-company scenarios
- Life-event cards
- Spot-and-sort rounds: need/want, scam/real, safer/riskier

Mechanics are implemented once; worlds, lessons, scenarios, translations and difficulty variants are data.

## Where today's topics go

The app still runs the 33 topics of the earlier four-pillar plan (`packages/content/config/topic-graph.json`). None of that teaching is dropped: each topic becomes lessons in one world, keeping its id until the content migrates. Finance Tycoon is new content.

| World | Today's topic ids |
|---|---|
| 1. Candy Economy | `money-basics`, `needs-vs-wants`, `opportunity-cost` |
| 2. Savings Quest | `making-a-budget`, `setting-goals`, `saving-habit`, `tracking-spending`, `emergency-fund` |
| 3. Bankopolis | `bank-accounts-upi`, `recurring-deposit`, `protect-your-info`, `upi-and-phishing-scams`, `report-a-fraud` |
| 4. Market Mayhem | `prices-and-inflation` |
| 5. Grow Your Money | `compounding`, `fixed-deposit`, `ppf-small-savings`, `risk-and-return`, `gold`, `money-market`, `bonds`, `debt-funds`, `future-goals` |
| 6. Stock Street | `stocks`, `mutual-funds-sip`, `index-funds-etfs`, `diversification`, `market-ups-and-downs`, `too-good-to-be-true` |
| 7. Life Simulator | `borrowing-and-credit`, `insurance-basics`, `retirement-nps`, `fake-apps-and-loans` |
| 8. Finance Tycoon | new lessons |

## Fund categories

Every mutual fund category in India (SEBI's categories plus SIFs, 61 in all) is reference data: `packages/content/config/fund-categories.json` holds each category's group, paper-portfolio instrument and coarse risk band, and `fund-categories/<locale>.json` holds its name, a plain summary and what to watch out for, in English, Hindi and Telugu. Learners meet the groups in Classes 8–9 and the full list in Classes 10–12. Educational only: no category or fund is ever called good, best or recommended.

| World | Groups | Categories |
|---|---|---|
| Grow Your Money | Debt, gold | Overnight, liquid, ultra short duration, low duration, money market, short duration, short and mid term, medium duration, medium to long duration, long duration, dynamic bond, corporate bond, credit risk, banking and PSU, gilt, gilt with 10-year constant maturity, floater, index (debt); gold ETFs |
| Stock Street | Equity, index and ETF, hybrid, sector and thematic, fund of funds, specialised | Large cap, large and mid cap, multi cap, flexi cap, focused, value, contra, mid cap, small cap, dividend yield; index (NIFTY 50, NIFTY Next 50, Sensex, others), index ETFs, other ETFs; arbitrage, equity savings, conservative hybrid, balanced advantage, dynamic asset allocation, aggressive hybrid, balanced hybrid, multi asset allocation; sectors (banking and financial services, infrastructure, auto, energy and power, pharma, consumption, services, technology), thematic (global, MNC, others); fund of funds (domestic, overseas, others); SIFs |
| Life Simulator | Tax and solution-oriented | ELSS (tax saving with a lock-in), children's funds, retirement funds |

The `teachingTopic` field in the config still names today's topic ids; it moves to lesson ids with the content migration.

## Company report card

Planned for Stock Street. Sites such as Screener show hundreds of numbers for every listed company; Gullak explains **every one of them**. They come from about 100 base metrics, each offered over several time windows (latest quarter, TTM, last year, 3/5/7/10-year averages and growth), so learners learn the windows once and each base metric on its own. The full catalogue, with what each metric tells you, how it is worked out and its stage, is in [company-metrics.md](company-metrics.md).

- **Fictional companies only:** the same fact sheets the class market uses. Never real companies, and never data copied from those sites.
- **Finance Tycoon** produces the same report card from the learner's own business, so each number is something they have built.
- **Data, not code:** each metric is a config entry (group, stage and the `@gullak/engine` function that computes it) plus per-locale text: what it measures, how it is worked out, its usual misreading, and why no single number decides anything. The existing `MoneyDecoder` component shows each term.
- **No cut-offs:** learners compare a number with the company's own history and its industry, never against "cheap" or "expensive" thresholds.

## Learn by doing: three engines

Each engine is coded once in `packages/engine` (pure, tested) with a renderer in `apps/web`. Every scenario is data.

| Engine | What the learner does | Worlds | Data |
|---|---|---|---|
| **Life + market sim** (Practice and Live) | Lives month by month: money comes in, they split it into needs, wants and savings and put savings into whatever they've unlocked (piggy bank, RD, FD, gold, funds). Life events hit and they must raise cash: emergency fund, break the FD early, or sell units at that day's price | Savings Quest, Grow Your Money, Stock Street, Life Simulator | Episodes, personas, an event deck with odds and money effects, instruments, real price series |
| **Story choices** | Short branching stories (a friend's "doubling" scheme, a first salary); every choice shows its consequence, then try again | All eight | A graph of story nodes, choices and effects |
| **Spot & sort** | Quick swipe rounds: need or want, scam or real, riskier or safer | Candy Economy, Bankopolis, Stock Street | Items with the correct answer and an explanation |

Plus a **what-if sandbox**: sliders over engine formulas (start an SIP at 15 vs 25, ₹100 then vs now with real CPI), reusing each lesson's formula variant.

### Practice vs Live

One portfolio, one set of instruments and the same engine maths (valuation, FD/RD early-exit rules, buying and selling units). Only the clock and the price source differ. Both use play money.

| | **Practice** (simulation) | **Live** (paper trading) |
|---|---|---|
| Clock | Replays real history, with speed control | The real calendar, one trading day per day |
| Prices | Committed snapshots | Current prices from the market-data adapters (snapshot fallback, as-of date shown) |
| Life events | From the event deck, plus events an episode schedules | Optional, e.g. one random event a week |
| Tomorrow | Known, so it can be revealed | Unknown |
| Afterwards | Reveal: the learner's choice side by side with the alternatives | A review of their habits over time; no hindsight |
| Purpose | Learn and make mistakes safely | Test what they learned when nobody knows tomorrow |

- **Episodes are data:** a date range, the instruments open in it, scheduled events, random-event odds and a narrative. The flagship demo episode is **March 2020 + a hospital bill**: raise ₹15,000 by spending the emergency fund, breaking the FD (penalty, "it would have matured in 2 days") or selling the index fund at the bottom ("here's where it was 3 months later"). More episodes: 2008, demonetisation (2016), gold in 2020, the 2022 rate rises.
- **Every stage plays it** through unlocks: Foundation Explorers (Classes 6–7) hold a piggy bank and an RD and feel the RD exit penalty; Financial Strategists (Classes 10–12) face March 2020 with funds and gold.
- **The reveal never teaches timing the market.** It always ends on the same lesson: nobody knew tomorrow, and the learner with an emergency fund didn't have to choose.
- **Live opens after Practice:** an instrument becomes available in Live once the learner has finished a Practice episode with it.
- **Live scores habits, never returns:** emergency fund kept, money spread out, plan followed, no panic selling. There is no returns leaderboard. Example funds are named only as examples, with no "buy" prompts and no broker links.
- **Demo:** lead with the Practice episode; show Live briefly as "the same portfolio on today's real prices".

## The storyline: Nani's Gullak

The story is what holds Gullak together: one series that grows up with the learner across the eight worlds and remembers every money choice they make. Games, simulations, missions and the portfolio all hang off it.

**The setup.** Nani has kept the family's savings in an old clay gullak for twenty years. In the opening scene a friendly caller "from the bank" talks her into sharing an OTP, and the family's emergency money is gone. The learner finds the broken gullak and sets out to rebuild it and protect the family. The gullak comes alive as **Gullu**, the learner's companion, world guide and narrator. Gullu is also the voice of the AI tutor, so the tutor has a personality and a reason to be there.

**The cast** lives in one fictional Hyderabad lane, written in a mix of Telugu, Hindi and Dakhni:

| Character | Role in the story | Teaches |
|---|---|---|
| **Nani** | Trusts cash and gold, distrusts banks; learns alongside the learner | saving, bank accounts, gold vs gold loans, scams aimed at elders |
| **Amma** | Runs a tiffin business, moving to UPI | budgeting, prices and inflation, UPI safety, small-business cash flow |
| **Nanna** | Auto driver with an uneven income | budgeting in uneven months, emergency fund, insurance |
| **Elder sibling** | Wants a bike on EMI, pulled into an instant-loan app | borrowing, true cost of credit, fake loan apps |
| **Best friend** | Chases a "double your money" group | risk and return, Ponzi schemes, diversification |
| **Ravi uncle** (kirana) | Runs on udhaar and credit | cash flow, credit, keeping records |
| **Lucky Bhai** | A charming scam network that returns in every world in a new disguise (doubling scheme, fake KYC call, loan app, stock-tip group) | every scam lesson, in every world |

**One arc per world.** The worlds replace the earlier three seasons. A learner's stage changes how deep each arc goes, not which arcs they see.

| World | Arc | Real event revealed afterwards |
|---|---|---|
| 1. Candy Economy | Gullu and the learner run the lane's candy swaps and first shop day to win back the family's trust with money | — |
| 2. Savings Quest | Rebuild Nani's savings goal while surprise costs keep arriving; talk Nani into keeping an emergency fund | — |
| 3. Bankopolis | Open the family's first bank account, move Amma to UPI, stop Lucky Bhai's fake KYC call; Nani's hidden cash is suddenly no longer valid | Demonetisation (2016) |
| 4. Market Mayhem | Amma's tiffin costs rise and she has to reprice without losing customers | Food inflation in real CPI data |
| 5. Grow Your Money | Nani's gold vs a gold loan vs an FD for three family goals | Gold's 2020 jump, the 2022 rate rises |
| 6. Stock Street | The best friend's stock-tip group; the markets crash just as a ₹15,000 hospital bill arrives | The March 2020 crash and lockdown |
| 7. Life Simulator | Nanna's uneven months, the sibling's loan-app trap, insurance and planning for the parents' old age | — |
| 8. Finance Tycoon | Grow Amma's tiffin into a business; a finale whose ending comes from every choice made | — |

**Story rules:**

1. **No fixed years inside the story.** The story says "the markets crash", not "March 2020", so it never feels like a history lesson.
2. **"FYI, this really happened."** Once an arc ends, Gullu reveals the real event it mirrored, with real data and sources. The learner can then replay it as a Practice episode on real price history and see how their choices would have played out.
3. **It remembers.** Choices set story state that carries across lessons and worlds. Whether the learner convinced Nani to keep an emergency fund in Savings Quest decides how hard the hospital bill hits in Stock Street.
4. **Learning happens inside the story.** Quiz questions become story decisions (to stop Lucky Bhai, the learner must spot the red flags). Passing a lesson unlocks the real instrument in the paper portfolio, e.g. a virtual RD in Bankopolis and an SIP in Stock Street.
5. **The other you.** At big decisions Gullu shows the parallel self who chose differently, on the same numbers (Money Multiverse, below).
6. **Into real life.** Some episodes end with Nani asking a question; the take-home mission is answering it with the learner's own parent.
7. **Weekly cliffhangers** ("Nanna's phone rings: 'Your electricity will be cut tonight unless…'"). The next chapter opens after the related lesson.
8. **Multiple endings.** The finale's family future (savings, debt, safety) comes from every choice the learner made, so there's a reason to replay.
9. **Side games reuse the cast:** scam drills use Lucky Bhai's messages, comics use the same characters, and "Teach Gullu" has the learner correct Gullu's mistakes.

All of it is data on the story-choices engine: chapters, nodes, choices, effects on story state, and links to lessons, Practice episodes and missions. The cast, lane and events are fictional; only the FYI reveals use real events and data.

## What makes Gullak different

Games are in the problem statement, so every team will build them. Our games are how students learn, not what sets us apart. Gullak stands out in five ways:

1. **One story that remembers every choice:** Nani's Gullak (above), running through all eight worlds from Class 6 to 12.
2. **One continuous money life, not separate mini-games.** One portfolio from Class 6 to 12 on real Indian prices. Every lesson passed unlocks the next instrument, so every investment is something the learner has just learnt. Existing arcades (e.g. NGPF Arcade: separate games on US topics such as credit scores, college loans and car deals, in English, with made-up numbers and the same game for everyone) start from zero each time.
3. **The student becomes the family's money teacher.** Take-home missions put a learner and a parent through the same lesson, so one student protects a whole household. We measure reach in **households**, not just students.
4. **Built for real conditions:** a phone shared by the family, little or no data, Telugu or Hindi at home.
5. **A habit, not an addiction:** 2 minutes a day on real prices, with a Gullak that grows only when the learner's habits do.

Pitch line: *"Everyone built a game for a student. We built a way for one student to protect their whole family."*

## Money Multiverse

Every big decision in the life + market sim splits the learner's life. They keep living their own path, while a **parallel self** lives the other choice on the same real price history. Both lives can be opened side by side at any time, not only at the end of an episode.

- Built on the counterfactual replay engine: both branches start from identical states and differ only by the choice.
- Old choices come back later: "Remember when you skipped the emergency fund in October? Your parallel self just used theirs."
- The same rule as the reveal applies: it never teaches timing the market. Nobody knew tomorrow, and the emergency fund meant you didn't have to choose.

## Class market: the class sets the price

A multiplayer version of the market sim. In Practice and Live the prices come from real data; in the class market they come from the **students' own orders**.

- The teacher opens a room. A few **fictional** companies are listed (a chai stall chain, a cricket-bat maker, a UPI startup), each with a short fact sheet.
- Every buy or sell order moves the price in real time through a simple order book. The teacher drops news cards ("monsoon fails", "a WhatsApp rumour", "results beat estimates"), and the class creates its own bubbles, panics and herd behaviour.
- **Unlocks still apply:** a learner can only use an order type (SIP, limit, stop-loss) or list a company after passing the lesson that teaches it.
- **The reveal:** the class's own price chart is laid over a real episode, e.g. NIFTY 50 in March 2020: "You just did what India did."
- **Scored on habits, never profit:** diversified, stuck to a plan, didn't panic-sell, checked the fact sheet before buying. No leaderboard of returns or balances.
- **Demo:** judges join from their phones alongside about 20 bot classmates.
- Never real companies, and never students or classmates as tradable "stocks".

Classroom stock games usually trade on real prices, and markets where prices come from the players' orders exist in economics lab experiments; we haven't found one packaged as a school learning product in India.

## More ways to learn, beyond the engines

Every lesson can render in eight formats (video, story/comic, visual with real-data charts, formula + live calculator, transcript, audio, simulation, quiz), and the format bandit picks among them. These modes add to that. Each one reuses lesson content, the engine and `@gullak/ai`, and reports evidence to knowledge tracing.

### Learning by talking
- **AI tutor in the learner's language:** voice or text in English, Hindi, Telugu or Hinglish. It asks "why do you think so?" back instead of only answering. Guardrails as in AGENTS.md.
- **Teach the AI:** an AI "classmate" makes typical misconceptions (from the lesson's curriculum entry) and the learner corrects it. Explaining something is one of the strongest ways to learn it.
- **Interview missions:** ask a shopkeeper how they take UPI, or a grandparent what a kilo of rice cost in 1995. The answer is compared with real CPI data. Recordings stay on the device unless the learner chooses to share them, and missions never ask for income, account details, OTPs or PINs.

### Learning from real life
- **Kitna? lens:** point the camera at a price tag, ad or EMI offer. Gullak shows what the price means, never whether to buy it: days of a typical wage, weeks at the learner's own saving rate, what the same money could become in an RD at today's rates (labelled as an assumption), and the true cost of a "no-cost EMI". Images aren't stored. Wage figures come from a cited source, never from asking about family income.
- **Pocket-money diary:** log real spending in 10 seconds and tag each item as a need or a want. Gullak finds the patterns and suggests the next lesson: a self-reported version of the Account Aggregator idea, with no bank data.
- **Money in the news:** when the RBI changes rates or gold hits a record, a 1-minute "what this means for you" card tied to a lesson.
- **Real documents, explained:** a bank passbook, FD receipt, UPI receipt, payslip and loan form, each with tap-to-explain labels (sample documents only, never the learner's own).

### Learning by doing outside the app
- **Take-home missions:** after a lesson, a 5-minute mission to do with a parent ("Show Amma how to tell a UPI collect request from a payment"), with Telugu or Hindi audio and a 3-question check the parent answers on the same phone. A parent who passes counts as a **household reached** on the facilitator dashboard.
- **Savings challenges:** "save ₹10 a day for 30 days" in a real gullak at home, with a daily check-in.
- **Class projects:** run a stall at the school mela with a real budget, costs and profit, logged in Gullak.

### Learning together
- **Debate cards:** "Gold or FD for a 3-year goal?" Learners argue each side with evidence. The point is the trade-offs, not a right answer.
- **Peer explainers:** 30-second explanations recorded by learners; the best, approved by the teacher, become content for the next batch.

### Learning that stays
- **Spaced recall:** a quick question two days later, then a week later; knowledge tracing picks what to repeat.
- **"Why this?":** every recommendation says why ("You mixed up simple and compound interest last time").
- **Concept map:** the world map shown as a skill tree that fills up.

## More games and stories

All as data for the existing engines (life + market sim, story choices, spot & sort), unless marked as a new screen.

- **Live India's real money moments:** Practice episodes for demonetisation night (2016), March 2020, gold in 2020 and the 2022 rate rises, each with life events (a fee due, a phone breaks, a job loss at home).
- **Play the other side:** *Be the bank* (run a village bank: take deposits, lend, set rates, survive a bank run, so interest makes sense) and *Think like a scammer* (design a fake "double your money" scheme in a sandbox and see who falls for it, to learn the red flags). NGPF already has games where you play the lender or the dealer, so these are features, not headline USPs.
- **Scam drills, like fire drills:** a realistic fake SMS, WhatsApp message or UPI collect request appears during normal play. The learner must spot it and say how to report it (1930, cybercrime.gov.in), then gets a debrief. Drills are clearly marked as drills once they're over.
- **Wheel of life events:** a quick game inside Practice where a spin decides this month's surprise (good or bad), and the learner's emergency fund decides how much it hurts.
- **Month-end challenge:** get through the month on a pocket-money or stipend budget.
- **Borrowing cards:** a card game comparing an informal moneylender, a bank loan and buy-now-pay-later on the true cost.
- **You are the ₹500 note:** a story told from the money's side: a wallet, a bank (lent out, which explains interest), a loan, a scammer's mule account, then worn down by inflation. Each stop is a lesson.
- **The recurring cast** of Nani's Gullak appears in every story, comic and game, so it all feels like one series.

## Habit design: built to come back to, never addictive

Learners are 11–17 and the subject is money, so engagement must model financial discipline. The daily loop: **open the app → the Gullak reacts → today's real market move → a 2-minute drop → the Gullak grows.**

- **A living Gullak:** each learner's piggy bank is a character that grows, changes look and evolves with their **habits** (a 7-day saving streak, an emergency fund, 10 scams spotted), never with spending or luck. It reacts to what they do. If they're away, it waits; it never dies or guilt-trips.
- **Something real every day:** the Live portfolio moves with real prices, and each move is a micro-lesson ("Gold went up 1.2% overnight. Your gold units are worth ₹46 more. Why? 40 seconds").
- **The 2-minute daily drop:** one question, one scam to spot or one "what would you do?", then it's finished for the day.
- **Streaks with forgiveness:** a missed day can be covered by a streak saver earned by saving, so no data for a day is never a punishment.
- **Stories with cliffhangers:** one chapter a week; the next chapter opens after the related lesson.
- **Collections:** historical Indian notes and coins with their stories (one per lesson), a Scam Hunter card deck (rarity by how hard the scam is to spot), and the skill tree.
- **Friends and class without money competition:** class goals ("our class spotted 500 scams this week"), duels on the same 5 questions, gifting a streak saver. Leaderboards only for learning and habits, never for returns or balances.
- **Surprise, but never gambling:** surprise events (a festival bonus, a sudden expense, a crash) are always lessons inside the sim, never prizes to pull for.

**Never:** loot boxes or random paid rewards, guilt or fear notifications, endless feeds, notifications at night or during school hours, or leaderboards of money or returns.

## Built for shared phones and no data

- **Several profiles on one phone,** with quick switching and a clear way to sign out or reset (see PRODUCT.md, Privacy).
- **Offline and audio-first:** lessons are cached, audio works with the screen off, and everything is sized for cheap Android phones.
- **Lesson packs travel:** a pack can be shared over WhatsApp or Bluetooth, so one download reaches many phones.

## Demo picks

Lead with **Nani's Gullak**: the opening scene (the OTP scam) and a Candy Economy choice, a story decision that unlocks an instrument, then the "FYI, this really happened" reveal and replay on real data. Then the adaptive loop, and the features other teams are least likely to have: **the other you** at a big decision, **the class market** (judges join), **a take-home mission** (a judge plays the parent; "households reached" ticks up), **Teach the AI**, **the Kitna? lens** and **the living Gullak's daily loop**.

## Evidence and adaptation

The demo story is the adaptive loop: **evidence → recommendation → activity → simulation → mastery update → changed recommendation.**

- **Current experience** (onboarding) only sets the starting prior. Skill level comes from evidence: quizzes, activities and simulation decisions (did they keep an emergency fund, did they panic sell) all report to knowledge tracing.
- Mastery drives recommendations and reviews; it never gates progress. Passing a lesson's check unlocks the next lesson (today: quiz pass marks). Mastery-based unlocks wait for parameters fitted on real Gullak answers.
- The format bandit learns which formats work for each learner from what they finish and how they do. Facilitators can assign any activity to a class.

## Real data behind every topic

The "Used by" column names today's topic ids; [Where today's topics go](#where-todays-topics-go) maps each one to its world.

Learners play with real Indian numbers, not made-up ones. Every value carries its source and as-of date, comes from a script in `scripts/snapshots/` (or a hand-checked CSV with source URLs), and is committed so the demo works offline. Nothing is typed into code. Detail and status: [data/snapshots](../data/snapshots/README.md).

| Data | Source | Used by |
|---|---|---|
| CPI, headline and by group (food, fuel, education, health) | MoSPI CPI (Combined) | `prices-and-inflation`, `future-goals`, "real" returns, what-if (₹100 then vs now), life-sim prices |
| Household spending by category | MoSPI Household Consumption Expenditure Survey 2022–23 | `making-a-budget`, `tracking-spending`, life-sim personas |
| Savings account, FD and RD rates | Banks' published rate pages (hand-checked CSV, dated) | `bank-accounts-upi`, `fixed-deposit`, `recurring-deposit`, paper portfolio |
| Small-savings rates (PPF, SSY, NSC, post office) and their history | Ministry of Finance quarterly notifications | `ppf-small-savings`, goal engine |
| RBI repo rate history | RBI | `borrowing-and-credit`, `bonds`, why rates move |
| Loan and credit-card interest rates | Banks' published rate pages, RBI | `borrowing-and-credit`, story choices (easy loans) |
| UPI volumes | NPCI monthly statistics | `bank-accounts-upi` |
| Average earnings by type of work (regular wage, casual labour, self-employed) | MoSPI Periodic Labour Force Survey | Kitna? lens ("days of a typical wage"), life-sim personas |
| Mutual fund NAVs by category: liquid, overnight, money market, debt, index, equity, ETFs | AMFI (same script, one scheme code per example) | `money-market`, `debt-funds`, `mutual-funds-sip`, `index-funds-etfs`, `diversification`, life + market sim |
| Index history: NIFTY 50 (and TRI), Next 50, Midcap 150, a few sectors | NSE Indices | `stocks`, `index-funds-etfs`, `diversification`, Practice episodes |
| A few example stock prices | NSE end-of-day data | `stocks`, `risk-and-return` |
| Gold price (₹/gram) | IBJA, RBI DBIE | `gold`, `diversification`, life + market sim |
| T-bill and 10-year G-sec yields | RBI DBIE | `money-market`, `bonds`, `risk-and-return` |
| NPS scheme NAVs | NPS Trust | `retirement-nps` |
| Real scam patterns and advice | RBI (Sachet, "BE(A)WARE"), I4C / cybercrime.gov.in, NPCI safety guidance | Bankopolis and every scam lesson, spot & sort, story choices |

**Practice episodes** run on these real series: the 2008 crash, demonetisation (2016), the March 2020 crash and recovery, gold's 2020 jump, and the 2022 rate rises (debt fund NAVs vs FD rates). Live mode reads the same sources' current values through the market-data adapters. Life-sim event costs and odds also cite their source (CPI groups, HCES) rather than invented numbers.

Example funds and stocks are only there to practise with play money. Content never calls them good, best or recommended.

## How content gets made

1. **By hand (R5, led by R1):** a curriculum entry per lesson: learning goals, key ideas, common misconceptions, a real-life scenario, quiz goals and grade tags.
2. **Generated once:** the lesson pre-generation script turns each entry into every format × stage × language and caches it. Live LLM calls are only for the tutor.
3. **Reviewed:** R5 checks every generated lesson against the guardrail before it ships. The World 1 slice gets a full hand polish.
