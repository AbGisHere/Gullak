import type { Metadata } from "next";
import { ErrorScreen } from "@/components/error-screen";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function NotFound() {
  return <ErrorScreen kind="notFound" fullPage />;
}
