"use client";

import { PortfolioPlayground } from "../portfolio/portfolio-playground";

interface PortfolioTabProps {
  gradeGroup?: string;
}

export function PortfolioTab({ gradeGroup }: PortfolioTabProps) {
  return <PortfolioPlayground gradeGroup={gradeGroup} />;
}
