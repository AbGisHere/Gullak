import { api } from "@/lib/backend/http";
import { liveChart } from "@/lib/backend/live-market";

export const runtime = "nodejs";
// Public and read-only, like the live quote: `?range=1d|1w|1m|1y`.
export async function GET(request: Request, { params }: { params: Promise<{ symbol: string }> }) {
  const range = new URL(request.url).searchParams.get("range");
  return api(async () => ({ chart: await liveChart((await params).symbol, range) }));
}
