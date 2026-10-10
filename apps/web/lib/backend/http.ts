import "server-only";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadTopic } from "@gullak/content/server";
import { IdempotencyKey, Slug } from "@gullak/types";
import { z } from "zod";
import { getDataAccess } from "../data";
import type { DataAccess } from "../data/transactions";
import { ApiError } from "./errors";
import { createBackendService } from "./service";

export async function api(action: () => Promise<unknown>): Promise<Response> {
  try {
    return Response.json({ data: await action() }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const failure =
      error instanceof ApiError
        ? error
        : error instanceof z.ZodError
          ? new ApiError(400, "invalid_request")
          : new ApiError(500, "internal_error");
    if (failure.status === 500)
      console.error("Backend request failed", error instanceof Error ? error.name : "unknown");
    return Response.json(
      { error: { code: failure.code } },
      { status: failure.status, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
export async function body<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new ApiError(415, "json_required");
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "invalid_json");
  let size = 0;
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 16384) {
      await reader.cancel();
      throw new ApiError(413, "request_too_large");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  let raw: unknown;
  try {
    raw = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new ApiError(400, "invalid_json");
  }
  return schema.parse(raw);
}
export function requestKey(request: Request) {
  return IdempotencyKey.parse(request.headers.get("idempotency-key"));
}
export async function context(request: Request) {
  const { db, learnerId } = await getDataAccess(request);
  return { db, service: createBackendService(db, learnerId) };
}
export async function learnerTopic(db: DataAccess, topicId: string) {
  Slug.parse(topicId);
  const state = await db.state();
  const root = existsSync(resolve(process.cwd(), "packages/content/topics"))
    ? process.cwd()
    : resolve(process.cwd(), "../..");
  try {
    return await loadTopic(resolve(root, "packages/content/topics"), topicId, state.profile.locale);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT")
      throw new ApiError(503, "lesson_content_unavailable");
    if (error instanceof z.ZodError) throw new ApiError(503, "lesson_content_invalid");
    throw error;
  }
}
