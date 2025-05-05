import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

// This route handles leaving a collaboration room
export async function POST(req: Request) {
  try {
    // Check if user is authenticated (optional)
    const authenticated = await isAuthenticated(req);

    // Get request body
    const body = await req.json();
    const { roomId } = body;

    if (!roomId) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    // Here you would implement the actual logic to leave the room
    // For example, removing the user from a database or Redis store

    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error leaving collaboration room:", error);
    return NextResponse.json(
      { error: "Failed to leave collaboration room" },
      { status: 500 }
    );
  }
}
