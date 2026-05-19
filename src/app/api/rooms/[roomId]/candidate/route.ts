import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { CandidateSubmitSchema } from "@/lib/schemas";
import { apiSuccess, apiError, apiValidationError } from "@/lib/api";

type Params = { params: Promise<{ roomId: string }> };

// POST /api/rooms/[roomId]/candidate — save candidate onboarding data
export async function POST(request: NextRequest, { params }: Params) {
  const { roomId } = await params;
  const body = await request.json();

  const parsed = CandidateSubmitSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const roomRef = adminDb.collection("rooms").doc(roomId);
  const room = await roomRef.get();
  if (!room.exists) return apiError("Room not found", 404);

  const candidate = {
    ...parsed.data,
    joinedAt: new Date().toISOString(),
  };

  await roomRef.update({ candidate, status: "ACTIVE" });

  return apiSuccess({ candidate });
}

// GET /api/rooms/[roomId]/candidate — get candidate info for a room
export async function GET(_request: NextRequest, { params }: Params) {
  const { roomId } = await params;
  const room = await adminDb.collection("rooms").doc(roomId).get();
  if (!room.exists) return apiError("Room not found", 404);

  const data = room.data();
  return apiSuccess({ candidate: data?.candidate ?? null });
}
