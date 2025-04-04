import { Privacy } from "@prisma/client";

export interface Post {
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
