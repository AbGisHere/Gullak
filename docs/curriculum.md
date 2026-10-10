# Curriculum

The learning map for Gullak, built on the four pillars of the Vanguard problem statement. This is the plan the content, schemas and engines follow; the source of truth is the data in `packages/content`: the prerequisite graph in `config/topic-graph.json`, activities in `activities/` and Practice episodes in `episodes/`.

> **Guardrail:** we educate; we never recommend real products or tell anyone to buy or sell. Simulations are assumptions, not promises. All money is virtual.

## Learners

Primary audience: school students in Grades 6–12, especially from underserved communities in Hyderabad (starting with ~1,500, designed to scale).

Onboarding asks three things, in order (language is picked first via the locale switcher):

1. **Grade group:** `grade-6-7`, `grade-8-10`, `grade-11-12`.
2. **Current experience:** none / some / regular.
3. **How they like to learn (optional):** preferred formats (story, video, visual, formula, simulation, quiz, audio), with **Mix it up** as the default and a Skip. The format bandit adapts from what they actually use.

Current experience sets a starting point only; evidence decides skill level (see [Evidence and adaptation](#evidence-and-adaptation)). Every topic is tagged with the grade groups it suits. A topic can also have depth per grade group (e.g. compounding as a growing piggy bank in Grade 6–7, as a formula in Grade 11–12).

## Structure

- **Pillar → topics → activities.** Topics form a prerequisite graph, not one straight line.
- **Plan & budget** and **Stay financially safe** are open from day one. **Save & manage** opens after the money basics. **Understand investing** opens after the basics of the first two pillars.
- Passing a topic's quiz can unlock an instrument in the paper portfolio, a simulation, or the next topics.
- All of it is data: pillars, topics, prerequisites, grade tags, unlocks and every activity. Adding a topic, scenario or language needs no code change.

## Pillars and topics

Grade columns: **J** = Grade 6–7, **M** = Grade 8–10, **S** = Grade 11–12.

### 1. Plan & budget — needs vs wants, choices, goals

| Topic id | Learner can… | J | M | S |
|---|---|:-:|:-:|:-:|
| `money-basics` | say where money comes from (pocket money, wages, gifts) and where it goes | ✓ | ✓ | ✓ |
| `needs-vs-wants` | sort spending into needs and wants and explain why | ✓ | ✓ | ✓ |
| `making-a-budget` | split an income into needs, wants and savings, and stick to it | ✓ | ✓ | ✓ |
| `opportunity-cost` | see that choosing one thing means giving up another | ✓ | ✓ | ✓ |
| `setting-goals` | turn a wish into a goal with an amount and a date (short and long term) | ✓ | ✓ | ✓ |
| `prices-and-inflation` | explain why ₹100 buys less over time, using real CPI data |  | ✓ | ✓ |
| `future-goals` | plan big goals (higher studies, a first bike, helping family) and the monthly amount they need |  | ✓ | ✓ |

### 2. Save & manage — habits, spending, unexpected needs

| Topic id | Learner can… | J | M | S |
|---|---|:-:|:-:|:-:|
| `saving-habit` | explain "pay yourself first" and track a savings streak | ✓ | ✓ | ✓ |
| `tracking-spending` | record spending and spot where money leaks | ✓ | ✓ | ✓ |
| `emergency-fund` | explain why to keep money aside for surprises and how much | ✓ | ✓ | ✓ |
| `bank-accounts-upi` | describe a savings account, interest, debit cards and UPI |  | ✓ | ✓ |
| `fixed-deposit` | explain an FD: lump sum, fixed rate, fixed period, early-exit penalty |  | ✓ | ✓ |
| `recurring-deposit` | explain an RD: a fixed amount every month | ✓ | ✓ | ✓ |
| `ppf-small-savings` | describe long-term government small-savings schemes such as PPF |  |  | ✓ |
| `borrowing-and-credit` | explain interest you pay, EMIs, credit scores and the cost of easy loans |  | ✓ | ✓ |
| `insurance-basics` | explain insurance as protection, not investment |  |  | ✓ |

### 3. Understand investing — risk, time, compounding, diversification

| Topic id | Learner can… | J | M | S |
|---|---|:-:|:-:|:-:|
| `compounding` | show how money grows on its growth, and why starting early matters | ✓ | ✓ | ✓ |
| `risk-and-return` | explain that higher possible returns come with higher risk |  | ✓ | ✓ |
| `gold` | describe gold as an asset and how its price moves |  | ✓ | ✓ |
| `money-market` | describe money-market and liquid funds: short-term, lower risk |  |  | ✓ |
| `bonds` | explain bonds and government securities: lending for interest |  |  | ✓ |
| `debt-funds` | describe funds that hold bonds and their risks |  |  | ✓ |
| `mutual-funds-sip` | explain a mutual fund, NAV and investing monthly through an SIP |  | ✓ | ✓ |
| `index-funds-etfs` | explain index funds and ETFs: owning the whole market |  | ✓ | ✓ |
| `stocks` | explain what a share is and why prices go up and down |  | ✓ | ✓ |
| `diversification` | explain not putting all eggs in one basket |  | ✓ | ✓ |
| `market-ups-and-downs` | stay calm in a crash (Practice episode: March 2020) |  | ✓ | ✓ |
| `retirement-nps` | explain long-term retirement saving such as NPS |  |  | ✓ |

### 4. Stay financially safe — protect information, spot suspicious offers

| Topic id | Learner can… | J | M | S |
|---|---|:-:|:-:|:-:|
| `protect-your-info` | keep OTP, PIN, passwords and KYC details private | ✓ | ✓ | ✓ |
| `upi-and-phishing-scams` | spot fake payment requests, links and calls | ✓ | ✓ | ✓ |
| `too-good-to-be-true` | spot "double your money" offers and schemes that pay old investors with new money | ✓ | ✓ | ✓ |
| `fake-apps-and-loans` | spot fake trading apps and predatory loan apps |  | ✓ | ✓ |
| `report-a-fraud` | know where to report (cybercrime helpline 1930, cybercrime.gov.in, the bank) | ✓ | ✓ | ✓ |

## Learn by doing: three engines

Each engine is coded once in `packages/engine` (pure, tested) with a renderer in `apps/web`. Every scenario is data.

| Engine | What the learner does | Pillars | Data |
|---|---|---|---|
| **Life + market sim** (Practice and Live) | Lives month by month: money comes in, they split it into needs, wants and savings and put savings into whatever they've unlocked (piggy bank, RD, FD, gold, funds). Life events hit and they must raise cash: emergency fund, break the FD early, or sell units at that day's price | 1, 2, 3 | Episodes, personas, an event deck with odds and money effects, instruments, real price series |
| **Story choices** | Short branching stories (a friend's "doubling" scheme, a first salary); every choice shows its consequence, then try again | 1–4 | A graph of story nodes, choices and effects |
| **Spot & sort** | Quick swipe rounds: need or want, scam or real, riskier or safer | 1, 4 | Items with the correct answer and an explanation |

Plus a **what-if sandbox**: sliders over engine formulas (start an SIP at 15 vs 25, ₹100 then vs now with real CPI), reusing each topic's formula variant.

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
- **Every grade group plays it** through unlocks: Grade 6–7 learners hold a piggy bank and an RD and feel the RD exit penalty; Grade 11–12 learners face March 2020 with funds and gold.
- **The reveal never teaches timing the market.** It always ends on the same lesson: nobody knew tomorrow, and the learner with an emergency fund didn't have to choose.
- **Live opens after Practice:** an instrument becomes available in Live once the learner has finished a Practice episode with it.
- **Live scores habits, never returns:** emergency fund kept, money spread out, plan followed, no panic selling. There is no returns leaderboard. Example funds are named only as examples, with no "buy" prompts and no broker links.
- **Demo:** lead with the Practice episode; show Live briefly as "the same portfolio on today's real prices".

## The storyline: Nani's Gullak

The story is what holds Gullak together: one series that grows up with the learner from Class 6 to 12 and remembers every money choice they make. Games, simulations, missions and the portfolio all hang off it.

**The setup.** Nani has kept the family's savings in an old clay gullak for twenty years. In episode 1 a friendly caller "from the bank" talks her into sharing an OTP, and the family's emergency money is gone. The learner finds the broken gullak and sets out to rebuild it and protect the family. The gullak comes alive as **Gullu**, the learner's companion and narrator. Gullu is also the voice of the AI tutor, so the tutor has a personality and a reason to be there.

**The cast** lives in one fictional Hyderabad lane, written in a mix of Telugu, Hindi and Dakhni:

| Character | Role in the story | Teaches |
|---|---|---|
| **Nani** | Trusts cash and gold, distrusts banks; learns alongside the learner | saving, bank accounts, gold vs gold loans, scams aimed at elders |
| **Amma** | Runs a tiffin business, moving to UPI | budgeting, prices and inflation, UPI safety, small-business cash flow |
| **Nanna** | Auto driver with an uneven income | budgeting in uneven months, emergency fund, insurance |
| **Elder sibling** | Wants a bike on EMI, pulled into an instant-loan app | borrowing, true cost of credit, fake loan apps |
| **Best friend** | Chases a "double your money" group | risk and return, Ponzi schemes, diversification |
| **Ravi uncle** (kirana) | Runs on udhaar and credit | cash flow, credit, keeping records |
| **Lucky Bhai** | A charming scam network that returns every season in a new disguise (doubling scheme, fake KYC call, loan app, stock-tip group) | every topic in Stay financially safe |

**Three seasons, one per grade group:**

| Season | Arc | Topics learnt inside the story | Real event revealed afterwards |
|---|---|---|---|
| **1 · The broken gullak** (Class 6–7) | Rebuild the savings, open the family's first bank account, stop Lucky Bhai's first scam; Nani's hidden cash is suddenly no longer valid | needs vs wants, saving, bank account, UPI, RD, OTP scams | Demonetisation (2016) |
| **2 · The rough months** (Class 8–10) | Amma's tiffin costs rise, Nanna's income drops, the sibling falls into a loan-app trap, the markets crash just as a ₹15,000 hospital bill arrives | budgeting, inflation, emergency fund, FD, borrowing, insurance, fake apps | The March 2020 crash and lockdown |
| **3 · Building the future** (Class 11–12) | Nani's gold vs a gold loan, the first SIP, a stock-tip group, planning for the parents' old age; a finale whose ending comes from every choice made | compounding, gold, mutual funds, index funds, stocks, diversification, retirement | Gold's 2020 jump, the 2022 rate rises |

**Story rules:**

1. **No fixed years inside the story.** The story says "the markets crash", not "March 2020", so it never feels like a history lesson.
2. **"FYI, this really happened."** Once an arc ends, Gullu reveals the real event it mirrored, with real data and sources. The learner can then replay it as a Practice episode on real price history and see how their choices would have played out.
3. **It remembers.** Choices set story state that carries across episodes and seasons. Whether the learner convinced Nani to keep an emergency fund in Season 1 decides how hard the hospital bill hits in Season 2.
4. **Learning happens inside the story.** Quiz questions become story decisions (to stop Lucky Bhai, the learner must spot the red flags). Passing an episode unlocks the real instrument in the paper portfolio, e.g. a virtual RD in Season 1 and an SIP in Season 3.
5. **The other you.** At big decisions Gullu shows the parallel self who chose differently, on the same numbers (Money Multiverse, below).
6. **Into real life.** Some episodes end with Nani asking a question; the take-home mission is answering it with the learner's own parent.
7. **Weekly cliffhangers** ("Nanna's phone rings: 'Your electricity will be cut tonight unless…'"). The next episode opens after the related topic.
8. **Multiple endings.** The finale's family future (savings, debt, safety) comes from every choice the learner made, so there's a reason to replay.
9. **Side games reuse the cast:** scam drills use Lucky Bhai's messages, comics use the same characters, and "Teach Gullu" has the learner correct Gullu's mistakes.

All of it is data on the story-choices engine: seasons, episodes, nodes, choices, effects on story state, and links to topics, Practice episodes and missions. The cast, lane and events are fictional; only the FYI reveals use real events and data.

## What makes Gullak different

Games are in the problem statement, so every team will build them. Our games are how students learn, not what sets us apart. Gullak stands out in five ways:

1. **One story that remembers every choice:** Nani's Gullak (above), across three seasons from Class 6 to 12.
2. **One continuous money life, not separate mini-games.** One portfolio from Class 6 to 12 on real Indian prices. Every topic passed unlocks the next instrument, so every investment is something the learner has just learnt. Existing arcades (e.g. NGPF Arcade: separate games on US topics such as credit scores, college loans and car deals, in English, with made-up numbers and the same game for everyone) start from zero each time.
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
- **Unlocks still apply:** a learner can only use an order type (SIP, limit, stop-loss) or list a company after passing the topic that teaches it.
- **The reveal:** the class's own price chart is laid over a real episode, e.g. NIFTY 50 in March 2020: "You just did what India did."
- **Scored on habits, never profit:** diversified, stuck to a plan, didn't panic-sell, checked the fact sheet before buying. No leaderboard of returns or balances.
- **Demo:** judges join from their phones alongside about 20 bot classmates.
- Never real companies, and never students or classmates as tradable "stocks".

Classroom stock games usually trade on real prices, and markets where prices come from the players' orders exist in economics lab experiments; we haven't found one packaged as a school learning product in India.

## More ways to learn, beyond the engines

Every topic already renders in eight formats (video, story/comic, visual with real-data charts, formula + live calculator, transcript, audio, simulation, quiz), and the format bandit picks among them. These modes add to that. Each one reuses topic content, the engine and `@gullak/ai`, and reports evidence to knowledge tracing.

### Learning by talking
- **AI tutor in the learner's language:** voice or text in English, Hindi, Telugu or Hinglish. It asks "why do you think so?" back instead of only answering. Guardrails as in AGENTS.md.
- **Teach the AI:** an AI "classmate" makes typical misconceptions (from the topic's curriculum entry) and the learner corrects it. Explaining something is one of the strongest ways to learn it.
- **Interview missions:** ask a shopkeeper how they take UPI, or a grandparent what a kilo of rice cost in 1995. The answer is compared with real CPI data. Recordings stay on the device unless the learner chooses to share them, and missions never ask for income, account details, OTPs or PINs.

### Learning from real life
- **Kitna? lens:** point the camera at a price tag, ad or EMI offer. Gullak shows what the price means, never whether to buy it: days of a typical wage, weeks at the learner's own saving rate, what the same money could become in an RD at today's rates (labelled as an assumption), and the true cost of a "no-cost EMI". Images aren't stored. Wage figures come from a cited source, never from asking about family income.
- **Pocket-money diary:** log real spending in 10 seconds and tag each item as a need or a want. Gullak finds the patterns and suggests the next topic: a self-reported version of the Account Aggregator idea, with no bank data.
- **Money in the news:** when the RBI changes rates or gold hits a record, a 1-minute "what this means for you" card tied to a topic.
- **Real documents, explained:** a bank passbook, FD receipt, UPI receipt, payslip and loan form, each with tap-to-explain labels (sample documents only, never the learner's own).

### Learning by doing outside the app
- **Take-home missions:** after a topic, a 5-minute mission to do with a parent ("Show Amma how to tell a UPI collect request from a payment"), with Telugu or Hindi audio and a 3-question check the parent answers on the same phone. A parent who passes counts as a **household reached** on the facilitator dashboard.
- **Savings challenges:** "save ₹10 a day for 30 days" in a real gullak at home, with a daily check-in.
- **Class projects:** run a stall at the school mela with a real budget, costs and profit, logged in Gullak.

### Learning together
- **Debate cards:** "Gold or FD for a 3-year goal?" Learners argue each side with evidence. The point is the trade-offs, not a right answer.
- **Peer explainers:** 30-second explanations recorded by learners; the best, approved by the teacher, become content for the next batch.

### Learning that stays
- **Spaced recall:** a quick question two days later, then a week later; knowledge tracing picks what to repeat.
- **"Why this?":** every recommendation says why ("You mixed up simple and compound interest last time").
- **Concept map:** the prerequisite graph shown as a skill tree that fills up.

## More games and stories

All as data for the existing engines (life + market sim, story choices, spot & sort), unless marked as a new screen.

- **Live India's real money moments:** Practice episodes for demonetisation night (2016), March 2020, gold in 2020 and the 2022 rate rises, each with life events (a fee due, a phone breaks, a job loss at home).
- **Play the other side:** *Be the bank* (run a village bank: take deposits, lend, set rates, survive a bank run, so interest makes sense) and *Think like a scammer* (design a fake "double your money" scheme in a sandbox and see who falls for it, to learn the red flags). NGPF already has games where you play the lender or the dealer, so these are features, not headline USPs.
- **Scam drills, like fire drills:** a realistic fake SMS, WhatsApp message or UPI collect request appears during normal play. The learner must spot it and say how to report it (1930, cybercrime.gov.in), then gets a debrief. Drills are clearly marked as drills once they're over.
- **Wheel of life events:** a quick game inside Practice where a spin decides this month's surprise (good or bad), and the learner's emergency fund decides how much it hurts.
- **Month-end challenge:** get through the month on a pocket-money or stipend budget.
- **Borrowing cards:** a card game comparing an informal moneylender, a bank loan and buy-now-pay-later on the true cost.
- **You are the ₹500 note:** a story told from the money's side: a wallet, a bank (lent out, which explains interest), a loan, a scammer's mule account, then worn down by inflation. Each stop is a topic.
- **The recurring cast** of Nani's Gullak appears in every story, comic and game, so it all feels like one series.

## Habit design: built to come back to, never addictive

Learners are 11–17 and the subject is money, so engagement must model financial discipline. The daily loop: **open the app → the Gullak reacts → today's real market move → a 2-minute drop → the Gullak grows.**

- **A living Gullak:** each learner's piggy bank is a character that grows, changes look and evolves with their **habits** (a 7-day saving streak, an emergency fund, 10 scams spotted), never with spending or luck. It reacts to what they do. If they're away, it waits; it never dies or guilt-trips.
- **Something real every day:** the Live portfolio moves with real prices, and each move is a micro-lesson ("Gold went up 1.2% overnight. Your gold units are worth ₹46 more. Why? 40 seconds").
- **The 2-minute daily drop:** one question, one scam to spot or one "what would you do?", then it's finished for the day.
- **Streaks with forgiveness:** a missed day can be covered by a streak saver earned by saving, so no data for a day is never a punishment.
- **Stories with cliffhangers:** one chapter a week; the next chapter opens after the related topic.
- **Collections:** historical Indian notes and coins with their stories (one per topic), a Scam Hunter card deck (rarity by how hard the scam is to spot), and the skill tree.
- **Friends and class without money competition:** class goals ("our class spotted 500 scams this week"), duels on the same 5 questions, gifting a streak saver. Leaderboards only for learning and habits, never for returns or balances.
- **Surprise, but never gambling:** surprise events (a festival bonus, a sudden expense, a crash) are always lessons inside the sim, never prizes to pull for.

**Never:** loot boxes or random paid rewards, guilt or fear notifications, endless feeds, notifications at night or during school hours, or leaderboards of money or returns.

## Built for shared phones and no data

- **Several profiles on one phone,** with quick switching and a clear way to sign out or reset (see PRODUCT.md, Privacy).
- **Offline and audio-first:** lessons are cached, audio works with the screen off, and everything is sized for cheap Android phones.
- **Lesson packs travel:** a pack can be shared over WhatsApp or Bluetooth, so one download reaches many phones.

## Demo picks

Lead with **Nani's Gullak**: episode 1 (the OTP scam), a story decision that unlocks an instrument, then the "FYI, this really happened" reveal and replay on real data. Then the adaptive loop, and the features other teams are least likely to have: **the other you** at a big decision, **the class market** (judges join), **a take-home mission** (a judge plays the parent; "households reached" ticks up), **Teach the AI**, **the Kitna? lens** and **the living Gullak's daily loop**.

## Evidence and adaptation

The demo story is the adaptive loop: **evidence → recommendation → activity → simulation → mastery update → changed recommendation.**

- **Current experience** (onboarding) only sets the starting prior. Skill level comes from evidence: quizzes, activities and simulation decisions (did they keep an emergency fund, did they panic sell) all report to knowledge tracing.
- Mastery, not quiz score alone, drives unlocks and recommendations.
- The format bandit learns which formats work for each learner from what they finish and how they do. Facilitators can assign any activity to a class.

## Real data behind every topic

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
| Real scam patterns and advice | RBI (Sachet, "BE(A)WARE"), I4C / cybercrime.gov.in, NPCI safety guidance | all of Stay financially safe, spot & sort, story choices |

**Practice episodes** run on these real series: the 2008 crash, demonetisation (2016), the March 2020 crash and recovery, gold's 2020 jump, and the 2022 rate rises (debt fund NAVs vs FD rates). Live mode reads the same sources' current values through the market-data adapters. Life-sim event costs and odds also cite their source (CPI groups, HCES) rather than invented numbers.

Example funds and stocks are only there to practise with play money. Content never calls them good, best or recommended.

## How content gets made

1. **By hand (R5, led by R1):** a curriculum entry per topic: learning goals, key ideas, common misconceptions, a real-life scenario, quiz goals and grade tags.
2. **Generated once:** the lesson pre-generation script turns each entry into every format × grade group × language and caches it. Live LLM calls are only for the tutor.
3. **Reviewed:** R5 checks every generated lesson against the guardrail before it ships. Two or three demo topics get a full hand polish.
