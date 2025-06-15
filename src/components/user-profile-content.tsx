"use client";

import Post from "@/components/post";
import PostInput from "@/components/post-input";
import ProfileSidebar from "@/components/profile-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { firstName, pascalCase } from "@/lib/utils";
import { DbUser, PublicUser } from "@/types/user";
import { useState } from "react";
import UserForm from "./user-form";

export default function UserProfileContent({
  user,
  edit,
}: {
  user: PublicUser | DbUser;
  edit?: boolean;
}) {
  const [selectedTab, setSelectedTab] = useState(edit ? "edit" : "apropos");

  return (
    <SidebarProvider>
      <ProfileSidebar user={user} />
      <SidebarTrigger className="fixed z-10" />
      <div className="container mx-auto flex flex-col h-screen">
        <div className="flex-1 flex flex-col h-full">
          <Tabs
            defaultValue={edit ? "edit" : "apropos"}
            className="w-full h-full flex flex-col"
            onValueChange={setSelectedTab}
          >
            <TabsList
              className="justify-center mx-auto space-x-4 font-semibold text-gray-700 dark:text-gray-300 flex w-max"
              style={{ height: "50px" }}
            >
              {edit && <TabsTrigger value="edit">Edit</TabsTrigger>}
              <TabsTrigger value="apropos">
                On {pascalCase(user!.name)}
              </TabsTrigger>
              <TabsTrigger value="authored">
                By {pascalCase(user!.name)}
              </TabsTrigger>
            </TabsList>
            {edit && (
              <TabsContent
                value="edit"
                className="text-center"
                style={{ maxHeight: "calc(100vh - 50px)", overflowY: "auto" }}
              >
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                  <UserForm user={user as DbUser} />
                </div>
              </TabsContent>
            )}
            <TabsContent
              value="apropos"
              className="text-center space-y-4"
              style={{ maxHeight: "calc(100vh - 400px)", overflowY: "auto" }}
            >
              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
                {user?.posts.length === 0 ? (
                  <div className="space-y-2 flex flex-col items-center">
                    <p>
                      No one has posted anything about {firstName(user!.name)}{" "}
                      yet.
                    </p>
                    <p>Be the first to post about {firstName(user!.name)}!</p>
                  </div>
                ) : (
                  user?.posts.map((post) => <Post key={post.id} post={post} />)
                )}
              </div>
            </TabsContent>
            <TabsContent
              value="authored"
              className="text-center"
              style={{ maxHeight: "calc(100vh - 400px)", overflowY: "auto" }}
            >
              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
                {user?.authorPosts.length === 0 ? (
                  <div className="space-y-2 flex flex-col items-center">
                    <p>{firstName(user!.name)} has not posted anything yet.</p>
                  </div>
                ) : (
                  user?.authorPosts.map((post) => (
                    <Post key={post.id} post={post} />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
          {selectedTab !== "edit" && (
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 pt-2 pb-4 border-t border-gray-200 dark:border-gray-800">
              <PostInput userId={user.id} />
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}
