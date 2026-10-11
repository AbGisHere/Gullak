import { api } from "@/lib/backend/http";
import { searchInstruments } from "@/lib/backend/live-market";

export const runtime = "nodejs";
// Public and read-only: learners keep progress on their device, so market lookups need no identity.
export async function GET(request: Request) {
  return api(async () => ({ results: await searchInstruments(new URL(request.url).searchParams.get("q") ?? "") }));
}
