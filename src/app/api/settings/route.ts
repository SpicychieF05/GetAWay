import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { SettingsSchema } from "@/lib/schemas";
import { apiSuccess, apiError, apiValidationError, verifyAuthToken } from "@/lib/api";

// GET /api/settings
export async function GET(request: NextRequest) {
  const auth = await verifyAuthToken(request);
  if (!auth) return apiError("Unauthorized", 401);

  const doc = await adminDb.collection("recruiters").doc(auth.uid).get();
  const settings = doc.data()?.settings ?? {
    aiThreshold: 75,
    webhookUrl: "",
    micRequired: true,
    camRequired: true,
  };

  return apiSuccess({ settings });
}

// PUT /api/settings
export async function PUT(request: NextRequest) {
  const auth = await verifyAuthToken(request);
  if (!auth) return apiError("Unauthorized", 401);

  const body = await request.json();
  const parsed = SettingsSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  await adminDb.collection("recruiters").doc(auth.uid).set(
    { settings: parsed.data },
    { merge: true }
  );

  return apiSuccess({ settings: parsed.data });
}
