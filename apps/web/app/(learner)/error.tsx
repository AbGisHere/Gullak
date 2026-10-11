"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/components/error-screen";

/** Keeps the learner shell (navigation, language) around a crashed page so the way back stays visible. */
export default function LearnerError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return <ErrorScreen kind="error" onRetry={retry} />;
}
