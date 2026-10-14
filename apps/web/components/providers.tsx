"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { WelcomeHintProvider } from "./help/welcome-hint-provider";
import { NavigationProvider } from "./navigation-provider";
import { ThemeProvider } from "./theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } }));
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NavigationProvider>
          <WelcomeHintProvider>{children}</WelcomeHintProvider>
        </NavigationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
