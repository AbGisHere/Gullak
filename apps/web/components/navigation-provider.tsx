"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from "react";
import { type AppScreen, previousScreen, recordScreen } from "../lib/navigation-history";
import type { NavTab } from "./app-shell";

interface AppNavigation {
  backPath: string;
  currentTab: NavTab;
  canGoBack: boolean;
  isGoingBack: boolean;
  selectTab: (tab: NavTab) => void;
  goBack: () => void;
  resetNavigation: () => void;
}

const NavigationContext = createContext<AppNavigation | null>(null);

/** Lives above route layouts, so Home's originating section survives a routed visit. */
export function NavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [history, setHistory] = useState<AppScreen[]>([{ path: pathname, tab: "home" }]);
  const [isGoingBack, setIsGoingBack] = useState(false);
  const browserTraversal = useRef<string | null>(null);
  const observedPath = useRef(pathname);
  observedPath.current = pathname;

  useEffect(() => {
    const onPopState = () => {
      const targetPath = window.location.pathname;
      if (targetPath === observedPath.current) {
        // Traversal between duplicate route entries does not change usePathname.
        setHistory((previous) => recordScreen(previous, { path: targetPath, tab: "home" }, true));
        browserTraversal.current = null;
        setIsGoingBack(false);
      } else {
        browserTraversal.current = targetPath;
      }
    };
    // Keep this listener mounted across route changes. Rebinding it per path can
    // miss traversal while Next restores a cached route and flushes cleanup.
    window.addEventListener("popstate", onPopState, true);
    return () => window.removeEventListener("popstate", onPopState, true);
  }, []);

  useEffect(() => {
    // A fast native Back can overtake an unfinished route transition. Do not record
    // that stale render, or consume the traversal while observing a different route.
    if (window.location.pathname !== pathname) return;
    const traversing = browserTraversal.current === pathname;
    if (traversing) browserTraversal.current = null;
    setHistory((previous) => {
      const tab = pathname === "/" ? [...previous].reverse().find((screen) => screen.path === "/")?.tab : "home";
      return recordScreen(previous, { path: pathname, tab: tab ?? "home" }, traversing);
    });
    setIsGoingBack(false);
  }, [pathname]);

  const currentTab = [...history].reverse().find((screen) => screen.path === "/")?.tab ?? "home";

  function selectTab(tab: NavTab) {
    setHistory((previous) => recordScreen(previous, { path: "/", tab }));
    window.scrollTo({ top: 0 });
  }

  function goBack() {
    if (isGoingBack) return;
    const target = previousScreen(history);
    setHistory((previous) => (previous.length > 1 ? previous.slice(0, -1) : [target]));
    if (target.path === pathname) {
      window.scrollTo({ top: 0 });
    } else {
      // Browser entries can be replaced or skipped independently of virtual Home
      // sections. Navigate to our explicit in-app target, never an unknown entry.
      setIsGoingBack(true);
      router.replace(target.path);
    }
  }

  function resetNavigation() {
    setHistory([{ path: "/", tab: "home" }]);
  }

  return (
    <NavigationContext.Provider
      value={{
        backPath: previousScreen(history).path,
        currentTab,
        canGoBack: pathname !== "/" || currentTab !== "home" || history.length > 1,
        isGoingBack,
        selectTab,
        goBack,
        resetNavigation,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useAppNavigation(): AppNavigation {
  const navigation = useOptionalAppNavigation();
  if (!navigation) throw new Error("App navigation requires NavigationProvider");
  return navigation;
}

/** Recovery screens may outlive a failed provider; their fallback must still work. */
export function useOptionalAppNavigation(): AppNavigation | null {
  return useContext(NavigationContext);
}
