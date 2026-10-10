import { z } from "zod";
import { Locale, Slug } from "./common";
import { InstrumentKind } from "./instrument";

/**
 * SEBI mutual fund categories (plus SIFs) as reference data for investing topics,
 * the paper portfolio and snapshots. Educational only: never a recommendation.
 */
export const FundCategoryGroup = z.enum([
  "debt",
  "hybrid",
  "equity",
  "sector-and-thematic",
  "index-and-etf",
  "fund-of-funds",
  "solution-oriented",
  "specialised",
]);
export type FundCategoryGroup = z.infer<typeof FundCategoryGroup>;

/** Coarse, typical band for teaching; each real scheme's own riskometer is what counts. */
export const RiskBand = z.enum(["lower", "moderate", "higher", "varies"]);
export type RiskBand = z.infer<typeof RiskBand>;

export const FundCategory = z.object({
  id: Slug,
  group: FundCategoryGroup,
  /** Paper-portfolio instrument it is played as; null when it isn't playable. */
  instrumentKind: InstrumentKind.nullable(),
  riskBand: RiskBand,
  /** Topic that teaches it. */
  topicId: Slug,
});
export type FundCategory = z.infer<typeof FundCategory>;

/** Learner-facing text for one locale, keyed by category id. */
export const FundCategoryText = z.object({
  locale: Locale,
  categories: z.record(
    Slug,
    z.object({ name: z.string().min(1), summary: z.string().min(1), watchOut: z.string().min(1) }).strict(),
  ),
});
export type FundCategoryText = z.infer<typeof FundCategoryText>;
