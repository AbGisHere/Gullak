import { QuizSubmission } from "@gullak/types";
import { api, body, context, learnerVersionedTopic, requestKey } from "@/lib/backend/http";
import { ruleFor } from "@/lib/backend/service";

export const runtime = "nodejs";
export async function POST(request: Request, { params }: { params: Promise<{ topicId: string }> }) {
  return api(async () => {
    const { db, service } = await context(request);
    const { topicId } = await params;
    ruleFor(topicId);
    const input = await body(request, QuizSubmission);
    const { topic, contentVersion } = await learnerVersionedTopic(db, topicId);
    return service.quiz(topic, input, requestKey(request), contentVersion);
  });
}
