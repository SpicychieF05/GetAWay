import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { apiSuccess, apiError, verifyAuthToken } from "@/lib/api";

// GET /api/analytics?days=7
export async function GET(request: NextRequest) {
  const auth = await verifyAuthToken(request);
  if (!auth) return apiError("Unauthorized", 401);

  const days = Number(new URL(request.url).searchParams.get("days") ?? "7");
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceISO = since.toISOString();

  const snapshot = await adminDb
    .collection("rooms")
    .where("recruiterId", "==", auth.uid)
    .where("createdAt", ">=", sinceISO)
    .get();

  // Group by date
  const byDate: Record<string, { sessions: number; trustTotal: number; trustCount: number }> = {};

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const date = data.createdAt.slice(0, 10); // "YYYY-MM-DD"

    if (!byDate[date]) byDate[date] = { sessions: 0, trustTotal: 0, trustCount: 0 };
    byDate[date].sessions++;

    // Get final trust score for this room if session ended
    if (data.session?.status === "ENDED") {
      const trustSnap = await adminDb
        .collection("rooms").doc(data.roomId)
        .collection("trustLogs")
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();
      const score = trustSnap.docs[0]?.data()?.score;
      if (score != null) {
        byDate[date].trustTotal += score;
        byDate[date].trustCount++;
      }
    }
  }

  // Build chart-ready array sorted by date
  const result = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { sessions, trustTotal, trustCount }]) => ({
      date,
      name: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
      sessions,
      avgTrust: trustCount > 0 ? Math.round(trustTotal / trustCount) : null,
    }));

  return apiSuccess({ analytics: result });
}
