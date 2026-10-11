"use client";

import { PortfolioPlayground } from "../portfolio/portfolio-playground";

interface PortfolioTabProps {
  gradeGroup?: string;
  /** The learner's configured starting virtual cash (same value onboarding shows). */
  startingPaise?: number;
}

export function PortfolioTab({ gradeGroup, startingPaise }: PortfolioTabProps) {
  return <PortfolioPlayground gradeGroup={gradeGroup} startingPaise={startingPaise} />;
}
