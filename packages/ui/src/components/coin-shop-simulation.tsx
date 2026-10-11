import { AlertCircle, CheckCircle2, Coins, RotateCcw, ShoppingBag, Sparkles } from "lucide-react";
import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { PlayMoneyBadge } from "./play-money-badge";

export interface CoinShopItem {
  id: string;
  name: string;
  category: "need" | "want";
  price: number;
  description: string;
  badge?: string;
}

export interface CoinWalletItem {
  id: string;
  denomination: number;
}

export interface CoinShopResult {
  itemsBought: string[];
  coinsSpent: number;
  coinsSaved: number;
  coveredNeeds: boolean;
  completedAt: string;
}

export interface CoinShopSimulationProps {
  initialWalletCoins?: CoinWalletItem[];
  shopItems?: CoinShopItem[];
  tillCoins?: number[];
  onComplete?: (result: CoinShopResult) => void;
  className?: string;
}

const defaultItems: CoinShopItem[] = [
  {
    id: "item-notebook",
    name: "School Notebook",
    category: "need",
    price: 2,
    description: "Essential for taking class notes and homework.",
    badge: "Need",
  },
  {
    id: "item-pencil",
    name: "Writing Pencil",
    category: "need",
    price: 1,
    description: "Required for daily classwork and drawing.",
    badge: "Need",
  },
  {
    id: "item-lollipop",
    name: "Mega Lollipop",
    category: "want",
    price: 2,
    description: "A delicious sweet treat, but not required for school.",
    badge: "Want",
  },
  {
    id: "item-sticker-pack",
    name: "Glitter Stickers",
    category: "want",
    price: 1,
    description: "Fun decorative stickers for your pencil box.",
    badge: "Want",
  },
];

const defaultWallet: CoinWalletItem[] = [
  { id: "coin-1", denomination: 2 },
  { id: "coin-2", denomination: 2 },
  { id: "coin-3", denomination: 1 },
];

/**
 * Greedily checks if a target amount can be formed by a set of till coins.
 */
function canMakeChange(till: number[], changeNeeded: number): boolean {
  if (changeNeeded === 0) return true;
  if (changeNeeded < 0) return false;
  const sorted = [...till].sort((a, b) => b - a);
  let rem = changeNeeded;
  for (const c of sorted) {
    if (c <= rem) {
      rem -= c;
    }
  }
  return rem === 0;
}

/**
 * World 1 Limited-Coin Shop simulation prototype.
 * Teaches scarcity, needs vs wants, exact change, and till constraints.
 */
export function CoinShopSimulation({
  initialWalletCoins = defaultWallet,
  shopItems = defaultItems,
  tillCoins = [1],
  onComplete,
  className,
}: CoinShopSimulationProps) {
  const [selectedItemIds, setSelectedItemIds] = React.useState<string[]>([]);
  const [selectedCoinIds, setSelectedCoinIds] = React.useState<string[]>([]);
  const [isCompleted, setIsCompleted] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const totalWalletValue = React.useMemo(
    () => initialWalletCoins.reduce((sum, c) => sum + c.denomination, 0),
    [initialWalletCoins],
  );

  const selectedItems = React.useMemo(
    () => shopItems.filter((item) => selectedItemIds.includes(item.id)),
    [shopItems, selectedItemIds],
  );

  const totalBasketCost = React.useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.price, 0),
    [selectedItems],
  );

  const offeredCoinsValue = React.useMemo(
    () => initialWalletCoins.filter((c) => selectedCoinIds.includes(c.id)).reduce((sum, c) => sum + c.denomination, 0),
    [initialWalletCoins, selectedCoinIds],
  );

  function toggleItem(id: string) {
    setErrorMessage(null);
    setSelectedItemIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function toggleCoin(id: string) {
    setErrorMessage(null);
    setSelectedCoinIds((prev) => (prev.includes(id) ? prev.filter((coin) => coin !== id) : [...prev, id]));
  }

  function handleReset() {
    setSelectedItemIds([]);
    setSelectedCoinIds([]);
    setErrorMessage(null);
    setIsCompleted(false);
  }

  function handlePay() {
    setErrorMessage(null);

    if (totalBasketCost === 0) {
      setErrorMessage("Select at least one item to purchase.");
      return;
    }

    if (totalBasketCost > totalWalletValue) {
      setErrorMessage(
        `Insufficient Candy Coins! Your basket costs ${totalBasketCost} coins, but your wallet only holds ${totalWalletValue} coins. Remove a want to proceed.`,
      );
      return;
    }

    if (offeredCoinsValue < totalBasketCost) {
      setErrorMessage(
        `You offered ${offeredCoinsValue} coins, but the basket costs ${totalBasketCost} coins. Select more coins from your wallet.`,
      );
      return;
    }

    const changeNeeded = offeredCoinsValue - totalBasketCost;
    if (changeNeeded > 0 && !canMakeChange(tillCoins, changeNeeded)) {
      setErrorMessage(
        `The shopkeeper till has no change for ${changeNeeded} coin(s)! Offer exact coins or a smaller denomination.`,
      );
      return;
    }

    const needsPresent = shopItems.filter((i) => i.category === "need").map((i) => i.id);
    const coveredNeeds = needsPresent.every((id) => selectedItemIds.includes(id));
    const coinsSaved = totalWalletValue - totalBasketCost;

    setIsCompleted(true);
    if (onComplete) {
      onComplete({
        itemsBought: selectedItemIds,
        coinsSpent: totalBasketCost,
        coinsSaved,
        coveredNeeds,
        completedAt: new Date().toISOString(),
      });
    }
  }

  if (isCompleted) {
    const coinsSaved = totalWalletValue - totalBasketCost;
    return (
      <div
        data-testid="coin-shop-completed"
        className={cn("rounded-2xl border bg-card p-6 text-card-foreground shadow-sm space-y-6", className)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xl font-bold">Transaction Complete!</h3>
          </div>
          <PlayMoneyBadge label="Candy Coins" />
        </div>

        <div className="rounded-xl border bg-muted/40 p-4 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Candyville Market Receipt
          </p>
          <ul className="space-y-1 text-sm divide-y">
            {selectedItems.map((item) => (
              <li key={item.id} className="pt-1 flex justify-between">
                <span>
                  {item.name} <span className="text-xs text-muted-foreground">({item.category})</span>
                </span>
                <span className="font-semibold">{item.price} coins</span>
              </li>
            ))}
          </ul>
          <div className="pt-2 border-t flex justify-between font-bold text-sm">
            <span>Total Spent</span>
            <span>{totalBasketCost} coins</span>
          </div>
          <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
            <span>Coins Saved in Gullak</span>
            <span>{coinsSaved} coins</span>
          </div>
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-primary">
            <Sparkles className="size-4" />
            <span>Key Financial Principle</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Living on limited coins means covering your essentials first. Coins you don't spend on temporary treats stay
            protected in your Gullak for unexpected emergencies!
          </p>
        </div>

        <Button
          data-testid="coin-shop-reset-btn"
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleReset}
        >
          <RotateCcw className="size-4" />
          <span>Try Another Basket Combination</span>
        </Button>
      </div>
    );
  }

  return (
    <div
      data-testid="coin-shop-simulation"
      className={cn("rounded-2xl border bg-card p-6 text-card-foreground shadow-sm space-y-6", className)}
    >
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-5 text-primary" />
            <h3 className="text-lg font-bold">Candyville Market Stall</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Spend your limited coins wisely. Buy what you need, check your change, and save the rest!
          </p>
        </div>
        <PlayMoneyBadge label="Candy Coins" />
      </header>

      {/* Wallet section */}
      <section className="space-y-2" aria-label="Learner Wallet">
        <div className="flex items-center justify-between text-sm font-semibold">
          <span className="flex items-center gap-1.5">
            <Coins className="size-4 text-amber-500" />
            Your Pocket Wallet ({totalWalletValue} coins total)
          </span>
          <span className="text-xs text-muted-foreground">Tap coins to pay (offered: {offeredCoinsValue})</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {initialWalletCoins.map((coin) => {
            const isSelected = selectedCoinIds.includes(coin.id);
            return (
              <button
                key={coin.id}
                type="button"
                data-testid={`coin-wallet-${coin.id}`}
                onClick={() => toggleCoin(coin.id)}
                className={cn(
                  "flex min-h-12 items-center justify-center gap-1.5 rounded-xl border p-2 text-sm font-bold transition-all",
                  isSelected
                    ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/30"
                    : "border-border bg-background hover:bg-muted/50",
                )}
              >
                <Coins className="size-4 text-amber-500" />
                <span>{coin.denomination}c</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Shop items */}
      <section className="space-y-3" aria-label="Market Items">
        <div className="text-sm font-semibold">Choose items for your basket:</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {shopItems.map((item) => {
            const isSelected = selectedItemIds.includes(item.id);
            const isNeed = item.category === "need";
            return (
              <button
                key={item.id}
                type="button"
                data-testid={`shop-item-${item.id}`}
                onClick={() => toggleItem(item.id)}
                className={cn(
                  "flex flex-col text-left rounded-xl border p-3.5 transition-all",
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border bg-background hover:bg-muted/30",
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-sm">{item.name}</span>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-bold",
                      isNeed
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "bg-purple-500/15 text-purple-700 dark:text-purple-300",
                    )}
                  >
                    {item.badge ?? item.category}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="text-sm font-bold text-primary">{item.price} coins</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Basket summary & errors */}
      <div className="rounded-xl bg-muted/30 border p-3.5 space-y-2">
        <div className="flex justify-between items-center text-sm font-semibold">
          <span>Basket Total:</span>
          <span className="text-base font-bold">{totalBasketCost} coins</span>
        </div>
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Coins Offered from Wallet:</span>
          <span className="font-semibold">{offeredCoinsValue} coins</span>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          data-testid="coin-shop-error"
          className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium leading-relaxed"
        >
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button type="button" data-testid="coin-shop-pay-btn" className="flex-1 font-bold" onClick={handlePay}>
          Pay {totalBasketCost} Coins
        </Button>
        <Button type="button" variant="outline" data-testid="coin-shop-clear-btn" onClick={handleReset}>
          Clear
        </Button>
      </div>
    </div>
  );
}
