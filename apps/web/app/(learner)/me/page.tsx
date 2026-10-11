"use client";

import type { GradeGroup } from "@gullak/types";
import { Button } from "@gullak/ui/components/button";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { clearLearnerData, readProfile } from "@/lib/learner-state";

export default function MePage() {
  const t = useTranslations("learner");
  const tOnboarding = useTranslations("onboarding");
  const tSafety = useTranslations("safety");
  const [grade, setGrade] = useState("");
  const [name, setName] = useState<string | undefined>();
  const [confirmingReset, setConfirmingReset] = useState(false);
  useEffect(() => {
    const profile = readProfile();
    if (!profile) return setGrade("");
    setName(profile.displayName);
    const labels: Record<GradeGroup, string> = {
      "grade-6-7": tOnboarding("grade.grade-6-7"),
      "grade-8-10": tOnboarding("grade.grade-8-10"),
      "grade-11-12": tOnboarding("grade.grade-11-12"),
    };
    setGrade(labels[profile.gradeGroup]);
  }, [tOnboarding]);
  return (
    <section className="max-w-2xl space-y-4">
      <h1 className="text-4xl font-extrabold tracking-tight">{t("meTitle")}</h1>
      <p className="text-muted-foreground">{t("gradeProfile", { grade })}</p>
      <p className="rounded-xl bg-muted p-4 text-sm">{t("localProgressNote")}</p>
      <Button variant="outline" onClick={() => setConfirmingReset(true)}>
        {t("resetProfile")}
      </Button>
      {confirmingReset ? (
        <ConfirmDialog
          title={name ? tSafety("switchLearner.titleNamed", { name }) : tSafety("switchLearner.title")}
          description={tSafety("switchLearner.description")}
          consequences={[tSafety("switchLearner.lossProfile"), tSafety("switchLearner.lossProgress")]}
          confirmLabel={tSafety("switchLearner.confirm")}
          cancelLabel={tSafety("switchLearner.cancel")}
          onConfirm={() => {
            clearLearnerData();
            window.location.assign("/");
          }}
          onCancel={() => setConfirmingReset(false)}
        />
      ) : null}
    </section>
  );
}
