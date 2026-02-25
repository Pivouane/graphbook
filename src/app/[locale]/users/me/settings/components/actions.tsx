"use server";

import { prisma } from "@/lib/prisma/client";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

const FAVORITE_LIMIT = 3;

export async function updateProfile({
  username,
  quote,
  promo,
  imageURL,
}: {
  username: string;
  quote: string;
  promo: string;
  imageURL: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      username: username || null,
      quote: quote || null,
      promo: promo || null,
      imageURL: imageURL || null,
    },
  });

  revalidatePath("/users/me");
  revalidatePath("/users/me/settings");
}

export async function searchUsers(query: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  if (!query.trim()) return [];

  return prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { username: { contains: query, mode: "insensitive" } },
      ],
      NOT: { id: session.user.id },
    },
    select: {
      id: true,
      name: true,
      username: true,
      imageURL: true,
      promo: true,
    },
    take: 10,
  });
}

export async function addFavorite(userId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { favoriteIDs: true },
  });

  if (!user) throw new Error("User not found");
  if (user.favoriteIDs.length >= FAVORITE_LIMIT) throw new Error("LimitReached");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { favorites: { connect: { id: userId } } },
  });

  revalidatePath("/users/me/settings");
  revalidatePath("/");
}
export async function removeFavorite(userId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      favorites: { disconnect: { id: userId } },
    },
  });

  revalidatePath("/users/me/settings");
  revalidatePath("/");
}
