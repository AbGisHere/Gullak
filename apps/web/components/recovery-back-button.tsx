"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { createContext, type ReactNode, useContext } from "react";
import { safeRecoveryPath } from "../lib/recovery-navigation";
import { useOptionalAppNavigation } from "./navigation-provider";

const ShellBackContext = createContext(false);

/** Nested recovery content uses the existing shell button instead of duplicating it. */
export function ShellBackScope({ children }: { children: ReactNode }) {
  return <ShellBackContext.Provider value={true}>{children}</ShellBackContext.Provider>;
}

export function RecoveryBackButton() {
  const hasShellBack = useContext(ShellBackContext);
  const navigation = useOptionalAppNavigation();
  const t = useTranslations("onboarding");
  if (hasShellBack) return null;

  function recover() {
    const path = safeRecoveryPath(navigation?.backPath, window.location.origin);
    if (navigation && !navigation.isGoingBack && path === navigation.backPath && path !== window.location.pathname) {
      navigation.goBack();
    } else {
      // Clear a same-route error boundary, or recover when the provider failed.
      // Hard navigation changes no saved learner data and only uses a local path.
      window.location.assign(path);
    }
  }

  return (
    <button
      type="button"
      data-testid="recovery-back"
      onClick={recover}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-base font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <ArrowLeft className="size-5" aria-hidden="true" />
      {t("back")}
    </button>
  );
}
