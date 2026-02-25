import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { UserSidebar } from "./components/sidebar";
import { PostWall } from "./components/post-wall";

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params;

  const resolvedId = id === "me"
    ? (await auth.api.getSession({ headers: await headers() }))?.user?.id
    : id;

  if (!resolvedId) notFound();

  const user = await prisma.user.findUnique({
    where: { id: resolvedId },
    select: {
      id: true,
      name: true,
      username: true,
      imageURL: true,
      quote: true,
      promo: true,
    },
  });

  if (!user) notFound();

  const session = await auth.api.getSession({ headers: await headers() });
  const isOwner = session?.user?.id === user.id;

  return (
    <div className="flex h-screen overflow-hidden">
      <UserSidebar user={user} isOwner={isOwner} />
      <main className="flex-1 overflow-y-auto p-6">
        <PostWall profileId={user.id} currentUserId={session?.user?.id} />
      </main>
    </div>
  );
}
