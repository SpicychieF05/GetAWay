import { NextRequest } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { apiSuccess, apiError, apiValidationError, verifyAuthToken } from "@/lib/api";
import { z } from "zod";

const CreateRoomSchema = z.object({});

function generateRoomId(): string {
  return `GW-${Math.floor(1000 + Math.random() * 9000)}`;
}

// POST /api/rooms — create a new room
export async function POST(request: NextRequest) {
  const auth = await verifyAuthToken(request);
  if (!auth) return apiError("Unauthorized", 401);

  // Ensure unique room ID
  let roomId = generateRoomId();
  let attempts = 0;
  while (attempts < 5) {
    const existing = await adminDb.collection("rooms").doc(roomId).get();
    if (!existing.exists) break;
    roomId = generateRoomId();
    attempts++;
  }

  const room = {
    roomId,
    recruiterId: auth.uid,
    createdAt: new Date().toISOString(),
    status: "OPEN",
    candidate: null,
    session: {
      status: "WAITING",
      startedAt: null,
      endedAt: null,
    },
  };

  await adminDb.collection("rooms").doc(roomId).set(room);

  return apiSuccess({ roomId, room }, 201);
}

// GET /api/rooms — list all rooms for the logged-in recruiter
export async function GET(request: NextRequest) {
  const auth = await verifyAuthToken(request);
  if (!auth) return apiError("Unauthorized", 401);

  const snapshot = await adminDb
    .collection("rooms")
    .where("recruiterId", "==", auth.uid)
    .orderBy("createdAt", "desc")
    .get();

  const rooms = snapshot.docs.map((doc) => doc.data());

  return apiSuccess({ rooms });
}
