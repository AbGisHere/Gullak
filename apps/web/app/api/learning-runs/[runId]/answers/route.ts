import { ActivityAnswerRequest } from "@gullak/types";
import { answerActivity } from "@/lib/backend/activity-answers";
import { api, body, context, requestKey } from "@/lib/backend/http";
export const runtime = "nodejs";
export function POST(request: Request, { params }: { params: Promise<{ runId: string }> }) {
  return api(async () => {
    const { db } = await context(request);
    return answerActivity(db, (await params).runId, await body(request, ActivityAnswerRequest), requestKey(request));
  });
}
