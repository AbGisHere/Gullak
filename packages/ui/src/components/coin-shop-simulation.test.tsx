import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CoinShopSimulation } from "./coin-shop-simulation";

afterEach(() => {
  cleanup();
});

describe("CoinShopSimulation", () => {
  it("renders market items and learner wallet coins", () => {
    render(<CoinShopSimulation />);

    expect(screen.getByText("Candyville Market Stall")).toBeDefined();
    expect(screen.getByText(/School Notebook/i)).toBeDefined();
    expect(screen.getByText(/Writing Pencil/i)).toBeDefined();
    expect(screen.getByTestId("coin-wallet-coin-1")).toBeDefined();
    expect(screen.getByText(/Your Pocket Wallet/i)).toBeDefined();
  });

  it("shows an error when attempting to pay with an empty basket", () => {
    render(<CoinShopSimulation />);
    const payBtn = screen.getByTestId("coin-shop-pay-btn");
    fireEvent.click(payBtn);

    const error = screen.getByTestId("coin-shop-error");
    expect(error.textContent).toContain("Select at least one item to purchase");
  });

  it("checks for insufficient funds when basket cost exceeds total wallet coins", () => {
    render(
      <CoinShopSimulation
        initialWalletCoins={[{ id: "coin-1", denomination: 1 }]}
        shopItems={[{ id: "item-big", name: "Big Item", category: "need", price: 5, description: "Expensive" }]}
      />,
    );

    fireEvent.click(screen.getByTestId("shop-item-item-big"));
    fireEvent.click(screen.getByTestId("coin-shop-pay-btn"));

    const error = screen.getByTestId("coin-shop-error");
    expect(error.textContent).toContain("Insufficient Candy Coins");
  });

  it("checks for unavailable till change when offered coin requires change the shopkeeper cannot make", () => {
    // Wallet has a 5-coin piece, item costs 4 coins (change needed: 1 coin), till has empty change
    render(
      <CoinShopSimulation
        initialWalletCoins={[{ id: "coin-5", denomination: 5 }]}
        shopItems={[{ id: "item-4", name: "Item 4", category: "need", price: 4, description: "Costs 4" }]}
        tillCoins={[]} // Till cannot make 1 coin change
      />,
    );

    fireEvent.click(screen.getByTestId("shop-item-item-4"));
    fireEvent.click(screen.getByTestId("coin-wallet-coin-5"));
    fireEvent.click(screen.getByTestId("coin-shop-pay-btn"));

    const error = screen.getByTestId("coin-shop-error");
    expect(error.textContent).toContain("The shopkeeper till has no change");
  });

  it("completes purchase successfully when coins and change are valid", () => {
    const onCompleteMock = vi.fn();
    render(
      <CoinShopSimulation
        initialWalletCoins={[
          { id: "coin-1", denomination: 2 },
          { id: "coin-2", denomination: 1 },
        ]}
        shopItems={[{ id: "item-1", name: "Pencil", category: "need", price: 1, description: "Daily need" }]}
        tillCoins={[1]}
        onComplete={onCompleteMock}
      />,
    );

    fireEvent.click(screen.getByTestId("shop-item-item-1"));
    fireEvent.click(screen.getByTestId("coin-wallet-coin-2")); // offered 1 coin for 1 coin price
    fireEvent.click(screen.getByTestId("coin-shop-pay-btn"));

    expect(screen.getByTestId("coin-shop-completed")).toBeDefined();
    expect(screen.getByText("Transaction Complete!")).toBeDefined();
    expect(screen.getByText(/Key Financial Principle/i)).toBeDefined();
    expect(onCompleteMock).toHaveBeenCalledTimes(1);
    const result = onCompleteMock.mock.calls[0]?.[0];
    expect(result.coinsSpent).toBe(1);
    expect(result.coinsSaved).toBe(2);
    expect(result.coveredNeeds).toBe(true);
  });
});
