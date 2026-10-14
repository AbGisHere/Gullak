import { describe, expect, it } from "vitest";
import { type AppScreen, previousScreen, recordScreen } from "./navigation-history";

const home: AppScreen = { path: "/", tab: "home" };
const story: AppScreen = { path: "/", tab: "twin" };
const help: AppScreen = { path: "/help", tab: "home" };

describe("in-app navigation history", () => {
  it("remembers the home screen when a story opens on the same URL", () => {
    expect(previousScreen(recordScreen([home], story))).toEqual(home);
  });

  it("restores the originating home section after a routed page", () => {
    expect(previousScreen(recordScreen([home, story], help))).toEqual(story);
  });

  it("does not add repeated taps on the current screen", () => {
    expect(recordScreen([home, story], story)).toEqual([home, story]);
  });

  it("pops a browser-back route instead of creating a back loop", () => {
    expect(recordScreen([home, story, help], story, true)).toEqual([home, story]);
  });

  it("truncates skipped screens after multi-entry native Back", () => {
    expect(recordScreen([home, { path: "/me", tab: "home" }, help], home, true)).toEqual([home]);
  });

  it("truncates virtual Home sections skipped by a native route traversal", () => {
    const me: AppScreen = { path: "/me", tab: "home" };
    expect(recordScreen([home, me, home, story], me, true)).toEqual([home, me]);
  });

  it("reconciles native traversal between two visits to the same path", () => {
    expect(recordScreen([home, { path: "/me", tab: "home" }, home], home, true)).toEqual([home]);
  });

  it("remembers explicit navigation even when revisiting the preceding screen", () => {
    expect(recordScreen([home, help], home)).toEqual([home, help, home]);
  });

  it("falls back home when there is no in-app predecessor", () => {
    expect(previousScreen([help])).toEqual(home);
    expect(previousScreen([])).toEqual(home);
  });

  it("keeps lesson and map routes distinct", () => {
    expect(
      previousScreen([home, { path: "/learn", tab: "home" }, { path: "/learn/money-basics", tab: "home" }]),
    ).toEqual({ path: "/learn", tab: "home" });
  });
});
