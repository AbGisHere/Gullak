import { api, context } from "@/lib/backend/http";

export const runtime = "nodejs";
export async function GET(request: Request) {
  return api(async () => {
    return (await context(request)).service.progress();
  });
}
