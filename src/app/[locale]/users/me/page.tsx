import { auth } from "@/lib/auth";
import PostPage from "../[id]/page";
import { headers } from "next/headers";

export default async function MePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <p className="text-center text-red-500">
        Please sign in to view your posts.
      </p>
    );
  }

  return <PostPage params={{ id: userId, himself: true }} />;
}
