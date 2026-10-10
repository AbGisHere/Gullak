import { OnboardingRequest } from "@gullak/types";
import { api, body, context } from "@/lib/backend/http";

export const runtime = "nodejs";
export async function POST(request: Request) {
  return api(async () => {
    const { service } = await context(request);
    return service.onboard(await body(request, OnboardingRequest));
  });
}
