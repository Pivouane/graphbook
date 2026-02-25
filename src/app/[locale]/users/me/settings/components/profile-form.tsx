"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { updateProfile } from "./actions";
import Image from "next/image";
import { useTranslations } from "next-intl";

const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

interface User {
  id: string;
  name: string;
  username: string | null;
  imageURL: string | null;
  quote: string | null;
  promo: string | null;
}

export function ProfileForm({ user }: { user: User }) {
  const t = useTranslations("userSettings.profileForm");

  const [username, setUsername] = useState(user.username ?? "");
  const [quote, setQuote] = useState(user.quote ?? "");
  const [promo, setPromo] = useState(user.promo ?? "");
  const [imageURL, setImageURL] = useState(user.imageURL ?? "");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setSuccess(false);
    await updateProfile({ username, quote, promo, imageURL });
    setPending(false);
    setSuccess(true);
  };

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
        {t("title")}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-700 shrink-0">
            <Image
              src={imageURL || DEFAULT_AVATAR}
              alt="avatar"
              fill
              className="object-cover"
            />
          </div>
          <input
            type="url"
            value={imageURL}
            onChange={(e) => setImageURL(e.target.value)}
            placeholder={t("avatarURLPlaceholder")}
            className={clsx("flex-1 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500")}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("username")}
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t("usernamePlaceholder")}
            className={clsx("border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500")}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("quote")}
          </label>
          <textarea
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder={t("quotePlaceholder")}
            rows={2}
            className={clsx("border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none")}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("promo")}
          </label>
          <input
            type="text"
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
            placeholder={t("promoPlaceholder")}
            className={clsx("border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500")}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className={clsx("px-4 py-2 text-sm font-medium rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors")}
          >
            {pending ? t("saving") : t("saveChanges")}
          </button>
          {success && (
            <span className="text-sm text-green-500">{t("saved")}</span>
          )}
        </div>
      </form>
    </section>
  );
}
