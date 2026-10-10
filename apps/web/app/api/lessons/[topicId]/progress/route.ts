import { LessonProgressRequest } from "@gullak/types";
import { api, body, context, learnerTopic } from "@/lib/backend/http";
import { ruleFor } from "@/lib/backend/service";

export const runtime = "nodejs";
export async function POST(request: Request, { params }: { params: Promise<{ topicId: string }> }) {
  return api(async () => {
    const { db, service } = await context(request);
    const { topicId } = await params;
    ruleFor(topicId);
    const input = await body(request, LessonProgressRequest);
    return service.lesson(await learnerTopic(db, topicId), input.variantId);
  });
}
