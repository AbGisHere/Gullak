export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
  }
}
export function databaseError(error: { code: string; message: string }): never {
  const known: Record<string, number> = {
    onboarding_required: 409,
    topic_locked: 403,
    lesson_required: 409,
    instrument_locked: 403,
    insufficient_cash: 409,
    idempotency_conflict: 409,
    facilitator_forbidden: 403,
    learning_run_not_found: 404,
    revision_conflict: 409,
    content_changed: 409,
  };
  const status = known[error.message];
  if (status) throw new ApiError(status, error.message);
  console.error("Database operation failed", { code: error.code });
  throw new ApiError(503, "database_unavailable");
}
