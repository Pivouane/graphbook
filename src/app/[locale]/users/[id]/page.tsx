import { fetchUser, fetchUserAndPosts } from "@/app/actions/users";
import { SidebarProvider } from "@/components/ui/sidebar";
import UserProfileContent from "@/components/user-profile-content";

export default async function PostPage({
  params,
}: {
  params: { id: string; himself?: boolean };
}) {
  const { id: userId, himself } = params;

  let user;

  if (himself) {
    user = await fetchUser(userId);
  } else {
    user = await fetchUserAndPosts(userId);
  }

  console.log(user);

  if (!user) {
    return <p className="text-center text-red-500">User not found.</p>;
  }

  return <UserProfileContent user={user!} edit={himself} />;
}
