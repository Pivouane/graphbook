import { prisma } from "@/lib/prisma/client";
import { getTranslations } from "next-intl/server";
import { PostForm } from "./post-form";
import { PostCard } from "./post-card";
import type { ModuleContext } from "@/modules/types";

type Position = "LEFT" | "RIGHT" | "TOP" | "BOTTOM";
type Direction = "BOTTOM_TO_TOP" | "TOP_TO_BOTTOM";

function processClassName(position: Position, margin: string, height: string, width: string) {
  const base = "absolute flex flex-col overflow-hidden";
  const pos: Record<Position, string> = {
    LEFT:   "left-0 top-0 bottom-0 self-center",
    RIGHT:  "top-0 bottom-0 right-0 self-center",
    TOP:    "left-0 top-0 right-0 justify-self-center",
    BOTTOM: "left-0 bottom-0 right-0 justify-self-center",
  };
  return [base, pos[position], margin, height, width].filter(Boolean).join(" ");
}

interface Props {
  context: ModuleContext;
  position: Position;
  direction: Direction;
  margin?: string;
  height?: string;
  width?: string;
}

function validateProps(props: Props): boolean {
  const validPositions: Position[] = ["LEFT", "RIGHT", "TOP", "BOTTOM"];
  const validDirections: Direction[] = ["BOTTOM_TO_TOP", "TOP_TO_BOTTOM"];

  if (!validPositions.includes(props.position)) {
    return false;
  }
  if (!validDirections.includes(props.direction)) {
    return false;
  }

  if (props.margin) {
    const marginRegex = /^(m|mx|my|mt|mb|ml|mr)-\d+$/;
    if (!marginRegex.test(props.margin)) {
      return false;
    }
  }

  if (props.height) {
    const heightRegex = /^h-\w+$/;
    if (!heightRegex.test(props.height)) {
      return false;
    }
  }

  if (props.width) {
    const widthRegex = /^w-\w+$/;
    if (!widthRegex.test(props.width)) {
      return false;
    }
  }

  return true;
}

export default async function PostWall({ context, position, direction, margin = "", height = "", width = "" }: Props) {

  if (!validateProps({ context, position, direction, margin, height, width })) {
    return <p className="text-red-500">Invalid post wall configuration.</p>;
  }

  const t = await getTranslations("userProfile");
  const { profileUser, currentSession } = context;

  const posts = await prisma.post.findMany({
    where: {
      profileId: profileUser.id,
      OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
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

  const isReversed = direction === "BOTTOM_TO_TOP";

  return (
    <main className={processClassName(position, margin, height, width)}>
      <div className={`flex-1 overflow-y-auto p-4 flex gap-4 ${isReversed ? "flex-col-reverse" : "flex-col"}`}>
        {posts.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-12">{t("noPosts")}</p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentSession?.session.userId}
              profileId={profileUser.id}
            />
          ))
        )}
      </div>

      {currentSession && (
        <div className="shrink-0 border-t border-gray-200 dark:border-gray-800 p-4">
          <PostForm
            profileId={profileUser.id}
            authorId={currentSession.session.userId}
          />
        </div>
      )}
    </main>
  );
}
