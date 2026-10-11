import { GradeGroup, Locale, Slug } from "@gullak/types";
import { z } from "zod";

const Nonblank = z
  .string()
  .min(1)
  .refine((value) => value.trim().length > 0, "must not be blank");
const Input = z
  .object({
    contentVersion: z.string().regex(/^[a-f0-9]{64}$/, "must be lowercase SHA-256 hex"),
    model: z.object({ provider: Nonblank, modelId: Nonblank }).strict(),
    request: z
      .object({
        promptId: Slug,
        promptVersion: z.number().int().positive().safe(),
        topicId: Slug,
        gradeGroup: GradeGroup,
        locale: Locale,
        format: z.enum(["transcript", "story", "audio", "quiz"]),
        system: Nonblank,
        prompt: Nonblank,
      })
      .strict(),
  })
  .strict();

/** Key preparation only: no provider calls or cache reads/writes. Exact prompt bytes are significant. */
export async function buildLessonDraftCacheKey(input: unknown): Promise<string> {
  const { contentVersion, model, request } = Input.parse(input);
  // Fixed field order, domain separation and an explicit key-algorithm version.
  // Source bytes are represented by the caller's immutable content hash; the
  // complete prompt also includes the normalized brief and generation requirements.
  const payload = JSON.stringify([
    "lesson-draft-cache",
    1,
    contentVersion,
    model.provider,
    model.modelId,
    request.promptId,
    request.promptVersion,
    request.topicId,
    request.gradeGroup,
    request.locale,
    request.format,
    request.system,
    request.prompt,
  ]);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `lesson-draft:v1:${hex}`;
}
