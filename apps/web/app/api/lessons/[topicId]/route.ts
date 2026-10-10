import { api, context, learnerTopic } from "@/lib/backend/http";
import { publicLesson, ruleFor } from "@/lib/backend/service";

export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ topicId: string }> }) {
  return api(async () => {
    const { db } = await context(request);
    const { topicId } = await params;
    ruleFor(topicId);
    const topic = await learnerTopic(db, topicId);
    return publicLesson(topic, await db.state());
  });
}
