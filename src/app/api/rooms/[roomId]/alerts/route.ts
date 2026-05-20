import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { AlertSchema } from "@/lib/schemas";
import { apiSuccess, apiError, apiValidationError } from "@/lib/api";

type Params = { params: Promise<{ roomId: string }> };

// POST /api/rooms/[roomId]/alerts â€” issue a warning
export async function POST(request: NextRequest, { params }: Params) {
  const { roomId } = await params;
  const body = await request.json();

  const parsed = AlertSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const alert = {
    ...parsed.data,
    createdAt: new Date().toISOString(),
  };

  const ref = await adminDb
    .collection("rooms").doc(roomId)
    .collection("alerts")
    .add(alert);

  return apiSuccess({ id: ref.id, ...alert }, 201);
}

// GET /api/rooms/[roomId]/alerts â€” get all alerts
export async function GET(_request: NextRequest, { params }: Params) {
  const { roomId } = await params;

  const snapshot = await adminDb
    .collection("rooms").doc(roomId)
    .collection("alerts")
    .orderBy("createdAt", "asc")
    .get();

  const alerts = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));

  return apiSuccess({ alerts });
}
