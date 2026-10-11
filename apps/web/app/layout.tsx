import "@gullak/ui/globals.css";
import "./game.css";
import { cn } from "@gullak/ui/lib/utils";
import { SerwistProvider } from "@serwist/turbopack/react";
import type { Metadata, Viewport } from "next";
import { Baloo_2, Baloo_Tammudu_2, Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { Providers } from "@/components/providers";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
// Display voice for game surfaces: one rounded family from an Indian foundry that covers
// Latin + Devanagari (Baloo 2) and Telugu (Baloo Tammudu 2). Body text stays Geist.
const baloo = Baloo_2({ subsets: ["latin", "devanagari"], weight: ["600", "700", "800"], variable: "--font-baloo" });
const balooTelugu = Baloo_Tammudu_2({
  subsets: ["telugu"],
  weight: ["600", "700", "800"],
  variable: "--font-baloo-telugu",
  preload: false,
});

export const metadata: Metadata = {
  title: "Gullak",
  description: "Learn money. Practise with play money on real markets.",
  applicationName: "Gullak",
  appleWebApp: { capable: true, title: "Gullak", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f3e8" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn("antialiased font-sans", geist.variable, fontMono.variable, baloo.variable, balooTelugu.variable)}
    >
      <body>
        <SerwistProvider swUrl="/serwist/sw.js">
          <NextIntlClientProvider>
            <Providers>{children}</Providers>
          </NextIntlClientProvider>
        </SerwistProvider>
      </body>
    </html>
  );
}
