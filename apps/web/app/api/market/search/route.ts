import { api } from "@/lib/backend/http";
import { searchInstruments } from "@/lib/backend/live-market";

export const runtime = "nodejs";
// Public and read-only: learners keep progress on their device, so market lookups need no identity.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  return api(async () => ({ results: await searchInstruments(params.get("q") ?? "", params.get("category")) }));
}
