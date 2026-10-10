import { readFileSync } from "node:fs";
import { z } from "zod";

// Synthetic LOCAL fixture data only. The test runner supplies fake Auth identities.
// Never execute this output in hosted Supabase. No fabricated market history is created.
export function demoSeedSql() {
  const capital = z
    .object({
      defaultInr: z.number().int().positive(),
      rows: z.array(
        z.object({
          gradeGroup: z.string(),
          experience: z.string(),
          inr: z.number().int().positive(),
        }),
      ),
    })
    .parse(
      JSON.parse(readFileSync(new URL("../packages/content/config/starting-capital.json", import.meta.url), "utf8")),
    );
  const graph = z
    .object({
      topics: z.array(z.object({ topicId: z.string().regex(/^[a-z0-9-]+$/), gradeGroups: z.array(z.string()) })),
    })
    .parse(JSON.parse(readFileSync(new URL("../packages/content/config/topic-graph.json", import.meta.url), "utf8")));
  const profiles = [
    { id: "a1111111-1111-4111-8111-111111111111", gradeGroup: "grade-8-10" },
    { id: "b2222222-2222-4222-8222-222222222222", gradeGroup: "grade-11-12" },
  ];
  return profiles
    .map((p) => {
      const cash =
        (capital.rows.find((r) => r.gradeGroup === p.gradeGroup && r.experience === "none")?.inr ??
          capital.defaultInr) * 100;
      const profile = JSON.stringify({
        ...p,
        displayName: "Synthetic demo learner",
        experience: "none",
        locale: "en",
        preferredFormats: ["transcript"],
        createdAt: "2026-10-11T00:00:00Z",
      });
      const topics = graph.topics.filter((t) => t.gradeGroups.includes(p.gradeGroup));
      return `insert into auth.users values ('${p.id}') on conflict do nothing;
      select public.onboard_learner('${p.id}', '${profile}', ${cash});
      -- Pre-completed synthetic progress for backend contract demos, not evidence from real learners.
      ${topics
        .map(
          (
            t,
          ) => `insert into public.topic_progress(learner_id,topic_id,status,best_score,quiz_attempts,completed_at,updated_at)
        values('${p.id}','${t.topicId}','completed',1,1,'2026-10-11T00:00:00Z','2026-10-11T00:00:00Z') on conflict do nothing;`,
        )
        .join("\n")}`;
    })
    .join("\n");
}
