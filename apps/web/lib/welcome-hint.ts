import { z } from "zod";

const WelcomeHintState = z.object({ visits: z.number().int().min(0).max(2), dismissed: z.boolean() }).strict();
type WelcomeHintState = z.infer<typeof WelcomeHintState>;
type HintStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
type Visit = { state: WelcomeHintState; visible: boolean };
const legacyKey = "gullak-map-hint-seen";

/** Browser-only visit memory. One instance survives client navigation, never a server session/cache. */
export class WelcomeHintVisits {
  private readonly visits = new Map<string, Visit>();
  private legacyClaimed = false;

  constructor(private readonly storage: () => HintStorage) {}

  private key(learnerId: string): string {
    return `gullak-home-hint:${learnerId.toLowerCase()}`;
  }

  private read(learnerId: string): WelcomeHintState {
    try {
      const storage = this.storage();
      const raw = storage.getItem(this.key(learnerId));
      if (raw !== null) {
        try {
          const result = WelcomeHintState.safeParse(JSON.parse(raw));
          return result.success ? result.data : { visits: 2, dismissed: true };
        } catch {
          return { visits: 2, dismissed: true };
        }
      }
      if (!this.legacyClaimed && storage.getItem(legacyKey) === "1") {
        this.legacyClaimed = true;
        const state = { visits: 0, dismissed: true };
        if (this.write(learnerId, state)) {
          try {
            storage.removeItem(legacyKey);
          } catch {
            // This visit still remembers which learner claimed the legacy dismissal.
          }
        }
        return state;
      }
    } catch {
      // Blocked storage: orientation and dismissal remain usable for this app visit.
    }
    return { visits: 0, dismissed: false };
  }

  private write(learnerId: string, state: WelcomeHintState): boolean {
    try {
      this.storage().setItem(this.key(learnerId), JSON.stringify(state));
      return true;
    } catch {
      return false;
    }
  }

  begin(learnerId: string): boolean {
    const id = learnerId.toLowerCase();
    const existing = this.visits.get(id);
    if (existing) return existing.visible;
    const state = this.read(id);
    const visible = !state.dismissed && state.visits < 2;
    const next = { ...state, visits: visible ? state.visits + 1 : state.visits };
    this.visits.set(id, { state: next, visible });
    if (visible) this.write(id, next);
    return visible;
  }

  dismiss(learnerId: string): void {
    const id = learnerId.toLowerCase();
    this.begin(id);
    const visit = this.visits.get(id);
    if (!visit) return;
    const state = { ...visit.state, dismissed: true };
    this.visits.set(id, { state, visible: false });
    this.write(id, state);
  }
}
