/** Recovery controls must never interpret a path as an external redirect. */
export function safeRecoveryPath(path: string | undefined, origin: string): string {
  if (!path?.startsWith("/") || path.startsWith("//")) return "/";
  try {
    const destination = new URL(path, origin);
    if (destination.origin !== origin || destination.pathname.startsWith("//")) return "/";
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return "/";
  }
}
