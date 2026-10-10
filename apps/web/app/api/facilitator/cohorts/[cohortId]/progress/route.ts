import { z } from "zod";
import { api, context } from "@/lib/backend/http";

export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ cohortId: string }> }) {
  return api(async () => {
    const { db } = await context(request);
    const { cohortId } = await params;
    return db.aggregate(z.uuid().parse(cohortId));
  });
}
