import { LearnerShell } from "@/components/learner-shell";

export default function LearnerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <LearnerShell>{children}</LearnerShell>;
}
