import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initials } from "@/lib/utils";
import { headers } from "next/headers";

export async function fetchGraphData() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      favoriteIDs: true,
      favoritedByIDs: true,
      image: true
    }
  });

  const posts = await prisma.post.groupBy({
    by: ['userId', 'authorId'],
    _count: {
      id: true
    }
  })

  const nodes = users.map(user => ({
    id: user.id,
    image: user.image || null,
    label: user.id === session?.user?.id ? "You" : user.name,
    sub: user.id === session?.user?.id ? "You" : initials(user.name),
    size: user.id === session?.user?.id ? 20 : 15,
    hover: user.id === session?.user?.id ? "edit" : "view",
    url: user.id === session?.user?.id ? `/users/me` : `/users/${user.id}`,
  }))

  const links: { source: string, target: string, strength: number }[] = []

  users.forEach(user => {
    user.favoriteIDs.forEach(fav => {
      if (user.id === fav) {
        return;
      }
      if (user.favoritedByIDs.includes(fav)) {
        links.push({
          source: user.id,
          target: fav,
          strength: 2
        })
      }
    })
  });

  posts.forEach(post => {
    if (post.userId === post.authorId) {
      return;
    }
    if (links.some(link => link.source === post.userId && link.target === post.authorId)) {
      return;
    }
    links.push({
      source: post.userId,
      target: post.authorId,
      strength: post._count.id / 10
    })
  })

  return {
    nodes,
    links
  }
}
