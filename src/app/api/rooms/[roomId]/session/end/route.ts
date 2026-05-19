import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { apiSuccess, apiError } from "@/lib/api";

type Params = { params: Promise<{ roomId: string }> };

// POST /api/rooms/[roomId]/session/end
export async function POST(request: NextRequest, { params }: Params) {
  const { roomId } = await params;
  const roomRef = adminDb.collection("rooms").doc(roomId);
  const roomSnap = await roomRef.get();
  if (!roomSnap.exists) return apiError("Room not found", 404);

  const endedAt = new Date().toISOString();

  await roomRef.update({
    "session.status": "ENDED",
    "session.endedAt": endedAt,
    status: "ENDED",
  });

  // Fire webhook if configured
  const roomData = roomSnap.data()!;
  const recruiterDoc = await adminDb.collection("recruiters").doc(roomData.recruiterId).get();
  const settings = recruiterDoc.data()?.settings;

  if (settings?.webhookUrl) {
    // Get latest trust score
    const trustSnap = await adminDb
      .collection("rooms").doc(roomId)
      .collection("trustLogs")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    const finalScore = trustSnap.docs[0]?.data()?.score ?? null;

    const payload = {
      event: "session.ended",
      roomId,
      candidateName: roomData.candidate?.name ?? "Unknown",
      finalTrustScore: finalScore,
      timestamp: endedAt,
    };

    // Fire-and-forget webhook
    fetch(settings.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {}); // suppress errors — don't block response
  }

  return apiSuccess({ message: "Session ended", endedAt });
}
