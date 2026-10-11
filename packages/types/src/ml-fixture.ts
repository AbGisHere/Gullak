import { z } from "zod";
import { BktParameters } from "./bkt";
import { Experience, GradeGroup, Slug } from "./common";
import { QuizAnswerEvent } from "./quiz-answer";
import { NextRecommendation, RecommendationRequest } from "./recommendation";
import { UnlockRule } from "./unlock";

// Onboarding supplies pInit, never a synthetic fitted artifact.
const TransitionParameters = z
  .object({
    pLearn: BktParameters.shape.pLearn,
    pForget: BktParameters.shape.pForget,
    pSlip: BktParameters.shape.pSlip,
    pGuess: BktParameters.shape.pGuess,
  })
  .strict()
  .refine((value) => value.pGuess < 1 - value.pSlip, "emissions must be distinguishable");
const Matrix = z.record(Slug, z.record(Slug, z.number().finite().min(0).max(1)));
const FixtureTopic = RecommendationRequest.shape.topics.element.extend({
  requiresTopicIds: UnlockRule.shape.requiresTopicIds.unwrap(),
  passMark: UnlockRule.shape.passMark.unwrap(),
  unlocksInstruments: UnlockRule.shape.unlocksInstruments.unwrap(),
  unlocksActivityIds: UnlockRule.shape.unlocksActivityIds.unwrap(),
});

/** Experimental fixture registry, NOT the immutable production content registry. */
const FixtureDefinition = z
  .object({
    topicId: Slug,
    contentVersion: QuizAnswerEvent.shape.content_version,
    questions: z
      .array(
        z
          .object({
            questionId: Slug,
            conceptId: Slug,
            position: z.number().int().nonnegative().safe(),
          })
          .strict(),
      )
      .min(1)
      .max(100),
  })
  .strict();

/** Explicit synthetic-only envelope. No real rows, API activation or fitted initial prior. */
export const MlFixtureInput = z
  .object({
    schemaVersion: z.literal(1),
    mode: z.literal("synthetic-fixture"),
    learnerId: z.uuid(),
    gradeGroup: GradeGroup,
    experience: Experience,
    modelVersion: Slug,
    topics: z.array(FixtureTopic).max(200),
    progress: RecommendationRequest.shape.progress,
    parameters: z.record(Slug, z.record(Slug, TransitionParameters)),
    registry: z.array(FixtureDefinition).max(1000),
    events: z.array(QuizAnswerEvent).max(10000),
  })
  .strict();
export type MlFixtureInput = z.infer<typeof MlFixtureInput>;

/** Transport result deliberately omits learner IDs and individual answer rows. */
export const MlFixtureResult = z
  .object({
    schemaVersion: z.literal(1),
    mode: z.literal("synthetic-fixture"),
    activation: z.literal("disabled"),
    modelVersion: Slug,
    gradeGroup: GradeGroup,
    mastery: Matrix,
    evidenceCounts: z.record(Slug, z.record(Slug, z.number().int().nonnegative().safe().max(10000))),
    next: NextRecommendation,
  })
  .strict();
export type MlFixtureResult = z.infer<typeof MlFixtureResult>;
