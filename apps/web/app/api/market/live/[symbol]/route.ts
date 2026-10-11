import { api } from "@/lib/backend/http";
import { liveQuote } from "@/lib/backend/live-market";

export const runtime = "nodejs";
// Public and read-only: learners keep progress on their device, so market lookups need no identity.
export async function GET(_request: Request, { params }: { params: Promise<{ symbol: string }> }) {
  return api(async () => ({ quote: await liveQuote((await params).symbol) }));
}
