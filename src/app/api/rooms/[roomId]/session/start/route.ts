import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { apiSuccess, apiError } from "@/lib/api";

type Params = { params: Promise<{ roomId: string }> };

// POST /api/rooms/[roomId]/session/start
export async function POST(_request: NextRequest, { params }: Params) {
  const { roomId } = await params;
  const roomRef = adminDb.collection("rooms").doc(roomId);
  const room = await roomRef.get();
  if (!room.exists) return apiError("Room not found", 404);

  await roomRef.update({
    "session.status": "ACTIVE",
    "session.startedAt": new Date().toISOString(),
  });

  return apiSuccess({ message: "Session started" });
}
