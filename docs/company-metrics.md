# Company metrics

Every number a stock-research site such as Screener shows for a listed company, explained for learners. This is the source for Stock Street's **company report card** and Finance Tycoon's own-business report card ([curriculum](curriculum.md#company-report-card)). R5 turns each row into lesson content (en, hi, te); `@gullak/engine` computes each one from a fictional company's statements.

> **Guardrail:** taught on fictional companies only, never with real companies' data copied from any site. No number is ever a buy or sell signal, and content never sets "cheap", "expensive", "good" or "bad" cut-offs. Learners compare a number with the company's own history and with its industry, and always look at several numbers together.

**Stage:** **N** = Money Navigators (Classes 8–9), **S** = Financial Strategists (Classes 10–12). Navigators see the starter set; Strategists see everything.

## How to read any metric: time windows

Sites list hundreds of numbers because each base metric comes in several time windows. Learn the windows once and every variant makes sense.

| Window | Meaning |
|---|---|
| Latest quarter | The most recent three months reported |
| Preceding quarter | The three months before that (quarter-on-quarter, QoQ) |
| Same quarter last year | Used for year-on-year (YoY) change, which removes seasonal effects such as festive-season sales |
| TTM (trailing twelve months) | The last four quarters added up; the most recent full-year view |
| Last year / preceding year | The latest and previous full financial years (April–March in India) |
| 3, 5, 7 or 10-year average | The mean over that many years; smooths out one unusual year |
| 3, 5, 7 or 10-year growth | Compounded annual growth (CAGR): the steady yearly rate that gets from the starting value to the ending value |
| Standalone vs consolidated | The company alone, or the company together with its subsidiaries; consolidated is the whole group |

## Price and size

| Metric | What it tells you | How it is worked out | Stage |
|---|---|---|:-:|
| Current price | What one share last traded for | The latest trade on the exchange | N |
| Face value | The nominal value printed on a share, used for dividends and splits; it says nothing about worth | Set by the company (often ₹1, ₹2 or ₹10) | N |
| Number of shares | How many pieces the company is split into | From the company's filings | N |
| Market capitalisation | What the market values the whole company at today | Current price × number of shares | N |
| 52-week high / low | The highest and lowest price in the last year | From a year of daily prices | N |
| Down from 52-week high / up from 52-week low | How far today's price sits from that range | (Price − high) ÷ high; (price − low) ÷ low | S |
| Return over 1 week / 1, 3, 6 months / 1, 3, 5, 10 years | How much the share price changed over the period (excluding dividends) | (Price now − price then) ÷ price then; multi-year returns are often compounded per year | N |
| Volume / average volume | How many shares changed hands in a day, or on average over a period | Exchange data | S |
| Enterprise value (EV) | What buying the whole business would cost, including its debt | Market cap + debt − cash | S |

## Results: the profit and loss statement

| Metric | What it tells you | How it is worked out | Stage |
|---|---|---|:-:|
| Sales (revenue) | Money earned from selling goods or services | Total from operations | N |
| Expenses | What it cost to run the business (materials, salaries, rent, power…) | Sum of operating costs | N |
| Operating profit (EBITDA) | Profit from the core business before interest, tax, depreciation and amortisation | Sales − operating expenses | S |
| Operating profit margin (OPM) | How many rupees of each ₹100 of sales are left after running costs | Operating profit ÷ sales | S |
| Other income | Money not from the main business, such as interest on cash or a one-off asset sale | From the statement | S |
| Depreciation | The cost of machines and buildings spread over the years they are used | From the statement | S |
| EBIT | Profit before interest and tax | Operating profit + other income − depreciation | S |
| Interest | What the company paid on its borrowings | From the statement | S |
| Profit before tax (PBT) | Profit after all costs except tax | EBIT − interest | S |
| Tax % | Share of profit paid as tax | Tax ÷ PBT | S |
| Net profit (PAT) | What is left for shareholders after everything | PBT − tax | N |
| Net profit margin | How many rupees of each ₹100 of sales become profit | Net profit ÷ sales | S |
| EPS (earnings per share) | Profit belonging to one share | Net profit ÷ number of shares | S |
| Dividend per share | Cash paid to shareholders for each share | Total dividend ÷ number of shares | N |
| Dividend payout ratio | Share of profit handed back to shareholders instead of kept | Dividends ÷ net profit | S |
| Exceptional items | One-off gains or losses that won't repeat | From the statement | S |
| Quarterly sales / profit growth (YoY, QoQ) | Whether the latest quarter beat the same quarter last year, or the previous quarter | (This − then) ÷ then | S |

## Growth

| Metric | What it tells you | How it is worked out | Stage |
|---|---|---|:-:|
| Sales growth (1, 3, 5, 7, 10 years) | How fast the business is selling more | Compounded annual growth of sales | S |
| Profit growth (1, 3, 5, 7, 10 years) | How fast profit is rising | Compounded annual growth of net profit | S |
| EPS growth | Profit per share growth; differs from profit growth when the share count changes | Compounded annual growth of EPS | S |
| Book value growth | How fast shareholders' funds are building up | Compounded annual growth of book value | S |

## The balance sheet

| Metric | What it tells you | How it is worked out | Stage |
|---|---|---|:-:|
| Equity share capital | Money shareholders put in at face value | Face value × number of shares | S |
| Reserves | Profits kept in the business over the years, plus share premium | From the balance sheet | S |
| Net worth (shareholders' funds) | What belongs to shareholders on paper | Share capital + reserves | S |
| Book value per share | Net worth for one share | Net worth ÷ number of shares | S |
| Borrowings (debt) | Money the company owes to lenders | Short-term + long-term borrowings | N |
| Other liabilities | Other money owed: suppliers, advances from customers, provisions | From the balance sheet | S |
| Total assets | Everything the company owns or controls | Liabilities + net worth | S |
| Gross block / net block (fixed assets) | Machines, buildings and land at cost, and after depreciation | From the balance sheet | S |
| Capital work in progress (CWIP) | Factories and projects being built but not yet in use | From the balance sheet | S |
| Investments | Money placed in shares, bonds, funds or other companies | From the balance sheet | S |
| Inventory | Goods and materials waiting to be sold or used | From the balance sheet | S |
| Trade receivables (debtors) | Money customers still owe | From the balance sheet | S |
| Cash and equivalents | Cash and very short-term deposits | From the balance sheet | N |
| Working capital | Short-term money available to run day to day | Current assets − current liabilities | S |
| Contingent liabilities | Possible future bills (lawsuits, guarantees) not yet counted as debt | Notes to the accounts | S |
| Net debt | Debt after setting cash against it | Borrowings − cash and liquid investments | S |

## Cash flow

| Metric | What it tells you | How it is worked out | Stage |
|---|---|---|:-:|
| Cash from operations | Real cash the business generated, as opposed to profit on paper | Cash-flow statement | S |
| Cash from investing | Cash spent on (or received from) assets and investments | Cash-flow statement | S |
| Cash from financing | Cash raised from or returned to lenders and shareholders | Cash-flow statement | S |
| Net cash flow | Change in cash over the year | Sum of the three above | S |
| Capital expenditure (capex) | Money spent on new machines, buildings and projects | Cash-flow statement | S |
| Free cash flow | Cash left after keeping the business running and growing; it can repay debt or pay dividends | Cash from operations − capex | S |
| Cash from operations ÷ profit | Whether reported profit is turning into cash | Cash from operations ÷ net profit | S |

## Returns and efficiency

| Metric | What it tells you | How it is worked out | Stage |
|---|---|---|:-:|
| ROE (return on equity) | Profit earned on shareholders' money | Net profit ÷ average net worth | S |
| ROCE (return on capital employed) | Profit earned on all the money in the business, from owners and lenders | EBIT ÷ (net worth + debt) | S |
| ROA (return on assets) | Profit earned on everything the company owns | Net profit ÷ total assets | S |
| ROIC (return on invested capital) | Profit from operations on the capital actually used in the business | EBIT after tax ÷ invested capital | S |
| Asset turnover | Sales generated by each rupee of assets | Sales ÷ total assets | S |
| Inventory turnover | How many times stock is sold and replaced in a year | Cost of goods sold ÷ average inventory | S |
| Debtor days | How long customers take to pay | Receivables ÷ sales × 365 | S |
| Inventory days | How long goods sit before being sold | Inventory ÷ cost of goods sold × 365 | S |
| Days payable | How long the company takes to pay its suppliers | Payables ÷ purchases × 365 | S |
| Cash conversion cycle | Days between paying for materials and getting paid by customers | Debtor days + inventory days − days payable | S |
| Working capital days | Days of sales tied up in running the business | Working capital ÷ sales × 365 | S |

## Debt and safety

| Metric | What it tells you | How it is worked out | Stage |
|---|---|---|:-:|
| Debt to equity | How much the company borrows compared with what owners put in | Borrowings ÷ net worth | N |
| Interest coverage | How many times operating profit covers the interest bill | EBIT ÷ interest | S |
| Current ratio | Whether short-term assets cover short-term bills | Current assets ÷ current liabilities | S |
| Quick ratio | The same, without counting inventory, which may be slow to sell | (Current assets − inventory) ÷ current liabilities | S |
| Debt to EBITDA | Years of operating profit it would take to repay debt | Borrowings ÷ EBITDA | S |
| Altman Z-score | A formula combining five ratios to flag financial stress | Weighted sum of working capital, retained earnings, EBIT, market value and sales, each scaled by assets or liabilities | S |
| Piotroski F-score | Nine yes/no checks on profitability, debt and efficiency, scored 0–9 | One point per check passed | S |

## Valuation: price compared with something

| Metric | What it tells you | How it is worked out | Stage |
|---|---|---|:-:|
| P/E (price to earnings) | Rupees paid for each rupee of yearly profit | Price ÷ EPS (or market cap ÷ net profit) | S |
| Industry P/E | The typical P/E of companies in the same industry, for comparison | Median of the industry's P/Es | S |
| Earnings yield | The P/E turned upside down, as a percentage | EPS ÷ price | S |
| P/B (price to book) | Price compared with the shareholders' funds on paper | Price ÷ book value per share | S |
| Price to sales (market cap to sales) | Rupees paid for each rupee of yearly sales | Market cap ÷ sales | S |
| Price to free cash flow | Rupees paid for each rupee of free cash | Market cap ÷ free cash flow | S |
| EV/EBITDA | Whole-business cost compared with operating profit; fair across companies with different debt | Enterprise value ÷ EBITDA | S |
| PEG | P/E adjusted for how fast profit is growing | P/E ÷ profit growth rate (%) | S |
| Dividend yield | Yearly dividend as a share of today's price | Dividend per share ÷ price | N |
| Graham number | A textbook formula from Benjamin Graham combining earnings and book value; a teaching example, not a fair price | √(22.5 × EPS × book value per share) | S |
| Intrinsic value (estimates) | A model's guess at what the business is worth, e.g. from future cash flows; it depends entirely on its assumptions | Discounted cash flow or similar | S |

## Ownership

| Metric | What it tells you | How it is worked out | Stage |
|---|---|---|:-:|
| Promoter holding | Share of the company owned by its founders or controlling group | Shareholding pattern filed every quarter | N |
| Change in promoter holding | Whether promoters bought or sold shares over the quarter or year | Difference between filings | S |
| Pledged shares | Share of promoter holding pledged as security for loans; lenders may sell if the price falls | Shareholding pattern | S |
| FII / FPI holding | Share owned by foreign institutional investors | Shareholding pattern | S |
| DII holding | Share owned by domestic institutions (mutual funds, insurers, banks) | Shareholding pattern | S |
| Public holding | Share owned by everyone else, including individuals | Shareholding pattern | S |
| Number of shareholders | How many people and institutions own shares | Shareholding pattern | S |

## Teaching rules

1. **Never one number alone.** Every lesson shows at least two numbers that pull in different directions (high ROE but high debt; low P/E but falling profit).
2. **Compare over time and within the industry,** never against a universal cut-off. A bank and a software company have very different normal ranges.
3. **Profit is an opinion, cash is a fact.** Pair profit metrics with cash-flow metrics.
4. **Price is not value.** Valuation metrics show what the market is paying, not what learners should do.
5. **Ratios can be gamed or distorted** by one-off items, accounting choices or a tiny denominator; each metric's lesson names its usual misreading.
6. Finance Tycoon makes learners produce these numbers from their own fictional business, so each one is something they have built before they read it elsewhere.
