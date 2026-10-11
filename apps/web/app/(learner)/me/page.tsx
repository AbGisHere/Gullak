"use client";

import type { GradeGroup } from "@gullak/types";
import { Button } from "@gullak/ui/components/button";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { readProfile } from "@/lib/learner-state";

export default function MePage() {
  const t = useTranslations("learner");
  const tOnboarding = useTranslations("onboarding");
  const [grade, setGrade] = useState("");
  useEffect(() => {
    const profile = readProfile();
    if (!profile) return setGrade("");
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
      <Button
        variant="outline"
        onClick={() => {
          try {
            localStorage.removeItem("gullak-onboarding-profile");
            localStorage.removeItem("gullak-learner-state");
          } finally {
            window.location.assign("/");
          }
        }}
      >
        {t("resetProfile")}
      </Button>
    </section>
  );
}
