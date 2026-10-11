import { CurriculumBrief, Locale, Slug, TopicContent, TopicMeta, UnlockRule } from "@gullak/types";
import { z } from "zod";
import { buildLessonDraftCacheKey } from "./lesson-cache-key";
import { buildLessonGenerationRequest } from "./lesson-generation";

// v0.2.12 / fddbdeb: the five approved English Grade 8–10 briefs only.
// Brief/context fingerprints use recursively sorted object keys; array order matters.
// Source fingerprints are SHA-256 of exact committed en.json bytes, not parsed JSON.
const CATALOG = {
  "money-basics": {
    brief: "8dc795e5c7e64a62fedbbfc1342e401251397d6e96665ce6065b21e4216aa015",
    context: "086371c75225de98968e3c2e33a4e50ac9c8f519ec9582bfe7b28b21c469c2c4",
    source: "5ddcb2e9de08c1e20e08117628c8802c45f12b40a326c2e7922f55286900c8d2",
  },
  "needs-vs-wants": {
    brief: "e206a38542e7ed836c85ba71f1cbfccf895f29c6808eaebf2069b6b8aaab861a",
    context: "699de4ae0117563d42d204d34cbf7636b705c061181078ac2cab7f66c758bea9",
    source: "2278d69571d05b554df08822081bab8ce6029ded80340e1aaa2b42e3c552ca64",
  },
  "emergency-fund": {
    brief: "0a857ef676cbc8a359b44257990fd12db3a512b38bdc9c20fe70c95939b176fd",
    context: "b32bf0d961d533f2b2c48c8b81f9aa0f0bdcf4659b872ec3510f62dc685e11a0",
    source: "6caca82c5965456e0b78e6273fb46e1c8b92b101d732baee7cc527f0466e3fc8",
  },
  compounding: {
    brief: "df744ed3b3a79522bf285818a50b976ba40830a5564dec343fefd59013c88b82",
    context: "f5116ef0ac06c4a8a2f11257a1700d4ff4863ebadfade44c4fd68ce4f6f54d69",
    source: "31f7ad8216a8fad958c7130671c6d2b889307de7e355f6940dedd4877356ec7c",
  },
  "upi-and-phishing-scams": {
    brief: "2e5cc87c44cad38c44c0491fed690f832f832c6e46eee4f34230c0d96a521367",
    context: "d2b1f3d0ca0637673fb5191f34b4d3456bcdd8401c6cec839773044ad66e82d8",
    source: "9773dcdd8250399373bb8f099e2baaea2fec18564b55706796a749731432b56c",
  },
} as const;

const ApprovedTopic = z.enum([
  "money-basics",
  "needs-vs-wants",
  "emergency-fund",
  "compounding",
  "upi-and-phishing-scams",
]);
const Format = z.enum(["transcript", "story", "audio", "quiz"]);
const Id = Slug.max(80);
const IdentityText = z
  .string()
  .min(1)
  .max(200)
  .refine((value) => value.trim().length > 0, "must not be blank");
const Context = z
  .object({
    meta: TopicMeta.extend({
      id: Id,
      concepts: z
        .array(TopicMeta.shape.concepts.element.extend({ id: Id, label: z.string().min(1).max(80) }).strict())
        .min(1)
        .max(12),
    }).strict(),
    rule: UnlockRule.extend({
      topicId: Id,
      gradeGroups: UnlockRule.shape.gradeGroups.max(3),
      requiresTopicIds: z.array(Id).max(12),
      unlocksInstruments: UnlockRule.shape.unlocksInstruments.unwrap().max(12),
      unlocksActivityIds: z.array(Id).max(12),
    }).strict(),
    supportedLocales: z.array(Locale.max(80)).min(1).max(12),
  })
  .strict();
const Job = z
  .object({
    id: Id,
    brief: CurriculumBrief.extend({
      topicId: ApprovedTopic,
      gradeGroup: z.literal("grade-8-10"),
      locale: z.literal("en"),
    }),
    context: Context,
    formats: z.array(Format).min(1).max(4),
    model: z.object({ provider: IdentityText, modelId: IdentityText }).strict(),
    source: z
      .object({
        bytes: z
          .custom<Uint8Array>((value) => value instanceof Uint8Array, "must be Uint8Array bytes")
          .refine((bytes) => bytes.byteLength > 0 && bytes.byteLength <= 524288, "source must contain 1–524288 bytes")
          // Always copy, including Buffer/subarray inputs; their slice() can alias caller memory.
          .transform((bytes) => new Uint8Array(bytes)),
        sha256: z.string().regex(/^[a-f0-9]{64}$/, "must be lowercase SHA-256 hex"),
      })
      .strict(),
  })
  .strict();
const Input = z.object({ jobs: z.array(Job).min(1).max(5) }).strict();

function reject(path: (string | number)[], message: string): never {
  throw new z.ZodError([{ code: "custom", path, message }]);
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
        .map(([key, entry]) => [key, canonical(entry)]),
    );
  }
  return value;
}

async function hash(bytes: Uint8Array<ArrayBuffer>): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Bounded offline preparation only. No generator/provider argument, I/O, cache or publication. */
export async function prepareLessonBatch(input: unknown) {
  // Zod detaches all nested objects, and the bytes transform detaches byte views,
  // synchronously before the first asynchronous hashing boundary.
  const snapshot = Input.parse(input);
  const ids = new Set<string>();
  const identities = new Set<string>();
  const prepared = snapshot.jobs.map((job, index) => {
    if (ids.has(job.id)) reject(["jobs", index, "id"], "job ids must be unique");
    ids.add(job.id);
    let content: z.infer<typeof TopicContent>;
    try {
      content = TopicContent.parse(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(job.source.bytes)));
    } catch {
      reject(["jobs", index, "source", "bytes"], "source must be valid UTF-8 TopicContent JSON");
    }
    if (content.topicId !== job.brief.topicId || content.locale !== job.brief.locale) {
      reject(["jobs", index, "source"], "source identity must match the brief");
    }
    const requests = job.formats.map((format) => {
      const request = buildLessonGenerationRequest({ brief: job.brief, context: job.context, format });
      const identity = JSON.stringify([request.topicId, request.gradeGroup, request.locale, request.format]);
      if (identities.has(identity))
        reject(["jobs", index, "formats"], "topic-grade-locale-format identities must be unique");
      identities.add(identity);
      return request;
    });
    return { job, index, requests };
  });

  // Validate every job against fixed approval pins before constructing the manifest.
  for (const { job, index } of prepared) {
    const pins = CATALOG[job.brief.topicId];
    const sourceHash = await hash(job.source.bytes);
    if (sourceHash !== job.source.sha256 || sourceHash !== pins.source) {
      reject(["jobs", index, "source", "sha256"], "source bytes must match the supplied hash and approved catalog pin");
    }
    if ((await hash(new TextEncoder().encode(JSON.stringify(canonical(job.brief))))) !== pins.brief) {
      reject(["jobs", index, "brief"], "brief must match the approved catalog pin");
    }
    if ((await hash(new TextEncoder().encode(JSON.stringify(canonical(job.context))))) !== pins.context) {
      reject(["jobs", index, "context"], "context must match the approved catalog pin");
    }
  }

  const jobs = [];
  for (const { job, requests } of prepared) {
    for (const request of requests) {
      const contentVersion = job.source.sha256;
      const key = await buildLessonDraftCacheKey({ request, model: job.model, contentVersion });
      jobs.push({ id: job.id, contentVersion, model: { ...job.model }, request, key });
    }
  }
  return {
    schemaVersion: 1 as const,
    keyVersion: 1 as const,
    catalogVersion: 1 as const,
    status: "prepared-only" as const,
    jobs,
  };
}
export type PreparedLessonBatch = Awaited<ReturnType<typeof prepareLessonBatch>>;
