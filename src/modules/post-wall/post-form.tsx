"use client";

import { useState } from "react";
import { createPost } from "../../app/[locale]/users/[id]/components/actions";
import { clsx } from "clsx";
import { useTranslations } from "next-intl";

interface Props {
  profileId: string;
  authorId: string;
}

export function PostForm({ profileId, authorId }: Props) {
  const t = useTranslations("userProfile");

  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPending(true);
    await createPost({ content, profileId, authorId });
    setContent("");
    setPending(false);
  };

  return (
    <form onSubmit={handleSubmit} 
    className="flex flex-col gap-2 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t("postPlaceholder")}
        rows={3}
        className={clsx("w-full text-sm resize-none bg-transparent",
          "text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none")}
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!content.trim() || pending}
          className={clsx("text-sm px-4 py-1.5 rounded-md bg-blue-500 text-white",
            "hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors")}
        >
          {pending ? t("posting") : t("post")}
        </button>
      </div>
    </form>
  );
}
