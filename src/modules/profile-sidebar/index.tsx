import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ModuleContext } from "@/modules/types";

const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

type Position = "LEFT" | "RIGHT";

function processClassName(position: Position) {
  const baseClassName = "absolute top-0 bottom-0 w-64 flex flex-col p-6 gap-6 shrink-0 overflow-y-auto";
  const borderClassName = "border-gray-200 dark:border-gray-800";

  switch (position) {
    case "LEFT":
      return `left-0 ${baseClassName} border-r ${borderClassName}`;
    case "RIGHT":
      return `right-0 ${baseClassName} border-l ${borderClassName}`;
  }
}

export default async function ProfileSidebar({ context, position }: { context: ModuleContext, position: Position }) {
  const t = await getTranslations("userSidebar");
  const { profileUser, currentSession } = context;

  const isOwner = currentSession?.session.userId == profileUser.id;

  return (
    <aside className={processClassName(position)}>
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-700">
          <Image
            src={profileUser.imageURL || DEFAULT_AVATAR}
            alt={profileUser.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-900 dark:text-white">{profileUser.name}</p>
          {profileUser.username && (
            <p className="text-sm text-gray-500">@{profileUser.username}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {profileUser.promo && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">{t("promo")}</span>
            <span>{profileUser.promo}</span>
          </div>
        )}
        {profileUser.quote && (
          <p className="text-sm text-gray-500 italic border-l-2 border-gray-300 pl-3">
            {profileUser.quote}
          </p>
        )}
      </div>

      {isOwner && (
        <div className="mt-auto">
          <Link
            href="/users/me/settings"
            className="w-full text-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {t("settings")}
          </Link>
        </div>
      )}
    </aside>
  );
}
