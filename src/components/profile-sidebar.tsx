import { PublicUser } from "@/types/user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { pascalCase } from "@/lib/utils";

const LeftSidebarGroup = ({ children }: { children: React.ReactNode }) => (
  <SidebarGroup className="text-sm text-gray-700 dark:text-gray-300">
    {children}
  </SidebarGroup>
);

export default function ProfileSidebar({ user }: { user: PublicUser }) {
  return (
    <Sidebar className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4">
      <SidebarHeader className="flex items-center space-x-2 mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {pascalCase(user.name)}
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {user.posts.length} post{user.posts.length > 1 ? "s" : ""}
        </span>
      </SidebarHeader>
      <SidebarContent className="space-y-2">
        {user.email && <LeftSidebarGroup>email: {user.email}</LeftSidebarGroup>}
        {user.createdAt && (
          <LeftSidebarGroup>
            {/* user since: {user.createdAt.toDateString()} */}
            user since: {new Date(user.createdAt).toDateString()}
          </LeftSidebarGroup>
        )}
        {user.username && (
          <LeftSidebarGroup>username: {user.username}</LeftSidebarGroup>
        )}
        {user.quote && <LeftSidebarGroup>quote: {user.quote}</LeftSidebarGroup>}
        {user.promo && <LeftSidebarGroup>promo: {user.promo}</LeftSidebarGroup>}
      </SidebarContent>
    </Sidebar>
  );
}
