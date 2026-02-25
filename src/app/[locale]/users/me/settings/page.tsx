import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma/client";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ProfileForm } from "./components/profile-form";
import { FavoritesManager } from "./components/favorites-manager";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function SettingsPage() {
  const t = await getTranslations("userSettings");

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      username: true,
      imageURL: true,
      quote: true,
      promo: true,
      favoriteIDs: true,
      favorites: {
        select: {
          id: true,
          name: true,
          username: true,
          imageURL: true,
          promo: true,
        },
      },
    },
  });

  if (!user) notFound();

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 flex flex-col gap-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("title")}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {t("description")}
        </p>
      </div>
      <ProfileForm user={user} />
      <FavoritesManager favorites={user.favorites} />
      <div className="fixed mt-auto bottom-6 left-6">
        <Link
          href={{ pathname: "/users/me" }}
          className="w-full text-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          {t("viewMyProfile")}
        </Link>
      </div>
    </div>
  );
}
