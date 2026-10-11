"use client";

import { PlayMoneyBadge } from "@gullak/ui/components/play-money-badge";
import { formatInr } from "@gullak/ui/lib/format";
import { cn } from "@gullak/ui/lib/utils";
import { Bus, RotateCcw, ShoppingBag, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Gullu, type GulluState } from "../gullu";
import { SpeechBubble } from "../speech-bubble";
import { APPLY_QUESTIONS, type BasketItem, KIRANA_ITEMS, type ShoppingItem } from "./types";

interface ShoppingMissionProps {
  onClose: () => void;
  onCompleteMission: (xpEarned: number) => void;
}

type MissionStep = "intro" | "shelf" | "consequences" | "understand" | "apply" | "complete";

const INITIAL_BUDGET_PAISE = 5000; // ₹50
const BUS_FARE_PAISE = 1000; // ₹10

export function ShoppingMission({ onClose, onCompleteMission }: ShoppingMissionProps) {
  const [step, setStep] = useState<MissionStep>("intro");
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [gulluState, setGulluState] = useState<GulluState>("wave");
  const [gulluMessage, setGulluMessage] = useState(
    "Namaste! Amma gave us ₹50 for school supplies. We need a notebook for tomorrow, plus ₹10 for the bus home. Let's see what Ravi uncle has!",
  );
  const [reactionCounter, setReactionCounter] = useState(0);
  const [history, setHistory] = useState<BasketItem[][]>([]);
  const [applyAnswers, setApplyAnswers] = useState<Record<string, "need" | "want">>({});
  const [nudgeItem, setNudgeItem] = useState<string | null>(null);

  // Calculations
  const spentPaise = basket.reduce((acc, item) => acc + item.pricePaise, 0);
  const remainingPaise = INITIAL_BUDGET_PAISE - spentPaise;
  const hasNotebook = basket.some((i) => i.id === "notebook");
  const hasBusFare = remainingPaise >= BUS_FARE_PAISE;

  function handleAddItem(item: ShoppingItem) {
    if (remainingPaise < item.pricePaise) {
      setNudgeItem(item.id);
      setTimeout(() => setNudgeItem(null), 600);
      setGulluState("concerned");
      setGulluMessage(`We only have ${formatInr(remainingPaise)} left! We can't afford ${item.name} right now.`);
      setReactionCounter((c) => c + 1);
      return;
    }

    const cartItem: BasketItem = {
      ...item,
      cartId: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };

    setHistory((prev) => [...prev, [...basket]]);
    const nextBasket = [...basket, cartItem];
    setBasket(nextBasket);
    setGulluState(item.gulluReaction.state);
    setGulluMessage(item.gulluReaction.message);
    setReactionCounter((c) => c + 1);
  }

  function handleRemoveItem(itemIndex: number) {
    setHistory((prev) => [...prev, [...basket]]);
    const removedItem = basket[itemIndex];
    const nextBasket = basket.filter((_, idx) => idx !== itemIndex);
    setBasket(nextBasket);
    setGulluState("thinking");
    setGulluMessage(
      `Put back ${removedItem?.name ?? "item"}. ₹${(removedItem?.pricePaise ?? 0) / 100} returned to our wallet!`,
    );
    setReactionCounter((c) => c + 1);
  }

  function handleUndo() {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    if (previous) {
      setBasket(previous);
      setGulluState("curious");
      setGulluMessage("Rewound our last choice! Take your time to decide.");
      setReactionCounter((c) => c + 1);
    }
  }

  function handleRewindFromConsequence() {
    setStep("shelf");
    setGulluState("encouraging");
    setGulluMessage(
      "Time machine activated! You're back at Ravi uncle's shop. Try planning so you have ₹10 for the bus!",
    );
    setReactionCounter((c) => c + 1);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F7F3E8] dark:bg-[#0B1120] text-[#171717] dark:text-[#F8FAFC] overflow-hidden select-none">
      {/* Top Game HUD Header */}
      <header className="sticky top-0 z-30 flex h-14 sm:h-16 w-full items-center justify-between border-b-2 border-[#171717] dark:border-[#334155] bg-[#FFFDF7] dark:bg-[#1E293B] px-3 sm:px-6 shadow-[0_2px_0_#171717] dark:shadow-[0_2px_0_#000000]">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Exit shopping mission"
            className="flex size-9 sm:size-10 items-center justify-center rounded-xl border-2 border-[#171717] dark:border-[#334155] bg-[#ECE8DF] dark:bg-[#162032] hover:bg-[#DFFF3F] dark:hover:bg-[#DFFF3F] dark:hover:text-[#0B1120] transition-colors"
          >
            <X className="size-5" />
          </button>
          <div>
            <h1 className="font-display text-sm sm:text-base font-extrabold leading-none">Candy Economy · Mission 1</h1>
            <p className="text-[11px] font-bold text-[#171717]/70 dark:text-[#94A3B8]">Ravi Uncle&apos;s Kirana</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wallet Coins Counter */}
          <div className="flex items-center gap-1.5 rounded-xl border-2 border-[#171717] dark:border-[#334155] bg-[#DFFF3F] text-[#171717] px-2.5 sm:px-3 py-1 font-display text-sm sm:text-base font-black shadow-[2px_2px_0_#171717] dark:shadow-[2px_2px_0_#000000]">
            <span className="text-base sm:text-lg">🪙</span>
            <span className="tabular">{formatInr(remainingPaise)}</span>
          </div>

          <PlayMoneyBadge label="Play Money" />
        </div>
      </header>

      {/* Progress Dots / Steps Indicator */}
      <div className="flex items-center justify-center gap-1.5 py-2 border-b border-[#171717]/10 dark:border-[#334155] bg-[#ECE8DF]/40 dark:bg-[#162032]/40">
        {(["intro", "shelf", "consequences", "understand", "apply", "complete"] as const).map((s, idx) => {
          const stepOrder = ["intro", "shelf", "consequences", "understand", "apply", "complete"];
          const currentIdx = stepOrder.indexOf(step);
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <div
              key={s}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                isCurrent
                  ? "w-6 bg-[#171717] dark:bg-[#DFFF3F]"
                  : isDone
                    ? "w-2 bg-[#DFFF3F] border border-[#171717] dark:border-[#334155]"
                    : "w-2 bg-[#171717]/20 dark:bg-[#94A3B8]/30",
              )}
            />
          );
        })}
      </div>

      {/* Step Container */}
      <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 max-w-4xl mx-auto w-full flex flex-col justify-between">
        {/* ================= STEP 1: INTRO ================= */}
        {step === "intro" && (
          <div className="flex flex-col items-center justify-center my-auto space-y-6 text-center max-w-lg mx-auto py-6">
            <Gullu
              state={gulluState}
              size={140}
              reactionKey={reactionCounter}
              onTap={() => {
                setGulluMessage("Hehehe! I'm ready to shop! Tap 'Enter Shop' to start!");
              }}
              tapLabel="Gullu says namaste"
            />

            <SpeechBubble speakerName="Gullu" variant="paper" className="w-full text-left">
              {gulluMessage}
            </SpeechBubble>

            <div className="w-full rounded-2xl border-2 border-[#171717] dark:border-[#334155] bg-[#FFFDF7] dark:bg-[#1E293B] p-4 text-left shadow-[4px_4px_0_#171717] dark:shadow-[4px_4px_0_#000000] space-y-3">
              <div className="flex items-center gap-2 font-display text-sm font-extrabold uppercase text-[#FF6847]">
                <Sparkles className="size-4" />
                <span>Your Mission Goal</span>
              </div>
              <ul className="text-xs sm:text-sm font-medium space-y-2 text-[#171717] dark:text-[#F8FAFC]">
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6847] font-bold">1.</span>
                  <span>
                    Buy a <strong>Class Notebook</strong> for school tomorrow.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6847] font-bold">2.</span>
                  <span>
                    Save <strong>₹10 for Bus Fare</strong> to ride home safely.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6847] font-bold">3.</span>
                  <span>Use any leftover money as you wish (or keep it in Gullu)!</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => {
                setStep("shelf");
                setGulluState("curious");
                setGulluMessage(
                  "Here we are at Ravi uncle's kirana! Tap any item on the shelf to put it in our basket.",
                );
              }}
              className="g-btn w-full text-lg py-3.5"
            >
              Enter Kirana Shop →
            </button>
          </div>
        )}

        {/* ================= STEP 2: SHELF & SHOPPING ================= */}
        {step === "shelf" && (
          <div className="space-y-4 pb-6">
            {/* Kirana Roof Awning & Dialogue */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-[#171717] dark:border-[#334155] bg-[#FFFDF7] dark:bg-[#1E293B] p-3 sm:p-4 shadow-[4px_4px_0_#171717] dark:shadow-[4px_4px_0_#000000]">
              {/* Awning Stripes */}
              <div className="absolute top-0 left-0 right-0 h-3 bg-[repeating-linear-gradient(45deg,#FF6847,#FF6847_14px,#FFFDF7_14px,#FFFDF7_28px)] dark:bg-[repeating-linear-gradient(45deg,#FF6847,#FF6847_14px,#1E293B_14px,#1E293B_28px)] border-b-2 border-[#171717] dark:border-[#334155]" />

              <div className="flex items-start gap-3 sm:gap-4 mt-2">
                <Gullu
                  state={gulluState}
                  size={76}
                  reactionKey={reactionCounter}
                  onTap={() => {
                    setGulluState("happy");
                    setGulluMessage("Need advice? Make sure the notebook and bus fare are funded first!");
                  }}
                  tapLabel="Ask Gullu"
                />
                <div className="flex-1">
                  <SpeechBubble
                    speakerName="Gullu"
                    variant="paper"
                    tailPosition="left"
                    className="p-2.5 sm:p-3 text-xs sm:text-sm"
                  >
                    {gulluMessage}
                  </SpeechBubble>
                </div>
              </div>
            </div>

            {/* Shelf Items Grid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-xs sm:text-sm font-extrabold uppercase tracking-wide text-[#171717]/80 dark:text-[#94A3B8]">
                  Ravi Uncle&apos;s Shelf · Tap to add
                </span>
                <span className="text-xs font-bold text-[#FF6847]">
                  {remainingPaise < BUS_FARE_PAISE ? "⚠️ Bus fare at risk!" : "✓ Bus fare safe"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                {KIRANA_ITEMS.map((item) => {
                  const isAffordable = remainingPaise >= item.pricePaise;
                  const inBasketCount = basket.filter((b) => b.id === item.id).length;
                  const isNudged = nudgeItem === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleAddItem(item)}
                      disabled={!isAffordable}
                      className={cn(
                        "g-tap flex flex-col justify-between rounded-2xl p-3 text-left relative",
                        !isAffordable &&
                          "opacity-50 grayscale hover:translate-y-0 hover:shadow-[4px_4px_0_#171717] dark:hover:shadow-[4px_4px_0_#000000]",
                        isNudged && "g-nudge",
                      )}
                    >
                      {item.temptationBadge && (
                        <span className="absolute -top-2 -right-1 rounded-full bg-[#FF6847] text-white px-2 py-0.5 text-[9px] font-black border border-[#171717] dark:border-[#334155] shadow-xs">
                          {item.temptationBadge}
                        </span>
                      )}

                      <div className="flex items-start justify-between">
                        <span className="text-2xl sm:text-3xl">{item.icon}</span>
                        <span className="rounded-lg border-2 border-[#171717] dark:border-[#334155] bg-[#FFD84D] text-[#171717] px-1.5 py-0.5 font-display text-xs sm:text-sm font-extrabold shadow-xs">
                          {formatInr(item.pricePaise)}
                        </span>
                      </div>

                      <div className="mt-2">
                        <p className="font-display text-xs sm:text-sm font-black leading-tight text-[#171717] dark:text-[#F8FAFC]">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-[#171717]/70 dark:text-[#94A3B8] line-clamp-1 mt-0.5">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-2.5 pt-1.5 border-t border-[#171717]/10 dark:border-[#334155] flex items-center justify-between text-[11px] font-bold">
                        <span
                          className={cn(
                            item.category === "need"
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-[#FF6847] dark:text-[#FF8A65]",
                          )}
                        >
                          {item.category === "need" ? "Essential" : "Treat"}
                        </span>
                        {inBasketCount > 0 && (
                          <span className="rounded-full bg-[#171717] dark:bg-[#DFFF3F] text-white dark:text-[#171717] size-5 grid place-items-center text-[10px] font-bold">
                            {inBasketCount}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shopping Basket Tray */}
            <div className="rounded-2xl border-2 border-[#171717] dark:border-[#334155] bg-[#FFFDF7] dark:bg-[#1E293B] p-3 sm:p-4 shadow-[4px_4px_0_#171717] dark:shadow-[4px_4px_0_#000000]">
              <div className="flex items-center justify-between border-b border-[#171717]/10 dark:border-[#334155] pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="size-4" />
                  <span className="font-display text-xs sm:text-sm font-extrabold uppercase">
                    Your Basket ({basket.length} items)
                  </span>
                </div>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={handleUndo}
                    className="flex items-center gap-1 text-xs font-bold text-[#171717] dark:text-[#F8FAFC] hover:text-[#FF6847]"
                  >
                    <RotateCcw className="size-3" />
                    <span>Undo</span>
                  </button>
                )}
              </div>

              {basket.length === 0 ? (
                <p className="text-xs sm:text-sm text-[#171717]/60 dark:text-[#94A3B8] italic py-2">
                  Basket is empty. Tap any item from the shelf above to add it.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 py-1 max-h-28 overflow-y-auto">
                  {basket.map((item, idx) => (
                    <button
                      key={item.cartId}
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      title="Tap to remove"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#171717] dark:border-[#334155] bg-[#ECE8DF] dark:bg-[#162032] text-[#171717] dark:text-[#F8FAFC] px-2.5 py-1 text-xs font-bold hover:bg-[#FF6847] hover:text-white transition-colors"
                    >
                      <span>{item.icon}</span>
                      <span>{item.name}</span>
                      <span className="text-[10px] opacity-70">({formatInr(item.pricePaise)})</span>
                      <X className="size-3 ml-0.5" />
                    </button>
                  ))}
                </div>
              )}

              {/* Basket Summary & Next Action */}
              <div className="mt-3 pt-3 border-t-2 border-[#171717]/10 dark:border-[#334155] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs sm:text-sm text-left w-full sm:w-auto">
                  <span>
                    Total spent: <strong>{formatInr(spentPaise)}</strong>
                  </span>
                  <span className="mx-2">•</span>
                  <span>
                    Leftover: <strong>{formatInr(remainingPaise)}</strong>
                  </span>
                </div>

                <button
                  type="button"
                  disabled={basket.length === 0}
                  onClick={() => {
                    setStep("consequences");
                    if (!hasBusFare) {
                      setGulluState("concerned");
                      setGulluMessage("Oh dear! We don't have ₹10 for the bus! Look what happens...");
                    } else if (!hasNotebook) {
                      setGulluState("thinking");
                      setGulluMessage("We got the bus fare, but forgot the notebook! Let's see school tomorrow...");
                    } else {
                      setGulluState("celebrate");
                      setGulluMessage("Notebook purchased AND bus fare safe! Perfect balance!");
                    }
                  }}
                  className="g-btn w-full sm:w-auto text-sm sm:text-base py-2.5 px-6"
                >
                  Pay &amp; Go Home →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: CONSEQUENCES ================= */}
        {step === "consequences" && (
          <div className="space-y-6 my-auto max-w-lg mx-auto py-4">
            <div className="text-center space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-[#FF6847]">Observe Consequences</span>
              <h2 className="font-display text-2xl font-black">How Your Decision Played Out</h2>
            </div>

            {/* Scene 1: The Bus Conductor */}
            <div className="rounded-2xl border-2 border-[#171717] dark:border-[#334155] bg-[#FFFDF7] dark:bg-[#1E293B] p-4 shadow-[4px_4px_0_#171717] dark:shadow-[4px_4px_0_#000000] space-y-3">
              <div className="flex items-center gap-2 font-display text-base font-extrabold">
                <Bus className="size-5 text-[#FF6847]" />
                <span>Scene 1 · 4:00 PM: The Red Bus Stop</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-3xl">{hasBusFare ? "🚌" : "🚶‍♂️"}</span>
                <div className="text-xs sm:text-sm leading-relaxed">
                  {hasBusFare ? (
                    <p className="text-emerald-800 dark:text-emerald-300 font-semibold">
                      <strong>You paid ₹10 to the conductor!</strong> You and Gullu sat comfortably by the window and
                      reached home in 10 minutes safely!
                    </p>
                  ) : (
                    <p className="text-[#FF6847] dark:text-[#FF8A65] font-semibold">
                      <strong>Not enough for bus fare!</strong> You only had {formatInr(remainingPaise)} left. The
                      conductor couldn&apos;t give you a ticket, so you had to walk 40 minutes under the hot sun with
                      sore feet!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Scene 2: School the Next Day */}
            <div className="rounded-2xl border-2 border-[#171717] dark:border-[#334155] bg-[#FFFDF7] dark:bg-[#1E293B] p-4 shadow-[4px_4px_0_#171717] dark:shadow-[4px_4px_0_#000000] space-y-3">
              <div className="flex items-center gap-2 font-display text-base font-extrabold">
                <span>🏫</span>
                <span>Scene 2 · Next Morning in Class</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-3xl">{hasNotebook ? "✍️" : "📄"}</span>
                <div className="text-xs sm:text-sm leading-relaxed">
                  {hasNotebook ? (
                    <p className="text-emerald-800 dark:text-emerald-300 font-semibold">
                      <strong>Teacher checked homework:</strong> &quot;Well done! You have your clean math notebook
                      ready!&quot; You scored full marks for preparation.
                    </p>
                  ) : (
                    <p className="text-amber-800 dark:text-amber-300 font-semibold">
                      <strong>No notebook:</strong> You forgot the notebook! You had to borrow rough sheets from a
                      friend and copy down the teacher&apos;s blackboard notes hurriedly.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Rewind Option or Continue */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleRewindFromConsequence}
                className="g-btn g-btn--paper w-full sm:flex-1 py-3 text-sm font-extrabold"
              >
                <RotateCcw className="size-4" />
                <span>⟲ Rewind &amp; Try Again</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("understand");
                  setGulluState("thinking");
                  setGulluMessage("Here is the secret to good money choices: dividing things into Needs vs Wants!");
                }}
                className="g-btn w-full sm:flex-1 py-3 text-sm font-extrabold"
              >
                Understand Concept →
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: UNDERSTAND (CONCEPT REVEAL) ================= */}
        {step === "understand" && (
          <div className="space-y-6 my-auto max-w-lg mx-auto py-4">
            <div className="text-center space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-[#FF6847]">Concept Reveal</span>
              <h2 className="font-display text-2xl font-black">Needs vs Wants: The 2 Jars Rule</h2>
            </div>

            {/* Two Animated Jars */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Needs Jar */}
              <div className="rounded-2xl border-2 border-[#171717] dark:border-[#334155] bg-[#DFFF3F]/30 dark:bg-[#DFFF3F]/15 p-3 sm:p-4 shadow-[4px_4px_0_#171717] dark:shadow-[4px_4px_0_#000000] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-display text-sm sm:text-base font-black text-[#171717] dark:text-[#F8FAFC]">
                    <span>🌱</span>
                    <span>NEEDS</span>
                  </div>
                  <p className="text-[11px] text-[#171717]/80 dark:text-[#94A3B8] mt-1">
                    Things you <strong>must have</strong> to survive, learn, stay healthy, or travel.
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#171717]/20 dark:border-[#334155] space-y-1 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  <p>✓ Notebook (School)</p>
                  <p>✓ ₹10 Bus Fare</p>
                  <p>✓ Pencil / Medicine</p>
                </div>
              </div>

              {/* Wants Jar */}
              <div className="rounded-2xl border-2 border-[#171717] dark:border-[#334155] bg-[#CBB5FF]/30 dark:bg-[#CBB5FF]/15 p-3 sm:p-4 shadow-[4px_4px_0_#171717] dark:shadow-[4px_4px_0_#000000] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-display text-sm sm:text-base font-black text-[#171717] dark:text-[#F8FAFC]">
                    <span>⭐</span>
                    <span>WANTS</span>
                  </div>
                  <p className="text-[11px] text-[#171717]/80 dark:text-[#94A3B8] mt-1">
                    Things that are <strong>fun and nice</strong>, but you can live safely without them.
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#171717]/20 dark:border-[#334155] space-y-1 text-xs font-bold text-purple-900 dark:text-purple-300">
                  <p>• Kite / Toys</p>
                  <p>• Chocolate &amp; Soda</p>
                  <p>• Fancy Stickers</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-[#171717] dark:border-[#334155] bg-[#FFFDF7] dark:bg-[#1E293B] p-4 shadow-[4px_4px_0_#171717] dark:shadow-[4px_4px_0_#000000] text-xs sm:text-sm leading-relaxed space-y-2">
              <p className="font-bold text-[#171717] dark:text-[#F8FAFC]">
                💡 <strong>Important Truth:</strong> Wants are NOT bad!
              </p>
              <p className="text-[#171717]/80 dark:text-[#94A3B8]">
                Everyone enjoys treats! But smart money managers always fund their{" "}
                <strong>essential needs first</strong>. Whatever is leftover can be spent on wants or saved in Gullak
                for bigger dreams!
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setStep("apply");
                setGulluState("encouraging");
                setGulluMessage("Time to test your superpower! Try these 3 quick real-life examples.");
              }}
              className="g-btn w-full text-base py-3"
            >
              Test Your Superpower (3 Quick Drills) →
            </button>
          </div>
        )}

        {/* ================= STEP 5: APPLY (DRILLS) ================= */}
        {step === "apply" && (
          <div className="space-y-4 my-auto max-w-lg mx-auto py-2">
            <div className="text-center space-y-0.5">
              <span className="text-xs font-black uppercase tracking-wider text-[#FF6847]">
                Quick Drill · 3 Questions
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-black">Need or Want? You Decide!</h2>
            </div>

            <div className="space-y-3">
              {APPLY_QUESTIONS.map((q, idx) => {
                const answer = applyAnswers[q.id];
                const isAnswered = answer !== undefined;
                const isCorrect = answer === q.category;

                return (
                  <div
                    key={q.id}
                    className="rounded-2xl border-2 border-[#171717] dark:border-[#334155] bg-[#FFFDF7] dark:bg-[#1E293B] p-3 sm:p-4 shadow-[3px_3px_0_#171717] dark:shadow-[3px_3px_0_#000000] space-y-2.5"
                  >
                    <p className="font-display text-xs sm:text-sm font-bold text-[#171717] dark:text-[#F8FAFC]">
                      {idx + 1}. {q.prompt}
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setApplyAnswers((prev) => ({ ...prev, [q.id]: "need" }))}
                        className={cn(
                          "g-btn g-btn--sm py-2 text-xs",
                          answer === "need"
                            ? "bg-[#DFFF3F] text-[#171717]"
                            : "bg-[#ECE8DF] dark:bg-[#162032] text-[#171717] dark:text-[#F8FAFC]",
                        )}
                      >
                        Essential Need 🌱
                      </button>

                      <button
                        type="button"
                        onClick={() => setApplyAnswers((prev) => ({ ...prev, [q.id]: "want" }))}
                        className={cn(
                          "g-btn g-btn--sm py-2 text-xs",
                          answer === "want"
                            ? "bg-[#CBB5FF] text-[#171717]"
                            : "bg-[#ECE8DF] dark:bg-[#162032] text-[#171717] dark:text-[#F8FAFC]",
                        )}
                      >
                        Fun Want ⭐
                      </button>
                    </div>

                    {isAnswered && (
                      <div
                        className={cn(
                          "rounded-xl p-2.5 text-xs font-medium border leading-snug",
                          isCorrect
                            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200"
                            : "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200",
                        )}
                      >
                        <p className="font-bold">{isCorrect ? "✓ Spot on!" : "💡 Think about this:"}</p>
                        <p>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              disabled={Object.keys(applyAnswers).length < APPLY_QUESTIONS.length}
              onClick={() => {
                setStep("complete");
                setGulluState("celebrate");
                setGulluMessage("Hip hip hurray! You mastered your first kirana shopping errand!");
              }}
              className="g-btn w-full text-base py-3"
            >
              See Mission Rewards →
            </button>
          </div>
        )}

        {/* ================= STEP 6: COMPLETE (REWARDS) ================= */}
        {step === "complete" && (
          <div className="flex flex-col items-center justify-center my-auto space-y-5 text-center max-w-lg mx-auto py-6">
            <Gullu state="celebrate" size={140} label="Gullu celebrating your victory" />

            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Mission Complete!
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-black">Gullu Goes Shopping Cleared!</h2>
            </div>

            {/* Rewards Card */}
            <div className="w-full rounded-2xl border-2 border-[#171717] dark:border-[#334155] bg-[#FFFDF7] dark:bg-[#1E293B] p-4 text-left shadow-[4px_4px_0_#171717] dark:shadow-[4px_4px_0_#000000] space-y-3">
              <div className="flex items-center justify-between border-b border-[#171717]/10 dark:border-[#334155] pb-2">
                <span className="text-xs font-extrabold uppercase text-[#171717]/70 dark:text-[#94A3B8]">
                  Learning XP Earned
                </span>
                <span className="font-display text-lg font-black text-emerald-700 dark:text-emerald-400">
                  +35 XP ⚡
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-[#171717]/10 dark:border-[#334155] pb-2">
                <span className="text-xs font-extrabold uppercase text-[#171717]/70 dark:text-[#94A3B8]">
                  Habit Score Boost
                </span>
                <span className="font-display text-lg font-black text-[#FF6847] dark:text-[#FF8A65]">+5 Score 🔥</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-[#171717]/70 dark:text-[#94A3B8]">
                  Coins saved into Gullak
                </span>
                <span className="font-display text-lg font-black text-[#171717] dark:text-[#F8FAFC]">
                  🪙 {formatInr(remainingPaise)}
                </span>
              </div>
            </div>

            {/* Take-Home Mission Callout */}
            <div className="w-full rounded-2xl border-2 border-[#171717] dark:border-[#334155] bg-[#DFFF3F]/40 dark:bg-[#DFFF3F]/15 p-3.5 text-left shadow-[2px_2px_0_#171717] dark:shadow-[2px_2px_0_#000000] space-y-1">
              <p className="font-display text-xs font-black uppercase text-[#171717] dark:text-[#DFFF3F]">
                🏡 Take-Home Mission
              </p>
              <p className="text-xs text-[#171717] dark:text-[#F8FAFC] leading-snug">
                Ask someone at home today:{" "}
                <em>&quot;What was one Need and one Want from this week&apos;s grocery shopping?&quot;</em>
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onCompleteMission(35);
                onClose();
              }}
              className="g-btn w-full text-base py-3.5"
            >
              Collect Rewards &amp; Back to World Map →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
