import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/data/database.types";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";

/** Browser client, or null when Supabase isn't configured (app runs on local state). */
export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured) return null;
  return createBrowserClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL!,
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
