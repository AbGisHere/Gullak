import { committedMarketData } from "@gullak/market-data";
import { FdInvestmentRequest } from "@gullak/types";
import { api, body, context, requestKey } from "@/lib/backend/http";

export const runtime = "nodejs";
export async function POST(request: Request) {
  return api(async () => {
    const { service } = await context(request);
    const input = await body(request, FdInvestmentRequest);
    return service.invest(input, requestKey(request), await committedMarketData.getQuote("FD-1Y"));
  });
}
