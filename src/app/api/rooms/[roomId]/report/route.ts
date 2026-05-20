import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { apiSuccess, apiError } from "@/lib/api";

type Params = { params: Promise<{ roomId: string }> };

// POST /api/rooms/[roomId]/report/compile
export async function POST(_request: NextRequest, { params }: Params) {
  const { roomId } = await params;

  const roomSnap = await adminDb.collection("rooms").doc(roomId).get();
  if (!roomSnap.exists) return apiError("Room not found", 404);
  const roomData = roomSnap.data()!;

  // Fetch all trust logs
  const trustSnap = await adminDb
    .collection("rooms").doc(roomId)
    .collection("trustLogs")
    .orderBy("createdAt", "asc")
    .get();

  // Fetch all alerts
  const alertsSnap = await adminDb
    .collection("rooms").doc(roomId)
    .collection("alerts")
    .orderBy("createdAt", "asc")
    .get();

  const trustLogs = trustSnap.docs.map((d: any) => d.data());
  const alerts = alertsSnap.docs.map((d: any) => d.data());

  const finalScore = trustLogs.at(-1)?.score ?? 100;

  // Build timeline: merge trust and alert events by time
  const timeline: { t: string; event: string; type: string }[] = [
    { t: roomData.session?.startedAt ?? roomData.createdAt, event: "Candidate joined the room", type: "info" },
    ...alerts.map((a: any) => ({
      t: a.createdAt,
      event: a.message,
      type: "warning",
    })),
    ...(roomData.session?.endedAt
      ? [{ t: roomData.session.endedAt, event: "Session ended", type: "info" }]
      : []),
  ].sort((a, b) => a.t.localeCompare(b.t));

  const report = {
    roomId,
    candidateName: roomData.candidate?.name ?? "Unknown",
    candidateRole: roomData.candidate?.role ?? "Unknown",
    finalScore,
    alertCount: alerts.length,
    timeline,
    compiledAt: new Date().toISOString(),
  };

  await adminDb
    .collection("rooms").doc(roomId)
    .collection("report")
    .doc("compiled")
    .set(report);

  return apiSuccess({ report });
}

// GET /api/rooms/[roomId]/report â€” fetch compiled report
export async function GET(_request: NextRequest, { params }: Params) {
  const { roomId } = await params;

  const reportSnap = await adminDb
    .collection("rooms").doc(roomId)
    .collection("report")
    .doc("compiled")
    .get();

  if (!reportSnap.exists) return apiError("Report not yet compiled", 404);

  return apiSuccess({ report: reportSnap.data() });
}
