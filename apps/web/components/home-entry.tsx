"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Onboarding, readProfile } from "@/components/onboarding";

export function HomeEntry() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (readProfile()) router.replace("/learn");
    else setReady(true);
  }, [router]);
  return ready ? <Onboarding /> : <main className="min-h-svh bg-background" aria-busy="true" />;
}
