import { createSerwistRoute } from "@serwist/turbopack";

// Builds and serves the service worker at /serwist/sw.js (offline-capable lessons).
export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
  additionalPrecacheEntries: [{ url: "/~offline", revision: "0.0.1" }],
  swSrc: "app/sw.ts",
  useNativeEsbuild: true,
});
