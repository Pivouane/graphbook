import { MagicLinkForm } from "@/components/auth/magic-link-form";
import { useTranslations } from "next-intl";

export default function SignInPage() {
  const t = useTranslations("auth");

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">Graphbook</h1>
        <p className="text-gray-500 text-sm mb-8">{t("subtitle")}</p>
        <MagicLinkForm />
      </div>
    </main>
  );
}
