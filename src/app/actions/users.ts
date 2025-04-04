import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DbUser, PublicUser, UserSearchResult } from "@/types/user";
import { Post } from "@/types/post";
import { User as authUser } from "better-auth";
import { headers } from "next/headers";

function isMutual(pageUser: DbUser, authedUser: authUser) {
  if (!authedUser) return false;
  return pageUser.favorite?.some(fav => fav.id === authedUser.id) || pageUser.authorPosts.some(post => post.user?.id === authedUser.id) || pageUser.id === authedUser.id;
}

function restrictPosts(posts: Post[], authedUser: authUser, mutuality: boolean, privacy: "PUBLIC" | "PROTECTED" | "PRIVATE"): Post[] {
  const base = posts.filter(post => post.privacy === "PUBLIC" || (post.privacy === "PROTECTED" && mutuality));

  if (privacy === "PUBLIC") return base.concat(posts.filter(post => !post.privacy || post.author?.id === authedUser.id));
  if (privacy === "PROTECTED") return base.concat(posts.filter(post => (!post.privacy && mutuality) || post.author?.id === authedUser.id));
  if (privacy === "PRIVATE") return base.concat(posts.filter(post => post.author?.id === authedUser.id));

  return base;
}

export async function searchUsers(query: string): Promise<any[]> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return [];
  }

  const originalQuery = query;
  const normalizedQuery = query.toLowerCase().replace(/[.\s_-]/g, '');

  let queryParts: string[];
  if (query.includes('@')) {
    const [localPart, domain] = query.split('@');
    queryParts = [localPart];
  } else if (query.includes('.')) {
    queryParts = query.split('.');
  } else {
    queryParts = query.split(/\s+/);
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: originalQuery, mode: 'insensitive' } },
        { username: { contains: originalQuery, mode: 'insensitive' } },
        // { email: { contains: originalQuery, mode: 'insensitive' } },

        { name: { contains: normalizedQuery, mode: 'insensitive' } },
        { username: { contains: normalizedQuery, mode: 'insensitive' } },
        // { email: { contains: normalizedQuery, mode: 'insensitive' } },

        ...queryParts.map(part => ({
          OR: [
            { name: { contains: part, mode: 'insensitive' as any } },
            { username: { contains: part, mode: 'insensitive' as any } },
            { email: { contains: part, mode: 'insensitive' as any } }
          ]
        }))
      ]
    },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      image: true
    },
    take: 10 // Limit results while still getting good matches
  });

  // Optional post-processing for better ranking
  // Calculate relevance scores for sorting
  const scoredResults = users.map(user => {
    let score = 0;
    const normalizedName = (user.name || '').toLowerCase();
    const normalizedUsername = (user.username || '').toLowerCase();
    const normalizedEmail = (user.email || '').toLowerCase();

    // Higher score for exact matches
    if (normalizedName === query.toLowerCase()) score += 10;
    if (normalizedUsername === query.toLowerCase()) score += 10;
    if (normalizedEmail === query.toLowerCase()) score += 10;

    // Score for substring matches
    if (normalizedName.includes(query.toLowerCase())) score += 5;
    if (normalizedUsername.includes(query.toLowerCase())) score += 6;
    if (normalizedEmail.includes(query.toLowerCase())) score += 4;

    // Score for normalized matches
    if (normalizedName.replace(/[.\s_-]/g, '').includes(normalizedQuery)) score += 3;
    if (normalizedUsername.replace(/[.\s_-]/g, '').includes(normalizedQuery)) score += 3;
    if (normalizedEmail.replace(/[.\s_-]/g, '').includes(normalizedQuery)) score += 3;

    return { ...user, score };
  });

  // Return the top 5 results after sorting by relevance
  return scoredResults
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ score, ...user }) => user); // Remove the score field
}
export async function fetchUser(id: string): Promise<DbUser | null> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return null;
  }

  // never authorize a user to fetch another user's full data
  if (session.user.id !== id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: id
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
      favorite: {
        select: {
          id: true,
          name: true
        }
      },
      name: true,
      username: true,
      quote: true,
      promo: true,
      privacy: true,
      posts: {
        select: {
          id: true,
          title: true,
          content: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          privacy: true,
        }
      },
      authorPosts: {
        select: {
          id: true,
          title: true,
          content: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          privacy: true,
          user: {
            select: {
              id: true
            }
          }
        }
      },
    }
  }).catch(() => null);


  return user;
}


export async function fetchUserAndPosts(id: string): Promise<PublicUser | null> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  const user = await prisma.user.findUnique({
    where: {
      id: id
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
      favorite: {
        select: {
          id: true,
          name: true
        }
      },
      name: true,
      username: true,
      quote: true,
      promo: true,
      privacy: true,
      posts: {
        select: {
          id: true,
          title: true,
          content: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          privacy: true,
        }
      },
      authorPosts: {
        select: {
          id: true,
          title: true,
          content: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          privacy: true,
          user: {
            select: {
              id: true
            }
          }
        }
      },
    }
  }).catch(() => null);

  if (!user) return null;

  if (!session) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      posts: [],
      authorPosts: [],
    };
  }

  const baseUser = {
    id: user.id,
    name: user.name,
    email: user.email
  }

  const mutuality = isMutual(user, session.user);

  if (user.privacy === "PUBLIC" || (user.privacy === "PROTECTED" && mutuality)) {
    Object.assign(baseUser, {
      email: user.email,
      createdAt: user.createdAt,
      favorite: user.favorite,
      username: user.username,
      quote: user.quote,
      promo: user.promo
    });
  }

  return {
    ...baseUser,
    posts: restrictPosts(user.posts, session.user, mutuality, user.privacy),
    authorPosts: restrictPosts(user.authorPosts, session.user, mutuality, user.privacy)
  }

}
