import { api, context } from "@/lib/backend/http";
export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ runId: string }> }) {
  return api(async () => (await context(request)).db.run((await params).runId));
}
