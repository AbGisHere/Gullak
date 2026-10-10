import { getTranslations } from "next-intl/server";

export default async function Offline() {
  const t = await getTranslations("app");
  return (
    <main className="mx-auto flex min-h-svh max-w-md items-center px-4">
      <p className="text-lg">{t("offline")}</p>
    </main>
  );
}
