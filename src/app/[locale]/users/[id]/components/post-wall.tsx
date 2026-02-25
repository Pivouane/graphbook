import { prisma } from "@/lib/prisma/client";
import { PostForm } from "./post-form";
import { PostCard } from "./post-card";
import { getTranslations } from "next-intl/server";

interface Props {
  profileId: string;
  currentUserId: string | undefined;
}

export async function PostWall({ profileId, currentUserId }: Props) {
  const t = await getTranslations("userProfile");

  const posts = await prisma.post.findMany({
    where: { profileId,
      OR: [
        { deletedAt: null },
        { deletedAt: { isSet: false } }
      ]
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      image: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          imageURL: true,
        },
      },
    },
  });

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-4">
      {currentUserId && (
        <PostForm profileId={profileId} authorId={currentUserId} />
      )}
      {posts.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-12">
          {t("noPosts")}
        </p>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            profileId={profileId}
          />
        ))
      )}
    </div>
  );
}
