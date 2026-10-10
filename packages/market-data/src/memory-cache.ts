import type { Cache } from "./adapter";

/** In-process cache for tests and local dev. Not for production servers. */
export class MemoryCache implements Cache {
  readonly #store = new Map<string, { value: unknown; expiresAt: number }>();

  constructor(private readonly now: () => number = Date.now) {}

  async get<T>(key: string): Promise<T | undefined> {
    const hit = this.#store.get(key);
    if (!hit) return undefined;
    if (hit.expiresAt <= this.now()) {
      this.#store.delete(key);
      return undefined;
    }
    return hit.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.#store.set(key, { value, expiresAt: this.now() + ttlSeconds * 1000 });
  }
}
