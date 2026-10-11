import { R2Showcase } from "@gullak/ui/components/r2-showcase";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "R2 preview", robots: { index: false, follow: false } };

export default function R2PreviewPage() {
  return <R2Showcase />;
}
