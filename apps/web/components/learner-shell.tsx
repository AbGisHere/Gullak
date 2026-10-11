"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { readProfile } from "@/components/onboarding";
import { ShellFrame } from "@/components/shell-frame";

export function LearnerShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [profileReady, setProfileReady] = useState(false);
  useEffect(() => {
    if (!readProfile()) router.replace("/");
    setProfileReady(true);
  }, [router]);
  return <ShellFrame>{profileReady ? children : null}</ShellFrame>;
}
