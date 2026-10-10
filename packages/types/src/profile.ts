import { z } from "zod";
import { Experience, GradeGroup, IsoDateTime, LearningFormat, Locale } from "./common";
import { Goal } from "./goal";

export const LearnerProfile = z.object({
  id: z.uuid(),
  displayName: z.string().min(1).max(60).optional(),
  gradeGroup: GradeGroup,
  experience: Experience,
  locale: Locale,
  /** Stated at onboarding, ordered by preference; refined later by behaviour. */
  preferredFormats: z.array(LearningFormat).min(1),
  goal: Goal.optional(),
  /** Facilitator / NGO cohort, if the learner joined through one. */
  cohortId: z.string().min(1).optional(),
  createdAt: IsoDateTime,
});
export type LearnerProfile = z.infer<typeof LearnerProfile>;
