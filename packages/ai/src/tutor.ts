import { GradeGroup, Locale, Slug, TopicContent } from "@gullak/types";
import { z } from "zod";
import { checkLearnerQuestion } from "./guardrails";
import { TUTOR_PROMPT_V3 } from "./prompts/tutor";
import approvedEnglish from "./tutor-approved-english.json";
import { collectTutorText, selectTutorExcerpt } from "./tutor-grounding";

const Sha256 = z.string().regex(/^[a-f0-9]{64}$/);
const Allowlist = z
  .object({
    schemaVersion: z.literal(1),
    purpose: z.literal("editorial-tutor-grounding-allowlist"),
    release: z.string().min(1),
    gitRef: z.string().regex(/^[a-f0-9]{40}$/),
    sources: z
      .array(
        z
          .object({
            topicId: Slug,
            locale: Locale,
            path: z.string().min(1),
            sha256: Sha256,
          })
          .strict(),
      )
      .min(1),
  })
  .strict();
// Private parsed copy: this permission data is not a learner historical registry.
const allowlist = Allowlist.parse(approvedEnglish);
const Input = z
  .object({
    topicId: Slug,
    locale: Locale,
    gradeGroup: GradeGroup,
    question: z.string().max(600).trim().min(1),
    contentVersion: Sha256,
    sourceBytes: z.instanceof(Uint8Array).refine((bytes) => bytes.byteLength > 0 && bytes.byteLength <= 262_144),
  })
  .strict();

export type TutorUnavailable = {
  status: "unavailable";
  reason:
    | "invalid-request"
    | "unsupported-locale"
    | "unapproved-content"
    | "content-version-mismatch"
    | "invalid-content"
    | "investment-advice"
    | "no-safe-grounding";
};
export type TutorCitation = {
  topicId: string;
  locale: string;
  variantId: string;
  field: string;
  contentVersion: string;
  path: string;
  release: string;
  gitRef: string;
};
export type TutorSource = { citation: TutorCitation; text: string };
export type TutorRequest = {
  promptId: "tutor";
  promptVersion: 3;
  topicId: string;
  locale: string;
  gradeGroup: GradeGroup;
  system: string;
  prompt: string;
};

type ApprovedGrounding = {
  status: "ready";
  topicId: string;
  locale: string;
  gradeGroup: GradeGroup;
  question: string;
  sources: TutorSource[];
};

async function approveGrounding(input: unknown): Promise<ApprovedGrounding | TutorUnavailable> {
  const parsed = Input.safeParse(input);
  if (!parsed.success) return { status: "unavailable", reason: "invalid-request" };
  const { topicId, locale, gradeGroup, question, contentVersion } = parsed.data;
  if (locale !== "en") return { status: "unavailable", reason: "unsupported-locale" };
  const verdict = checkLearnerQuestion(question);
  if (!verdict.allowed) return { status: "unavailable", reason: verdict.reason };
  const approval = allowlist.sources.find((source) => source.topicId === topicId && source.locale === locale);
  if (!approval || approval.sha256 !== contentVersion) return { status: "unavailable", reason: "unapproved-content" };
  // Snapshot before the first await; caller mutations cannot replace approved teaching text.
  const bytes = new Uint8Array(parsed.data.sourceBytes);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  if (hash !== contentVersion) return { status: "unavailable", reason: "content-version-mismatch" };
  let content: TopicContent;
  try {
    content = TopicContent.parse(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)));
  } catch {
    return { status: "unavailable", reason: "invalid-content" };
  }
  if (content.topicId !== topicId || content.locale !== locale)
    return { status: "unavailable", reason: "unapproved-content" };
  const sources: TutorSource[] = collectTutorText(content, gradeGroup).map(({ variantId, field, text }) => ({
    citation: {
      topicId,
      locale,
      variantId,
      field,
      contentVersion,
      path: approval.path,
      release: allowlist.release,
      gitRef: allowlist.gitRef,
    },
    text,
  }));
  if (sources.length === 0) return { status: "unavailable", reason: "no-safe-grounding" };
  return { status: "ready", topicId, locale, gradeGroup, question, sources };
}

/** Verify immutable English release bytes and prepare data only, without a model or storage. */
export async function prepareTutorRequest(
  input: unknown,
): Promise<{ status: "ready"; request: TutorRequest } | TutorUnavailable> {
  const grounding = await approveGrounding(input);
  if (grounding.status !== "ready") return grounding;
  const { topicId, locale, gradeGroup, question, sources } = grounding;
  return {
    status: "ready",
    request: {
      promptId: TUTOR_PROMPT_V3.id,
      promptVersion: TUTOR_PROMPT_V3.version,
      topicId,
      locale,
      gradeGroup,
      system: TUTOR_PROMPT_V3.system,
      prompt: JSON.stringify({ question, locale, gradeGroup, sources }),
    },
  };
}

export type TutorExcerpt = {
  status: "excerpt";
  kind: "approved-content-excerpt";
  excerpt: string;
  citation: TutorCitation;
  provenance: {
    method: "verbatim-field";
    relevance: "all-question-terms";
    matchedTerms: string[];
  };
};

/** An attributed verbatim excerpt, not a generated answer or semantic-answer assertion. */
export async function findTutorExcerpt(input: unknown): Promise<
  | TutorExcerpt
  | TutorUnavailable
  | {
      status: "unavailable";
      reason: "insufficient-relevance" | "out-of-scope" | "no-safe-excerpt";
    }
> {
  const grounding = await approveGrounding(input);
  if (grounding.status !== "ready") return grounding;
  const selected = selectTutorExcerpt(grounding.question, grounding.sources);
  if (selected.status !== "selected") return selected;
  return {
    status: "excerpt",
    kind: "approved-content-excerpt",
    excerpt: selected.source.text,
    citation: selected.source.citation,
    provenance: { method: "verbatim-field", relevance: "all-question-terms", matchedTerms: selected.matchedTerms },
  };
}
