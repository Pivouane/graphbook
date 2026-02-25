import { namify } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  username: string | null;
  imageURL: string | null;
  quote: string | null;
  promo: string | null;
}

interface Props {
  user: User;
  isOwner: boolean;
}

const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

export function UserSidebar({ user, isOwner }: Props) {
  const t = useTranslations("userSidebar");

  return (
    <aside className="w-64 h-screen border-r border-gray-200 dark:border-gray-800 flex flex-col p-6 gap-6 shrink-0">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-700">
          <Image
            src={user.imageURL || DEFAULT_AVATAR}
            alt={user.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-900 dark:text-white">{namify(user.name)}</p>
          {user.username && (
            <p className="text-sm text-gray-500">@{user.username}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {user.promo && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">
              {t("promo")}
            </span>
            <span>{user.promo}</span>
          </div>
        )}
        {user.quote && (
          <p className="text-sm text-gray-500 italic border-l-2 border-gray-300 pl-3">
            {user.quote}
          </p>
        )}
      </div>

      {isOwner && (
        <div className="mt-auto">
          <Link
            href={{ pathname: "/users/me/settings" }}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {t("settings")}
          </Link>
        </div>
      )}
    </aside>
  );
}
