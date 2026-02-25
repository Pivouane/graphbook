"use client";

import { useState } from "react";
import Image from "next/image";
import { clsx } from "clsx";
import { addFavorite,removeFavorite, searchUsers } from "./actions";
import { useDebounce } from "@/hooks/use-debounce";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { namify } from "@/lib/utils";

const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

interface UserPreview {
  id: string;
  name: string;
  username: string | null;
  imageURL: string | null;
  promo: string | null;
}

export function FavoritesManager({ favorites }: { favorites: UserPreview[] }) {
  const t = useTranslations("userSettings.favoritesManager");
  const [list, setList] = useState(favorites);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserPreview[]>([]);
  const [pending, setPending] = useState(false);
  const [maxError, setMaxError] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.trim()) {
    searchUsers(debouncedQuery).then(setResults);
    }
  }, [debouncedQuery]);

  const handleRemove = async (userId: string) => {
    setPending(true);
    await removeFavorite(userId);
    setList((prev) => prev.filter((u) => u.id !== userId));
    setPending(false);
  };

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
        {t("title")}
      </h2>

      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className={clsx(
            "border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          )}
        />
        {results.length > 0 && (
          <div className="border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
            {results.map((user) => (
              <SearchResult
                key={user.id}
                user={user}
                isFavorite={list.some((f) => f.id === user.id)}
                onAdd={(u) => setList((prev) => [...prev, u])}
                onMaxFavorites={() => setMaxError(true)}
              />
            ))}
          </div>
        )}
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-gray-400">{t("noFavorites")}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((user) => (
            <div key={user.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  <Image src={user.imageURL || DEFAULT_AVATAR} alt={user.name} fill className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{namify(user.name)}</p>
                  {user.username && <p className="text-xs text-gray-400">@{user.username}</p>}
                </div>
              </div>
              <button
                onClick={() => handleRemove(user.id)}
                disabled={pending}
                className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
              >
                {pending ? t("removing") : t("remove")}
              </button>
            </div>
          ))}
        </div>
      )}
      {maxError && (
        <p className="text-sm text-red-500">{t("maxFavoritesReached")}</p>
      )}
    </section>
  );
}

function SearchResult({
  user,
  isFavorite,
  onAdd,
  onMaxFavorites,
}: {
  user: UserPreview;
  isFavorite: boolean;
  onAdd: (u: UserPreview) => void;
  onMaxFavorites: () => void;
}) {
  const t = useTranslations("userSettings.favoritesManager");
  const [pending, setPending] = useState(false);

const handleAdd = async () => {
  setPending(true);
  try {
    await addFavorite(user.id);
    onAdd(user);
  } catch (e) {
    if (e instanceof Error && e.message === "LimitReached") {
      onMaxFavorites();
     }
  } finally {
    setPending(false);
  }
};
  return (
    <div className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-900">
      <div className="flex items-center gap-3">
        <div className="relative w-7 h-7 rounded-full overflow-hidden">
          <Image src={user.imageURL || DEFAULT_AVATAR} alt={user.name} fill className="object-cover" />
        </div>
        <p className="text-sm text-gray-900 dark:text-white">{namify(user.name)}</p>
      </div>
      {!isFavorite && (
        <button
          onClick={handleAdd}
          disabled={pending}
          className="text-xs text-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50"
        >
          {pending ? t("adding") : t("add")}
        </button>
      )}
    </div>
  );
}
