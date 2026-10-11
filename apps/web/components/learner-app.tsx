"use client";

import { startingCapital } from "@gullak/content";
import { startingCash } from "@gullak/engine";
import { type GradeGroup, LearnerProfile } from "@gullak/types";
import { useEffect, useState } from "react";
import { ActivityModal, type ActivityType } from "./activity-modal";
import { AppShell, type NavTab } from "./app-shell";
import { Onboarding } from "./onboarding";
import { SettingsDialog } from "./settings-dialog";
import { FinancialTwinTab } from "./tabs/financial-twin-tab";
import { HomeTab } from "./tabs/home-tab";
import { LearnTab } from "./tabs/learn-tab";
import { MissionsTab } from "./tabs/missions-tab";
import { PortfolioTab } from "./tabs/portfolio-tab";

const ONBOARDING_STORAGE_KEY = "gullak-onboarding-profile";

export function LearnerApp() {
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<NavTab>("home");
  const [activeActivity, setActiveActivity] = useState<ActivityType | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [streakDays, setStreakDays] = useState(3);
  const [habitScore, setHabitScore] = useState(88);

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

  function handleActivitySuccess() {
    setHabitScore((prev) => Math.min(100, prev + 5));
    setStreakDays((prev) => prev + 1);
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

  const virtualCash = startingCash(startingCapital, profile.gradeGroup, profile.experience);

  return (
    <>
      <AppShell
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        gradeGroup={profile.gradeGroup}
        streakDays={streakDays}
        habitScore={habitScore}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetOnboarding={handleResetOnboarding}
      >
        {currentTab === "home" && (
          <HomeTab
            gradeGroup={profile.gradeGroup}
            virtualCashPaise={virtualCash}
            streakDays={streakDays}
            habitScore={habitScore}
            onNavigateToTab={setCurrentTab}
            onLaunchActivity={setActiveActivity}
          />
        )}

        {currentTab === "twin" && <FinancialTwinTab />}

        {currentTab === "learn" && (
          <LearnTab
            gradeGroup={profile.gradeGroup}
            onLaunchLesson={(_topicId) => setActiveActivity("lesson")}
            onLaunchSpotAndSort={() => setActiveActivity("spot-and-sort")}
          />
        )}

        {currentTab === "portfolio" && <PortfolioTab gradeGroup={profile.gradeGroup} />}

        {currentTab === "missions" && <MissionsTab gradeGroup={profile.gradeGroup} />}
      </AppShell>

      {/* Activity Runner Modal */}
      {activeActivity && (
        <ActivityModal
          activityType={activeActivity}
          onClose={() => setActiveActivity(null)}
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
