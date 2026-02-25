import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma/client";
import { initials, namify } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";

export async function fetchGraphData() {
  const t = await getTranslations("graph");
  
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      favoriteIDs: true,
      imageURL: true,
      promo: true,
    },
  });

  const favoriteSet = new Set(
    users.flatMap((u) => u.favoriteIDs.map((fid) => `${u.id}:${fid}`))
  );

  const posts = await prisma.post.groupBy({
    by: ["profileId", "authorId"],
    _count: { id: true },
    where: { deletedAt: null },
  });

  const nodes = users.map((user) => ({
    id: user.id,
    image: user.imageURL || null,
    label: user.id === session?.user?.id ? t("you") : namify(user.name),
    sub: initials(user.name),
    size: user.id === session?.user?.id ? 20 : 15,
    url: user.id === session?.user?.id ? "/users/me" : `/users/${user.id}`,
    promo: user.promo || null,
  }));

  const links: { source: string; target: string; strength: number }[] = [];
  const seen = new Set<string>();

  users.forEach((user) => {
    user.favoriteIDs.forEach((favId) => {
      if (favId === user.id) return;
      const key = [user.id, favId].sort().join(":");
      if (seen.has(key)) return;
      seen.add(key);

      const mutual =
        favoriteSet.has(`${user.id}:${favId}`) &&
        favoriteSet.has(`${favId}:${user.id}`);

      if (mutual) {
        links.push({ source: user.id, target: favId, strength: 2 });
      }
    });
  });

  posts.forEach((post) => {
    if (post.profileId === post.authorId) return;
    const key = [post.profileId, post.authorId].sort().join(":");
    if (seen.has(key)) return;
    seen.add(key);
    links.push({
      source: post.authorId,
      target: post.profileId,
      strength: post._count.id / 10,
    });
  });

  return { nodes, links };
}
