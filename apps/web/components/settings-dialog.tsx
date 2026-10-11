"use client";

import { locales } from "@gullak/content";
import type { GradeGroup } from "@gullak/types";
import { cn } from "@gullak/ui/lib/utils";
import { RotateCcw, Settings, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useState } from "react";
import { LOCALE_COOKIE } from "@/i18n/locale";

interface SettingsDialogProps {
  currentGrade: string;
  onUpdateGrade: (grade: GradeGroup) => void;
  onResetOnboarding: () => void;
  onClose: () => void;
}

export function SettingsDialog({ currentGrade, onUpdateGrade, onResetOnboarding, onClose }: SettingsDialogProps) {
  const locale = useLocale();
  const router = useRouter();
  const [selectedGrade, setSelectedGrade] = useState<string>(currentGrade);

  function handleLanguageChange(nextLocale: string) {
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  function handleSave() {
    if (selectedGrade !== currentGrade) {
      onUpdateGrade(selectedGrade as GradeGroup);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Settings className="size-4 text-brand-coral" />
            <h2 className="text-base font-black text-brand-ink">Learner Settings</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-brand-muted hover:text-brand-ink"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Grade Group Selection */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Class / Grade Group</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "grade-6-7", label: "Class 6–7" },
              { id: "grade-8-10", label: "Class 8–10" },
              { id: "grade-11-12", label: "Class 11–12" },
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedGrade(g.id)}
                className={cn(
                  "rounded-xl border p-2.5 text-xs font-bold transition-all text-center",
                  selectedGrade === g.id
                    ? "border-brand-ink bg-brand-ink text-brand-paper shadow-xs"
                    : "border-border bg-brand-paper text-brand-ink hover:border-brand-ink/40",
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Language Selection */}
        <div className="space-y-2">
          <label
            htmlFor="settings-language-select"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >
            Language
          </label>
          <select
            id="settings-language-select"
            value={locale}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-brand-paper px-3 text-sm font-medium"
          >
            {locales.locales.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeName} ({l.name})
              </option>
            ))}
          </select>
        </div>

        {/* Reset Option */}
        <div className="pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => {
              onClose();
              onResetOnboarding();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 py-2.5 text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset Demo &amp; Replay Onboarding</span>
          </button>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-brand-ink hover:bg-brand-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-brand-ink px-5 py-2 text-xs font-bold text-brand-paper hover:bg-brand-ink/90"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
