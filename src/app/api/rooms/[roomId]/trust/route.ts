import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { TrustLogSchema } from "@/lib/schemas";
import { apiSuccess, apiError, apiValidationError } from "@/lib/api";

type Params = { params: Promise<{ roomId: string }> };

// POST /api/rooms/[roomId]/trust — log a trust score event
export async function POST(request: NextRequest, { params }: Params) {
  const { roomId } = await params;
  const body = await request.json();

  const parsed = TrustLogSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const log = {
    ...parsed.data,
    createdAt: new Date().toISOString(),
  };

  const ref = await adminDb
    .collection("rooms").doc(roomId)
    .collection("trustLogs")
    .add(log);

  // Check if score dropped below recruiter's threshold and auto-create AI alert
  const roomSnap = await adminDb.collection("rooms").doc(roomId).get();
  const roomData = roomSnap.data();

  if (roomData?.recruiterId) {
    const recruiterDoc = await adminDb.collection("recruiters").doc(roomData.recruiterId).get();
    const threshold = recruiterDoc.data()?.settings?.aiThreshold ?? 75;

    if (parsed.data.score < threshold) {
      await adminDb
        .collection("rooms").doc(roomId)
        .collection("alerts")
        .add({
          message: `Trust score dropped to ${parsed.data.score}% (below threshold of ${threshold}%)`,
          issuedBy: "AI",
          createdAt: new Date().toISOString(),
        });
    }
  }

  return apiSuccess({ id: ref.id, ...log }, 201);
}
