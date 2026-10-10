import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../data/database.types";
import { isSupabaseConfigured, publicEnv } from "../env";
import { createSupabaseServerClient } from "../supabase/server";
import { ApiError } from "./errors";

export async function verifiedIdentity(request: Request) {
  if (!isSupabaseConfigured) throw new ApiError(503, "supabase_not_configured");
  const authorization = request.headers.get("authorization");
  let client: SupabaseClient<Database> | null;
  if (authorization) {
    const match = /^Bearer ([^\s]+)$/i.exec(authorization);
    if (!match) throw new ApiError(401, "authentication_required");
    client = createClient<Database>(
      publicEnv.NEXT_PUBLIC_SUPABASE_URL!,
      publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${match[1]}` } },
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      },
    );
    const { data, error } = await client.auth.getUser(match[1]);
    if (error || !data.user) throw new ApiError(401, "authentication_required");
    return { client, learnerId: data.user.id };
  }
  // Cookie writes need CSRF protection. Bearer requests do not use ambient cookies.
  if (!["GET", "HEAD"].includes(request.method)) {
    if (request.headers.get("origin") !== new URL(request.url).origin) throw new ApiError(403, "origin_forbidden");
  }
  client = await createSupabaseServerClient();
  if (!client) throw new ApiError(503, "supabase_not_configured");
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw new ApiError(401, "authentication_required");
  return { client, learnerId: data.user.id };
}

export function privilegedClient() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!isSupabaseConfigured || !key) throw new ApiError(503, "server_database_not_configured");
  return createClient<Database>(publicEnv.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
