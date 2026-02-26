import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { ModuleRunner } from "@/components/modules/runner";
import { getActiveModulePayloads } from "@/lib/modules/client";
import { ModuleSession, ModuleUser } from "@/modules/types";

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

  const activePayloads = await getActiveModulePayloads(user.id);

  return (
    <div className="w-full h-screen overflow-hidden">
      <ModuleRunner
        activeModules={activePayloads}
        context={{ profileUser: user as ModuleUser, currentSession: (session as ModuleSession) ?? null }}
      />
    </div>
  );
}
