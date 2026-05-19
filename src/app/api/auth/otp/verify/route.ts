import { NextRequest } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { ResetPasswordSchema } from "@/lib/schemas";
import { apiSuccess, apiError, apiValidationError } from "@/lib/api";
import * as crypto from "crypto";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ResetPasswordSchema.safeParse(body);
    if (!parsed.success) return apiValidationError(parsed.error);

    const { email, otp, newPassword } = parsed.data;

    // Fetch the stored OTP record
    const otpDoc = await adminDb.collection("otpCodes").doc(email).get();
    if (!otpDoc.exists) return apiError("No OTP found for this email", 404);

    const { hash, expiresAt, used } = otpDoc.data()!;

    // Check if already used
    if (used) return apiError("This OTP has already been used", 400);

    // Check expiry
    const expiry = (expiresAt as Timestamp).toDate();
    if (new Date() > expiry) return apiError("OTP has expired. Please request a new one.", 400);

    // Verify hash
    const inputHash = crypto.createHash("sha256").update(otp).digest("hex");
    if (inputHash !== hash) return apiError("Invalid OTP code", 400);

    // Mark OTP as used
    await adminDb.collection("otpCodes").doc(email).update({ used: true });

    // Get user by email and update their password
    const user = await adminAuth.getUserByEmail(email);
    await adminAuth.updateUser(user.uid, { password: newPassword });

    // Generate a custom token so the client can sign in immediately
    const customToken = await adminAuth.createCustomToken(user.uid);

    return apiSuccess({ customToken, message: "Password reset successful" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("There is no user record")) {
      return apiError("No account found with this email address", 404);
    }
    console.error("OTP verify error:", err);
    return apiError("Verification failed. Please try again.", 500);
  }
}
