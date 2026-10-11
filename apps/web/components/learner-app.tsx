"use client";

import { startingCapital } from "@gullak/content";
import { startingCash } from "@gullak/engine";
import { type GradeGroup, LearnerProfile } from "@gullak/types";
import { useEffect, useState } from "react";
import { clearLearnerState, recordActivity } from "@/lib/learner-state";
import { useLearnerProgress } from "@/lib/use-progress-summary";
import { ActivityModal, type ActivityType } from "./activity-modal";
import { AppShell, type NavTab } from "./app-shell";
import { ShoppingMission } from "./game/shopping/shopping-mission";
import { WorldMap } from "./game/world-map";
import { CURRICULUM_WORLDS } from "./game/worlds";
import { Onboarding } from "./onboarding";
import { SettingsDialog } from "./settings-dialog";
import { FinancialTwinTab } from "./tabs/financial-twin-tab";
import { GulluTab } from "./tabs/gullu-tab";
import { LearnTab } from "./tabs/learn-tab";
import { ProfileTab } from "./tabs/profile-tab";
import { RewardsTab } from "./tabs/rewards-tab";

const ONBOARDING_STORAGE_KEY = "gullak-onboarding-profile";

export function LearnerApp() {
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<NavTab>("world");
  const [activeActivity, setActiveActivity] = useState<ActivityType | null>(null);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [isShoppingMissionOpen, setIsShoppingMissionOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // Every tab reads this one derived summary; until onboarding finishes it describes no evidence.
  const progress = useLearnerProgress(profile?.gradeGroup ?? "grade-6-7");

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
    setProfile(newProfile);
    try {
      window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(newProfile));
    } catch {
      // Ignore
    }
  }

  function handleResetOnboarding() {
    try {
      window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    } catch {
      // Ignore
    }
    // A shared phone's next learner must not inherit this learner's progress.
    clearLearnerState();
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

  const completedWorlds = CURRICULUM_WORLDS.filter((world) => progress.completedWorlds.includes(world.slug)).map(
    (world) => world.id,
  );

  const virtualCash = startingCash(startingCapital, profile.gradeGroup, profile.experience);

  return (
    <>
      <AppShell
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        gradeGroup={profile.gradeGroup}
        streakDays={progress.streakDays}
        xp={progress.xp}
        level={progress.level}
        onOpenSettings={() => setCurrentTab("profile")}
        onResetOnboarding={handleResetOnboarding}
      >
        {(currentTab === "world" || currentTab === "home") && (
          <WorldMap
            onLaunchWorldMission={(w) => {
              if (w.slug === "candy-economy") {
                setIsShoppingMissionOpen(true);
              }
            }}
            onLaunchTwin={() => setCurrentTab("twin")}
            learnerGradeGroup={profile.gradeGroup}
            completedWorlds={completedWorlds}
            learnerXp={progress.xp}
          />
        )}

        {currentTab === "twin" && <FinancialTwinTab />}

        {currentTab === "learn" && (
          <LearnTab
            gradeGroup={profile.gradeGroup}
            onLaunchLesson={(topicId) => {
              setActiveTopicId(topicId);
              setActiveActivity(topicId === "candy-coin-shop" ? "coin-shop" : "lesson");
            }}
            onLaunchSpotAndSort={() => {
              setActiveTopicId("needs-vs-wants");
              setActiveActivity("spot-and-sort");
            }}
          />
        )}

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
    </>
  );
}
