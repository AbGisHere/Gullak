import { StartLearningRunRequest } from "@gullak/types";
import { api, body, context, requestKey } from "@/lib/backend/http";
import { startLearningRun } from "@/lib/backend/learning";
export const runtime = "nodejs";
export async function POST(request: Request, { params }: { params: Promise<{ contentId: string }> }) {
  return api(async () => {
    const { db } = await context(request);
    await body(request, StartLearningRunRequest);
    return startLearningRun(db, "episode", (await params).contentId, requestKey(request));
  });
}
