import { SaveLearningBookmarkRequest } from "@gullak/types";
import { api, body, context, requestKey } from "@/lib/backend/http";
import { saveLearningBookmark } from "@/lib/backend/learning";
export const runtime = "nodejs";
export async function POST(request: Request, { params }: { params: Promise<{ runId: string }> }) {
  return api(async () => {
    const { db } = await context(request);
    return saveLearningBookmark(
      db,
      (await params).runId,
      requestKey(request),
      await body(request, SaveLearningBookmarkRequest),
    );
  });
}
