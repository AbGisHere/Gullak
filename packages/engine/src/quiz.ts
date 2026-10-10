import type { QuizSubmission, VariantOf } from "@gullak/types";

/** Grades only against a trusted content-file answer key. */
export function gradeQuiz(quiz: VariantOf<"quiz">, submission: QuizSubmission): number {
  const answers = gradeQuizAnswers(quiz, submission);
  return answers.filter((answer) => answer.correct).length / answers.length;
}

/** Individual evidence derived from the same trusted answer key as the score. */
export function gradeQuizAnswers(quiz: VariantOf<"quiz">, submission: QuizSubmission) {
  if (submission.variantId !== quiz.id || submission.answers.length !== quiz.questions.length) {
    throw new RangeError("answer every question exactly once");
  }
  const answers = new Map(submission.answers.map((a) => [a.questionId, a.optionId]));
  if (answers.size !== quiz.questions.length) throw new RangeError("duplicate question");
  const graded = [];
  for (const question of quiz.questions) {
    const answer = answers.get(question.id);
    if (!question.options.some((o) => o.id === answer)) throw new RangeError("unknown question or option");
    graded.push({
      questionId: question.id,
      conceptId: question.conceptId,
      correct: answer === question.correctOptionId,
    });
  }
  return graded;
}
