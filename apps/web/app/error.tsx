"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/components/error-screen";

export default function AppError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return <ErrorScreen kind="error" onRetry={retry} fullPage />;
}
