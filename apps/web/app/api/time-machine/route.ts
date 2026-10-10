import { replayHistory } from "@gullak/engine";
import { committedMarketData, committedSnapshots } from "@gullak/market-data";
import { ReplayRequest } from "@gullak/types";
import { ApiError } from "@/lib/backend/errors";
import { api, body, context } from "@/lib/backend/http";

export const runtime = "nodejs";
export async function POST(request: Request) {
  return api(async () => {
    const { db } = await context(request);
    await db.state();
    const input = await body(request, ReplayRequest);
    const snapshot = committedSnapshots.find((f) => f.symbol === input.symbol);
    if (!snapshot || snapshot.series.length < 2) throw new ApiError(404, "history_unavailable");
    const points = await committedMarketData.getSeries(input.symbol, input.from, input.to);
    if (points.length < 2) throw new ApiError(422, "insufficient_observed_history");
    let replay: ReturnType<typeof replayHistory>;
    try {
      replay = replayHistory(points, input.initialPaise, input.panicSellAt);
    } catch {
      throw new ApiError(400, "invalid_replay_date");
    }
    return {
      isVirtual: true,
      isSnapshot: true,
      symbol: input.symbol,
      source: snapshot.source,
      attribution: snapshot.attribution,
      actualFrom: points[0]!.t,
      actualTo: points.at(-1)!.t,
      observedDatesOnly: true,
      replay,
      assumptions: {
        initialPaise: input.initialPaise,
        panicSellAt: input.panicSellAt ?? null,
        excludesFeesAndTaxes: true,
        dividendsReinvested: snapshot.quote.kind === "nav",
        fractionalUnits: true,
        cashAfterSellEarnsNoInterest: true,
      },
    };
  });
}
