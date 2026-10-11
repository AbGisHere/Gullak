# Quiz evidence API integration

The quiz route keeps its existing request and response shapes. It loads the learner's locale using the verified session, grades against validated server content, and supplies per-answer evidence to the eight-argument `record_quiz` overload. The seven-argument database caller remains supported. Neither public requests nor Postman should send identity, correctness, concepts, scores, content versions or attempt numbers.

`content_version` is lowercase SHA-256 hex of the exact UTF-8 content file loaded for grading, matching R4's import contract. Answer order and concepts come from authored questions. The database assigns distinct answer event UUIDs and the incremented attempt number, and commits evidence with the aggregate quiz result. Retries use the existing learner/topic/idempotency command. Old aggregate attempts are not backfilled.

## Local verification

```powershell
pnpm.cmd verify
node scripts/test-database.mjs "C:\Program Files\PostgreSQL\18\bin"
node scripts/test-database.mjs "C:\Program Files\PostgreSQL\18\bin" --generate-types
pnpm.cmd exec biome check --write apps/web/lib/data/database.types.ts
```

Database tests create and remove an isolated temporary cluster. They do not use `.env.local`, the installed application database or hosted Supabase. Generated types describe these local migrations; they do not prove hosted schema compatibility.

## Hosted/Postman acceptance after migration review

R1 must review and approve `20261011100000_quiz_answers.sql` against the shared schema before applying it. Do not run the local test runner against hosted Supabase. No hosted application is performed by this change.

1. Sign in as learner A and onboard. Fetch the English lesson and submit only real authored question/option IDs, following `money-basics → saving-habit → bank-accounts-upi → fixed-deposit`.
2. `POST {{baseUrl}}/api/lessons/{{topicId}}/quiz` needs the verified session, JSON content type and a UUID `idempotency-key`. Body: `{ "variantId": "<authored-quiz-id>", "answers": [{ "questionId": "<authored-question-id>", "optionId": "<selected-option-id>" }] }`, with every question answered exactly once.
3. With A's access token and the public Supabase API key, read `{{supabaseUrl}}/rest/v1/quiz_answers?select=event_id,learner_id,topic_id,concept_id,question_id,correct,answered_at,attempt_no,content_version&topic_id=eq.{{topicId}}`. Expect one row per question, one attempt number shared by the submission and a distinct event UUID per answer.
4. Repeat the same body and idempotency key: identical aggregate result, no new answers or incremented attempt. A fresh key creates a new attempt. The old key with changed answers returns 409.
5. Use learner B's token to filter evidence by A's UUID: expect an empty array. Direct learner evidence writes and reads of `quiz_answers_export` must be denied. Never put the service-role key in a public Postman environment.
6. Invalid question/option IDs, duplicates, omitted answers and extra outcome/identity fields must fail. Confirm the normal FD unlock and virtual portfolio flow still work after the prerequisite quizzes.

Hosted acceptance and phone/desktop browser checks remain pending. Existing grade-group onboarding is preserved; the future class/stage curriculum migration is outside this change.
