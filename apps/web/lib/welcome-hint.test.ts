import { describe, expect, it } from "vitest";
import { WelcomeHintVisits } from "./welcome-hint";

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  };
}

describe("Home welcome visits", () => {
  it("counts app visits, not repeated Home mounts or strict-mode effect replays", () => {
    const storage = memoryStorage();
    const first = new WelcomeHintVisits(() => storage);
    expect(first.begin("learner-a")).toBe(true);
    expect(first.begin("learner-a")).toBe(true);
    expect(storage.getItem("gullak-home-hint:learner-a")).toBe('{"visits":1,"dismissed":false}');
    expect(new WelcomeHintVisits(() => storage).begin("learner-a")).toBe(true);
    expect(new WelcomeHintVisits(() => storage).begin("learner-a")).toBe(false);
    expect(storage.getItem("gullak-home-hint:learner-a")).toBe('{"visits":2,"dismissed":false}');
  });

  it("persists dismissal without touching profile or evidence", () => {
    const storage = memoryStorage({ "gullak-learner-state": "evidence", "gullak-onboarding-profile": "profile" });
    const visit = new WelcomeHintVisits(() => storage);
    visit.begin("learner-a");
    visit.dismiss("learner-a");
    expect(visit.begin("learner-a")).toBe(false);
    expect(new WelcomeHintVisits(() => storage).begin("learner-a")).toBe(false);
    expect(storage.getItem("gullak-learner-state")).toBe("evidence");
    expect(storage.getItem("gullak-onboarding-profile")).toBe("profile");
  });

  it("isolates learners and normalizes case variants of the same UUID", () => {
    const visit = new WelcomeHintVisits(() => memoryStorage());
    visit.dismiss("LEARNER-A");
    expect(visit.begin("learner-a")).toBe(false);
    expect(visit.begin("learner-b")).toBe(true);
  });

  it("claims a legacy dismissal only for the current learner", () => {
    const storage = memoryStorage({ "gullak-map-hint-seen": "1" });
    const visit = new WelcomeHintVisits(() => storage);
    expect(visit.begin("learner-a")).toBe(false);
    expect(storage.getItem("gullak-map-hint-seen")).toBeNull();
    expect(new WelcomeHintVisits(() => storage).begin("learner-a")).toBe(false);
    expect(new WelcomeHintVisits(() => storage).begin("learner-b")).toBe(true);
  });

  it("keeps a migrated dismissal when removing the legacy key fails", () => {
    const storage = memoryStorage({ "gullak-map-hint-seen": "1" });
    storage.removeItem = () => {
      throw new Error("Blocked removal");
    };
    const visit = new WelcomeHintVisits(() => storage);
    expect(visit.begin("learner-a")).toBe(false);
    expect(visit.begin("learner-b")).toBe(true);
  });

  it.each([
    "bad-json",
    "null",
    "[]",
    '{"visits":-1,"dismissed":false}',
    '{"visits":3,"dismissed":false}',
    '{"visits":1.5,"dismissed":false}',
    '{"visits":0,"dismissed":"no"}',
    '{"visits":0,"dismissed":false,"extra":1}',
  ])("does not repeatedly show hints for malformed stored state: %s", (raw) => {
    const storage = memoryStorage({ "gullak-home-hint:learner-a": raw });
    expect(new WelcomeHintVisits(() => storage).begin("learner-a")).toBe(false);
  });

  it("keeps dismissal usable when obtaining browser storage throws", () => {
    const visit = new WelcomeHintVisits(() => {
      throw new Error("Storage blocked");
    });
    expect(visit.begin("learner-a")).toBe(true);
    visit.dismiss("learner-a");
    expect(visit.begin("learner-a")).toBe(false);
    expect(visit.begin("learner-b")).toBe(true);
  });

  it("retains per-visit dismissal when writes fail", () => {
    const storage = memoryStorage();
    storage.setItem = () => {
      throw new Error("Quota exceeded");
    };
    const visit = new WelcomeHintVisits(() => storage);
    expect(visit.begin("learner-a")).toBe(true);
    visit.dismiss("learner-a");
    expect(visit.begin("learner-a")).toBe(false);
  });
});
