"use client";

import { startingCapital } from "@gullak/content";
import { startingCash } from "@gullak/engine";
import { type GradeGroup, LearnerProfile } from "@gullak/types";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { clearLearnerData, readLearnerState, recordActivity, saveLearnerState } from "@/lib/learner-state";
import { initialiseRecommendationEvidence } from "@/lib/learning-recommendation";
import { useLearnerProgress } from "@/lib/use-progress-summary";
import { ActivityModal, type ActivityType } from "./activity-modal";
import { AppShell, type NavTab } from "./app-shell";
import { ConfirmDialog } from "./confirm-dialog";
import { ShoppingMission } from "./game/shopping/shopping-mission";
import type { TopicSummary } from "./learn-map";
import { LearnMap } from "./learn-map";
import { Onboarding } from "./onboarding";
import { SettingsDialog } from "./settings-dialog";
import { FinancialTwinTab } from "./tabs/financial-twin-tab";
import { GulluTab } from "./tabs/gullu-tab";
import { HomeTab } from "./tabs/home-tab";
import { ProfileTab } from "./tabs/profile-tab";
import { RewardsTab } from "./tabs/rewards-tab";

const ONBOARDING_STORAGE_KEY = "gullak-onboarding-profile";

export function LearnerApp({ topics }: { topics: TopicSummary[] }) {
  const router = useRouter();
  const tSafety = useTranslations("safety");
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<NavTab>("home");
  const [activeActivity, setActiveActivity] = useState<ActivityType | null>(null);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [isShoppingMissionOpen, setIsShoppingMissionOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // Every tab reads this one derived summary; until onboarding finishes it describes no evidence.
  const progress = useLearnerProgress(profile?.gradeGroup ?? "grade-6-7");
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (stored) {
        const parsed = LearnerProfile.safeParse(JSON.parse(stored));
        if (parsed.success) {
          setProfile(parsed.data);
        }
      }
    } catch {
      // Ignore storage errors on restricted environments
    } finally {
      setIsLoading(false);
    }
  }, []);

  function handleOnboardFinish(newProfile: LearnerProfile) {
    saveLearnerState(initialiseRecommendationEvidence(topics, newProfile, readLearnerState()));
    setProfile(newProfile);
    try {
      window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(newProfile));
    } catch {
      // Ignore
    }
  }

  // Every "switch learner / reset" entry point asks first: on a shared family phone,
  // one stray tap would otherwise wipe someone else's profile and progress for good.
  function handleResetOnboarding() {
    setIsResetConfirmOpen(true);
  }

  function confirmResetOnboarding() {
    clearLearnerData();
    setIsResetConfirmOpen(false);
    setProfile(null);
    setCurrentTab("home");
  }

  function handleUpdateGrade(grade: GradeGroup) {
    if (!profile) return;
    const updated: LearnerProfile = { ...profile, gradeGroup: grade };
    setProfile(updated);
    try {
      window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  }

  function handleUpdateDisplayName(name: string) {
    if (!profile) return;
    const trimmed = name.trim();
    const updated: LearnerProfile = {
      ...profile,
      ...(trimmed ? { displayName: trimmed } : { displayName: undefined }),
    };
    setProfile(updated);
    try {
      window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  }

  // Tabs share one scroll container, so start each new tab at the top instead of mid-page.
  function selectTab(tab: NavTab) {
    setCurrentTab(tab);
    window.scrollTo({ top: 0 });
  }

  function handleActivitySuccess() {
    if (activeActivity) recordActivity(`${activeActivity}:${activeTopicId ?? "default"}`);
  }

  if (isLoading) {
    return (
      <div className="grid min-h-svh place-items-center bg-brand-paper text-brand-ink">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-brand-ink border-t-transparent" />
          <p className="text-sm font-bold">Loading Gullak...</p>
        </div>
      </div>
    );
  }

  // If no profile, show onboarding
  if (!profile) {
    return <Onboarding onFinish={handleOnboardFinish} />;
  }

  function handleMissionComplete(xpEarned: number) {
    recordActivity("mission:candy-economy-shopping", xpEarned);
  }

  const virtualCash = startingCash(startingCapital, profile.gradeGroup, profile.experience);

  return (
    <>
      <AppShell
        onSelectTab={selectTab}
        gradeGroup={profile.gradeGroup}
        daysPractised={progress.activeDays}
        xp={progress.xp}
        level={progress.level}
        onOpenSettings={() => router.push("/me")}
        onResetOnboarding={handleResetOnboarding}
      >
        {currentTab === "home" && (
          <HomeTab
            profile={profile}
            topics={topics}
            daysPractised={progress.activeDays}
            onNavigateToTab={(tab) => (tab === "learn" ? router.push("/learn") : selectTab(tab))}
            onLaunchActivity={setActiveActivity}
            onLaunchShopping={() => setIsShoppingMissionOpen(true)}
          />
        )}
        {currentTab === "world" && (
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
            <LearnMap topics={topics} profile={profile} />
          </div>
        )}

        {currentTab === "twin" && <FinancialTwinTab />}

        {(currentTab === "gullu" || currentTab === "portfolio") && (
          <GulluTab gradeGroup={profile.gradeGroup} virtualCashPaise={virtualCash} progress={progress} />
        )}

        {(currentTab === "rewards" || currentTab === "missions") && (
          <RewardsTab gradeGroup={profile.gradeGroup} progress={progress} />
        )}

        {currentTab === "profile" && (
          <ProfileTab
            gradeGroup={profile.gradeGroup}
            displayName={profile.displayName}
            onUpdateGrade={handleUpdateGrade}
            onUpdateDisplayName={handleUpdateDisplayName}
            onResetOnboarding={handleResetOnboarding}
          />
        )}
      </AppShell>

      {/* Playable 'Gullu Goes Shopping' Vertical Slice Mission */}
      {isShoppingMissionOpen && (
        <ShoppingMission onClose={() => setIsShoppingMissionOpen(false)} onCompleteMission={handleMissionComplete} />
      )}

      {/* Activity Runner Modal */}
      {activeActivity && (
        <ActivityModal
          activityType={activeActivity}
          topicId={activeTopicId}
          gradeGroup={profile.gradeGroup}
          onClose={() => {
            setActiveActivity(null);
            setActiveTopicId(null);
          }}
          onActivitySuccess={handleActivitySuccess}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsDialog
          currentGrade={profile.gradeGroup}
          onUpdateGrade={handleUpdateGrade}
          onResetOnboarding={handleResetOnboarding}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isResetConfirmOpen && (
        <ConfirmDialog
          title={
            profile.displayName
              ? tSafety("switchLearner.titleNamed", { name: profile.displayName })
              : tSafety("switchLearner.title")
          }
          description={tSafety("switchLearner.description")}
          consequences={[tSafety("switchLearner.lossProfile"), tSafety("switchLearner.lossProgress")]}
          confirmLabel={tSafety("switchLearner.confirm")}
          cancelLabel={tSafety("switchLearner.cancel")}
          onConfirm={confirmResetOnboarding}
          onCancel={() => setIsResetConfirmOpen(false)}
        />
      )}
    </>
  );
}
