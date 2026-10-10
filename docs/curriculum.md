# Curriculum

The learning map for Gullak, built on the four pillars of the Vanguard problem statement. This is the plan the content, schemas and engines follow; the source of truth for each topic will be its data in `packages/content` once `feat/curriculum` lands.

> **Guardrail:** we educate; we never recommend real products or tell anyone to buy or sell. Simulations are assumptions, not promises. All money is virtual.

## Learners

Primary audience: school students in Grades 6–12, especially from underserved communities in Hyderabad (starting with ~1,500, designed to scale).

Onboarding asks three things, in order (language is picked first via the locale switcher):

1. **Grade group:** `grade-6-7`, `grade-8-10`, `grade-11-12`.
2. **Current experience:** none / some / regular.
3. **How they like to learn:** preferred formats (story, video, visual, formula, simulation, quiz, audio).

Every topic is tagged with the grade groups it suits. A topic can also have depth per grade group (e.g. compounding as a growing piggy bank in Grade 6–7, as a formula in Grade 11–12).

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
| `recurring-deposit` | explain an RD: a fixed amount every month |  | ✓ | ✓ |
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
| `market-ups-and-downs` | stay calm in a crash (Time Machine: March 2020) |  | ✓ | ✓ |
| `retirement-nps` | explain long-term retirement saving such as NPS |  |  | ✓ |

### 4. Stay financially safe — protect information, spot suspicious offers

| Topic id | Learner can… | J | M | S |
|---|---|:-:|:-:|:-:|
| `protect-your-info` | keep OTP, PIN, passwords and KYC details private | ✓ | ✓ | ✓ |
| `upi-and-phishing-scams` | spot fake payment requests, links and calls | ✓ | ✓ | ✓ |
| `too-good-to-be-true` | spot "double your money" offers and schemes that pay old investors with new money | ✓ | ✓ | ✓ |
| `fake-apps-and-loans` | spot fake trading apps and predatory loan apps |  | ✓ | ✓ |
| `report-a-fraud` | know where to report (cybercrime helpline 1930, cybercrime.gov.in, the bank) | ✓ | ✓ | ✓ |

## Learn by doing: four engines

Each engine is coded once in `packages/engine` (pure, tested) with a renderer in `apps/web`. Every scenario is data.

| Engine | What the learner does | Pillars | Data |
|---|---|---|---|
| **Market sim** | Invests play money across unlocked instruments in the paper portfolio; replays real history in the Time Machine (March 2020, Panic Sell) | 3 | Instruments, real snapshots, replay episodes |
| **Life sim** | Plays month by month: money comes in, they split it into needs, wants and savings, random events hit (phone breaks, festival, illness), goals and the emergency fund respond | 1, 2 | Personas (starting situation), an event deck with odds and money effects, goals |
| **Story choices** | Short branching stories (a friend's "doubling" scheme, a first salary); every choice shows its consequence, then try again | 1–4 | A graph of story nodes, choices and effects |
| **Spot & sort** | Quick swipe rounds: need or want, scam or real, riskier or safer | 1, 4 | Items with the correct answer and an explanation |

Plus a **what-if sandbox**: sliders over engine formulas (start an SIP at 15 vs 25, ₹100 then vs now with real CPI), reusing each topic's formula variant.

Every activity reports results to knowledge tracing, so the adaptive engine learns from play as well as quizzes. Facilitators can assign any activity to a class.

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
| Mutual fund NAVs by category: liquid, overnight, money market, debt, index, equity, ETFs | AMFI (same script, one scheme code per example) | `money-market`, `debt-funds`, `mutual-funds-sip`, `index-funds-etfs`, `diversification`, market sim |
| Index history: NIFTY 50 (and TRI), Next 50, Midcap 150, a few sectors | NSE Indices | `stocks`, `index-funds-etfs`, `diversification`, Time Machine |
| A few example stock prices | NSE end-of-day data | `stocks`, `risk-and-return` |
| Gold price (₹/gram) | IBJA, RBI DBIE | `gold`, `diversification`, market sim |
| T-bill and 10-year G-sec yields | RBI DBIE | `money-market`, `bonds`, `risk-and-return` |
| NPS scheme NAVs | NPS Trust | `retirement-nps` |
| Real scam patterns and advice | RBI (Sachet, "BE(A)WARE"), I4C / cybercrime.gov.in, NPCI safety guidance | all of Stay financially safe, spot & sort, story choices |

**Time Machine episodes** are data, each a date range on real series with a narrative: the 2008 crash, demonetisation (2016), the March 2020 crash and recovery, gold's 2020 jump, and the 2022 rate rises (debt fund NAVs vs FD rates). Life-sim event costs and odds also cite their source (CPI groups, HCES) rather than invented numbers.

Example funds and stocks are only there to practise with play money. Content never calls them good, best or recommended.

## How content gets made

1. **By hand (R5, led by R1):** a curriculum entry per topic: learning goals, key ideas, common misconceptions, a real-life scenario, quiz goals and grade tags.
2. **Generated once:** the lesson pre-generation script turns each entry into every format × grade group × language and caches it. Live LLM calls are only for the tutor.
3. **Reviewed:** R5 checks every generated lesson against the guardrail before it ships. Two or three demo topics get a full hand polish.
