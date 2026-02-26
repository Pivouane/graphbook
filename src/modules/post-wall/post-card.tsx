"use client";
import Image from "next/image";
import { deletePost } from "../../app/[locale]/users/[id]/components/actions";
import { useTranslations } from "next-intl";

const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

interface Post {
  id: string;
  content: string;
  image: string | null;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    username: string | null;
    imageURL: string | null;
  };
}

interface Props {
  post: Post;
  currentUserId: string | undefined;
  profileId: string;
}

export function PostCard({ post, currentUserId, profileId }: Props) {
  const t = useTranslations("userProfile");

  const canDelete = currentUserId === post.author.id || currentUserId === profileId;

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-full overflow-hidden">
            <Image
              src={post.author.imageURL || DEFAULT_AVATAR}
              alt={post.author.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {post.author.name}
            </p>
            {post.author.username && (
              <p className="text-xs text-gray-400">@{post.author.username}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {new Date(post.createdAt).toISOString().slice(0, 19).replace("T", " ")}
          </span>
          {canDelete && (
            <form action={deletePost}>
              <input type="hidden" name="postId" value={post.id} />
              <button
                type="submit"
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                {t("delete")}
              </button>
            </form>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
        {post.content}
      </p>

      {post.image && (
        <div className="relative w-full h-48 rounded-md overflow-hidden">
          <Image src={post.image} alt="post image" fill className="object-cover" />
        </div>
      )}
    </div>
  );
}
