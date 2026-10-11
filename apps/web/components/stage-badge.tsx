import type { GradeGroup } from "@gullak/types";
import { cn } from "@gullak/ui/lib/utils";
import { useTranslations } from "next-intl";

/** One colour per class group, so the three learning paths are told apart at a glance. */
export const STAGE_TONE: Record<GradeGroup, string> = {
  "grade-6-7": "bg-brand-lime",
  "grade-8-10": "bg-brand-yellow",
  "grade-11-12": "bg-brand-lilac",
};

/** The learner's stage: Explorer (Class 6–7), Navigator (Class 8–10) or Strategist (Class 11–12). */
export function StageBadge({ gradeGroup, className }: { gradeGroup: GradeGroup; className?: string }) {
  const t = useTranslations("stage");
  const tGrade = useTranslations("onboarding.grade");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold text-foreground",
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-2.5 rounded-full", STAGE_TONE[gradeGroup])} />
      {t("badge", { stage: t(`name.${gradeGroup}`), grade: tGrade(gradeGroup) })}
    </span>
  );
}
