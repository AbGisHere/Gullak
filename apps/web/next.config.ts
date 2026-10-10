import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  outputFileTracingIncludes: { "/api/**": ["../../packages/content/topics/**/*.json"] },
  transpilePackages: [
    "@gullak/ui",
    "@gullak/types",
    "@gullak/engine",
    "@gullak/content",
    "@gullak/market-data",
    "@gullak/ai",
  ],
};

export default withSerwist(withNextIntl(nextConfig));
