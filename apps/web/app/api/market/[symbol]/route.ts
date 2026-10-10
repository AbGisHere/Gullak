import { api, context } from "@/lib/backend/http";
import { marketQuote } from "@/lib/backend/market";

export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ symbol: string }> }) {
  return api(async () => {
    await context(request);
    const { symbol } = await params;
    return marketQuote(symbol);
  });
}
