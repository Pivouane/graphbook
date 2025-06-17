import { updateOwnUser } from "@/app/actions/users";

import { NextResponse } from "next/server";

export async function POST(request: Request) {

  const body = await request.json();
  const { id, ...data } = body;

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No data provided for update" }, { status: 400 });
  }
  try {
    const updatedUser = await updateOwnUser(id, data);
    if (!updatedUser) {
      return NextResponse.json({ error: "User not found or update failed" }, { status: 404 });
    }
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
