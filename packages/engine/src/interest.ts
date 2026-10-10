import type { Paise } from "@gullak/types";

/**
 * Pure maths for deposits and SIPs. All projections are assumptions, not
 * promises: callers must label them as such in the UI.
 */

function assertNonNegative(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative finite number, got ${value}`);
  }
}

/** A = P (1 + r/n)^(n·t) */
export function compoundAmount(
  principalPaise: Paise,
  annualRatePercent: number,
  compoundsPerYear: number,
  years: number,
): Paise {
  assertNonNegative("principalPaise", principalPaise);
  assertNonNegative("annualRatePercent", annualRatePercent);
  assertNonNegative("years", years);
  if (compoundsPerYear <= 0) throw new RangeError("compoundsPerYear must be positive");
  const r = annualRatePercent / 100;
  return Math.round(principalPaise * (1 + r / compoundsPerYear) ** (compoundsPerYear * years));
}

/** FD maturity. Indian banks compound FDs quarterly by default. */
export function fdMaturity(
  principalPaise: Paise,
  annualRatePercent: number,
  tenureMonths: number,
  compoundsPerYear = 4,
): Paise {
  return compoundAmount(principalPaise, annualRatePercent, compoundsPerYear, tenureMonths / 12);
}

/**
 * RD maturity using the convention Indian banks publish: each monthly
 * instalment compounds quarterly for the months it stays deposited.
 * M = Σ_{k=1..N} R · (1 + r/4)^(4k/12)
 */
export function rdMaturity(monthlyPaise: Paise, annualRatePercent: number, tenureMonths: number): Paise {
  assertNonNegative("monthlyPaise", monthlyPaise);
  assertNonNegative("annualRatePercent", annualRatePercent);
  const q = annualRatePercent / 100 / 4;
  let total = 0;
  for (let k = 1; k <= tenureMonths; k++) {
    total += monthlyPaise * (1 + q) ** ((4 * k) / 12);
  }
  return Math.round(total);
}

/**
 * SIP future value with contributions at the start of each month (annuity due):
 * FV = P · [((1 + i)^n − 1) / i] · (1 + i),  i = annual rate / 12
 */
export function sipFutureValue(monthlyPaise: Paise, expectedAnnualReturnPercent: number, months: number): Paise {
  assertNonNegative("monthlyPaise", monthlyPaise);
  assertNonNegative("months", months);
  const i = expectedAnnualReturnPercent / 100 / 12;
  if (i === 0) return Math.round(monthlyPaise * months);
  return Math.round(monthlyPaise * (((1 + i) ** months - 1) / i) * (1 + i));
}

/** Inverse of sipFutureValue: monthly amount needed to reach a target. */
export function monthlyForTarget(targetPaise: Paise, expectedAnnualReturnPercent: number, months: number): Paise {
  assertNonNegative("targetPaise", targetPaise);
  if (months <= 0) throw new RangeError("months must be positive");
  const perRupee = sipFutureValue(100, expectedAnnualReturnPercent, months) / 100;
  return Math.ceil(targetPaise / perRupee);
}
