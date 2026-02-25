"use server";

import { prisma } from "@/lib/prisma/client";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createPost({
  content,
  profileId,
  authorId,
}: {
  content: string;
  profileId: string;
  authorId: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  if (session.user.id !== authorId) throw new Error("Unauthorized");

  await prisma.post.create({
    data: { content, profileId, authorId },
  });

  revalidatePath(`/users/${profileId}`);
}

export async function deletePost(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const postId = formData.get("postId") as string;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true, profileId: true },
  });

  if (!post) throw new Error("Post not found");

  const canDelete =
    session.user.id === post.authorId ||
    session.user.id === post.profileId;

  if (!canDelete) throw new Error("Unauthorized");

  await prisma.post.update({
    where: { id: postId },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/users/${post.profileId}`);
}
