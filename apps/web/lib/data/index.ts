import "server-only";
import { privilegedClient, verifiedIdentity } from "../backend/auth";
import { createDataAccess } from "./transactions";

/** The one app data-access entry point. Identity is verified before any database access. */
export async function getDataAccess(request: Request) {
  const { client, learnerId } = await verifiedIdentity(request);
  return { db: createDataAccess(client, privilegedClient(), learnerId), learnerId };
}
export type { DataAccess, LearnerState } from "./transactions";
