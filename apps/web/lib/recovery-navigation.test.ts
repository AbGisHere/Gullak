import { describe, expect, it } from "vitest";
import { safeRecoveryPath } from "./recovery-navigation";

describe("safe recovery destinations", () => {
  it("uses Home when the origin is malformed", () => {
    expect(safeRecoveryPath("/learn", "not-an-origin")).toBe("/");
  });
  it.each([
    [undefined, "/"],
    ["/learn/money-basics", "/learn/money-basics"],
    ["/portfolio?tab=holdings#cash", "/portfolio?tab=holdings#cash"],
    ["https://outside.example/", "/"],
    ["//outside.example/", "/"],
    ["/\\outside.example/", "/"],
    ["/\n/outside.example/", "/"],
    ["/a/..//outside.example/", "/"],
    ["/.//outside.example/", "/"],
    ["/a/..//gullak.example/learn", "/"],
    ["javascript:alert(1)", "/"],
    ["relative-path", "/"],
  ])("keeps %s within the current app origin", (path, expected) => {
    expect(safeRecoveryPath(path, "https://gullak.example")).toBe(expected);
  });
});
