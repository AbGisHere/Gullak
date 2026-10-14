"use client";

import { type GradeGroup, LearnerProfile } from "@gullak/types";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ONBOARDING_STORAGE_KEY } from "@/components/onboarding";
import { ProfileTab } from "@/components/tabs/profile-tab";
import { clearLearnerData, readProfile } from "@/lib/learner-state";

// The same learner profile as Home's "Me" tab, so both bottom bars open one screen.
export default function MePage() {
  const t = useTranslations("learner");
  const tSafety = useTranslations("safety");
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  useEffect(() => setProfile(readProfile()), []);

  function save(next: LearnerProfile) {
    const parsed = LearnerProfile.safeParse(next);
    if (!parsed.success) return;
    setProfile(parsed.data);
    try {
      window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(parsed.data));
    } catch {
      // Storage can be blocked; the change still applies for this visit.
    }
  }

  if (!profile) return null;
  const name = profile.displayName;
  return (
    <>
      <ProfileTab
        gradeGroup={profile.gradeGroup}
        displayName={name}
        onUpdateGrade={(grade: GradeGroup) => save({ ...profile, gradeGroup: grade })}
        onUpdateDisplayName={(next) => {
          const trimmed = next.trim();
          save({ ...profile, ...(trimmed ? { displayName: trimmed } : { displayName: undefined }) });
        }}
        onResetOnboarding={() => setConfirmingReset(true)}
      />
      <div className="mx-auto flex max-w-xl flex-col items-start gap-2 px-3 pb-4 sm:px-6">
        <p className="text-sm text-muted-foreground">{t("localProgressNote")}</p>
      </div>
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
    </>
  );
}
