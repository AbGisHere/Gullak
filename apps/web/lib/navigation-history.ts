import type { NavTab } from "../components/app-shell";

/** Transient UI history only: never learner evidence, rewards or unlocks. */
export interface AppScreen {
  path: string;
  tab: NavTab;
}

const home: AppScreen = { path: "/", tab: "home" };

function sameScreen(left: AppScreen | undefined, right: AppScreen): boolean {
  return left?.path === right.path && left.tab === right.tab;
}

export function recordScreen(history: AppScreen[], next: AppScreen, browserTraversal = false): AppScreen[] {
  // Browser Back pops; deliberately opening a previous destination is a new visit.
  if (browserTraversal) {
    for (let index = history.length - 2; index >= 0; index--) {
      if (sameScreen(history[index], next)) return history.slice(0, index + 1);
    }
  }
  if (sameScreen(history.at(-1), next)) return history;
  return [...history, next];
}

export function previousScreen(history: AppScreen[]): AppScreen {
  return history.at(-2) ?? home;
}
