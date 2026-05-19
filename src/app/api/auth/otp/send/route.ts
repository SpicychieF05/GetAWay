import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { sendOtpEmail } from "@/lib/mailer";
import { OtpSendSchema } from "@/lib/schemas";
import { apiSuccess, apiError, apiValidationError } from "@/lib/api";
import * as crypto from "crypto";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = OtpSendSchema.safeParse(body);
    if (!parsed.success) return apiValidationError(parsed.error);

    const { email } = parsed.data;

    // Generate a 6-digit OTP and hash it for storage
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hash = crypto.createHash("sha256").update(otp).digest("hex");

    // Store in Firestore with 10-minute expiry
    await adminDb.collection("otpCodes").doc(email).set({
      hash,
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000)),
      used: false,
    });

    // Send OTP email
    await sendOtpEmail(email, otp);

    return apiSuccess({ message: "OTP sent to email" });
  } catch (err) {
    console.error("OTP send error:", err);
    return apiError("Failed to send OTP. Please try again.", 500);
  }
}
