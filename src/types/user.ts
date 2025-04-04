import { Post } from "./post";

export interface DbUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  image?: string | null;
  providers?: string[];
  favorite: { id: string; name: string }[];
  username: string | null;
  quote: string | null;
  promo: string | null;
  posts: Post[];
  authorPosts: Post[];
  privacy: "PUBLIC" | "PROTECTED" | "PRIVATE";
}

export interface PublicUser {
  id: string;
  name: string;
  posts: Post[];
  authorPosts: Post[];
  email?: string;
  createdAt?: Date;
  favorite?: { id: string; name: string }[];
  username?: string | null;
  quote?: string | null;
  promo?: string | null;
}

export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  username?: string | null;
  image?: string | null;
}
