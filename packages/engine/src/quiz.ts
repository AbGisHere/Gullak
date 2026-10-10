import type { QuizSubmission, VariantOf } from "@gullak/types";

/** Grades only against a trusted content-file answer key. */
export function gradeQuiz(quiz: VariantOf<"quiz">, submission: QuizSubmission): number {
  if (submission.variantId !== quiz.id || submission.answers.length !== quiz.questions.length) {
    throw new RangeError("answer every question exactly once");
  }
  const answers = new Map(submission.answers.map((a) => [a.questionId, a.optionId]));
  if (answers.size !== quiz.questions.length) throw new RangeError("duplicate question");
  let correct = 0;
  for (const question of quiz.questions) {
    const answer = answers.get(question.id);
    if (!question.options.some((o) => o.id === answer)) throw new RangeError("unknown question or option");
    if (answer === question.correctOptionId) correct++;
  }
  return correct / quiz.questions.length;
}
