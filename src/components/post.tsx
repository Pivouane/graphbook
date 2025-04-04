"use client";

import { Privacy } from "@prisma/client";
import React from "react";

interface PostProps {
  id: string;
  title: string;
  content: string;
  image: string | null;
  author?: { id: string };
  user?: { id: string };
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  privacy: Privacy | null;
}

export default function Post({ post }: { post: PostProps }) {
  return (
    <div className="p-4 border border-gray-300 rounded-lg shadow-sm bg-white w-full">
      <p className="text-lg font-semibold mb-2">{post.title}</p>
      <p className="text-gray-500 dark:text-gray-400">{post.content}</p>
      {/* <p className="text-gray-500 dark:text-gray-400">
        {post.createdAt ? post.createdAt.toDateString() : ""}
      </p> */}
    </div>
  );
}
