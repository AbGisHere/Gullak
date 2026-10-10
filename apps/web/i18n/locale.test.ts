import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import en from "../messages/en.json";
import { resolveLocale, SUPPORTED_LOCALES } from "./locale";

function keys(obj: object, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === "object" && v !== null ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

describe("i18n", () => {
  it("prefers the cookie, then Accept-Language, then the default", () => {
    expect(resolveLocale("te", "hi-IN")).toBe("te");
    expect(resolveLocale(undefined, "hi-IN,en;q=0.8")).toBe("hi");
    expect(resolveLocale("fr", "fr-FR")).toBe("en");
  });

  it("has a complete messages file for every supported locale", async () => {
    const files = readdirSync(new URL("../messages", import.meta.url)).map((f) => f.replace(".json", ""));
    expect(files.sort()).toEqual([...SUPPORTED_LOCALES].sort());
    for (const locale of SUPPORTED_LOCALES) {
      const messages = (await import(`../messages/${locale}.json`)).default;
      expect(keys(messages), locale).toEqual(keys(en));
    }
  });
});
