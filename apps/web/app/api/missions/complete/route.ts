import { MissionCompletionRequest } from "@gullak/types";
import { api, body, context, requestKey } from "../../../../lib/backend/http";
import { completeMission } from "../../../../lib/backend/missions";

export const runtime = "nodejs";
export function POST(request: Request) {
  return api(async () => {
    const { db } = await context(request);
    return completeMission(db, await body(request, MissionCompletionRequest), requestKey(request));
  });
}
