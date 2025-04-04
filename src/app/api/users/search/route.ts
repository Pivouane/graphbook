import { searchUsers } from "@/app/actions/users";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query || query.length < 2) {
    return NextResponse.json({ users: [] });
  }

  const users = await searchUsers(query);

  return NextResponse.json({ users });
}
