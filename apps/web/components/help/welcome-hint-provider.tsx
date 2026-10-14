"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import { WelcomeHintVisits } from "@/lib/welcome-hint";

const WelcomeHintContext = createContext<WelcomeHintVisits | null>(null);

export function WelcomeHintProvider({ children }: { children: ReactNode }) {
  const [visits] = useState(() => new WelcomeHintVisits(() => window.localStorage));
  return <WelcomeHintContext.Provider value={visits}>{children}</WelcomeHintContext.Provider>;
}

export function useWelcomeHintVisits(): WelcomeHintVisits {
  const visits = useContext(WelcomeHintContext);
  if (!visits) throw new Error("Welcome hints require the root WelcomeHintProvider");
  return visits;
}
