import { GoalPlanRequest } from "@gullak/types";
import { api, body, context } from "@/lib/backend/http";

export const runtime = "nodejs";
export async function POST(request: Request) {
  return api(async () => {
    const { db, service } = await context(request);
    await db.state();
    return service.goal(await body(request, GoalPlanRequest));
  });
}
