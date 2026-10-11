import type { PortfolioViewModel } from "@gullak/ui/components/paper-portfolio";
import { PlayMoneyBadge } from "@gullak/ui/components/play-money-badge";
import { formatInr } from "@gullak/ui/lib/format";

export interface MoneyStateProps {
  portfolio: PortfolioViewModel;
  locale: string;
  labels: {
    heading: string;
    availableCash: string;
    emergencyReserve: string;
    playMoney: string;
  };
}

/** Display supplied balances only: no valuation, projections or engine maths. */
export function MoneyState({ portfolio, locale, labels }: MoneyStateProps) {
  return (
    <section className="min-w-0 space-y-4" aria-labelledby="twin-money-heading">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h3 id="twin-money-heading" className="text-xl font-bold">
          {labels.heading}
        </h3>
        <PlayMoneyBadge label={labels.playMoney} />
      </header>
      <dl className="divide-y divide-border border-y border-border">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4">
          <dt className="text-base">{labels.availableCash}</dt>
          <dd className="text-2xl font-bold tabular-nums">{formatInr(portfolio.cashPaise, { locale })}</dd>
        </div>
        {portfolio.holdings.map((holding) => (
          <div key={holding.id} className="space-y-2 py-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <dt className="min-w-0 text-base font-semibold">{holding.name}</dt>
              <dd className="text-xl font-bold tabular-nums">{formatInr(holding.currentValuePaise, { locale })}</dd>
            </div>
            {holding.liquidityNote && (
              <dd className="max-w-prose text-base leading-relaxed text-muted-foreground">{holding.liquidityNote}</dd>
            )}
          </div>
        ))}
      </dl>
      {portfolio.emergencyReserve.statusNote && (
        <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
          <span className="font-semibold">{labels.emergencyReserve}: </span>
          {portfolio.emergencyReserve.statusNote}
        </p>
      )}
      <p className="text-sm text-muted-foreground">{portfolio.asOf}</p>
    </section>
  );
}
