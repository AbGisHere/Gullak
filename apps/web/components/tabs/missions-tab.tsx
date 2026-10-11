"use client";

import { QuestBoard } from "../missions/quest-board";

interface MissionsTabProps {
  gradeGroup?: string;
}

export function MissionsTab(_props: MissionsTabProps) {
  return <QuestBoard />;
}
