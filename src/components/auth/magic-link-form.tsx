"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth/client";
import { clsx } from "clsx";

export function MagicLinkForm() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setStatus("loading");

    const { error } = await authClient.signIn.magicLink({
      email,
      name: email.split("@")[0],
      callbackURL: process.env.NEXT_PUBLIC_APP_URL,
    });

    setStatus(error ? "error" : "sent");
  };

  if (status === "sent") {
    return (
      <div className={clsx("text-center py-6")}>
        <p className={clsx("font-medium")}>{t("sent")}</p>
        <p className={clsx("text-gray-400 text-sm mt-1")}>
          {t("sentDescription", { email })}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={clsx("flex flex-col gap-3")}>
      <input
        type="email"
        placeholder={t("placeholder")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className={clsx("w-full border border-gray-300 rounded-md px-3 py-2",
          "text-sm focus:outline-none focus:ring-2 focus:ring-blue-500")}
      />
      <button
        type="submit"
        disabled={!email || status === "loading"}
        className={clsx("w-full bg-blue-500 hover:bg-blue-600",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "text-white text-sm font-medium rounded-md px-3 py-2 transition-colors")}
      >
        {status === "loading" ? t("sending") : t("submit")}
      </button>
      {status === "error" && (
        <p className={clsx("text-red-500 text-xs text-center")}>{t("error")}</p>
      )}
    </form>
  );
}
