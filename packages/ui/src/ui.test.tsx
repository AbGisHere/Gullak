import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./components/button";
import { PlayMoneyBadge } from "./components/play-money-badge";
import { formatInr } from "./lib/format";

describe("ui", () => {
  it("formats paise as Indian-grouped rupees", () => {
    expect(formatInr(10_000_000)).toBe("₹1,00,000");
    expect(formatInr(12_345, { decimals: 2 })).toBe("₹123.45");
  });

  it("renders a button", () => {
    render(<Button>Start</Button>);
    expect(screen.getByRole("button", { name: "Start" })).toBeDefined();
  });

  it("labels play money", () => {
    render(<PlayMoneyBadge label="नकली पैसे" />);
    expect(screen.getByText("नकली पैसे")).toBeDefined();
  });
});
