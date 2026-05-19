import { z } from "zod";

// ── Auth ──────────────────────────────────────────────────────────────
export const SignUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const OtpSendSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const OtpVerifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

// ── Rooms ─────────────────────────────────────────────────────────────
export const CandidateSubmitSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.string().min(1, "Role is required"),
  consentGiven: z.literal(true, { message: "Consent is required to proceed" }),
});

// ── Trust ─────────────────────────────────────────────────────────────
export const TrustLogSchema = z.object({
  score: z.number().min(0).max(100),
  reason: z.string().optional(),
});

// ── Alerts ────────────────────────────────────────────────────────────
export const AlertSchema = z.object({
  message: z.string().min(1),
  issuedBy: z.enum(["AI", "INTERVIEWER"]),
});

// ── Settings ──────────────────────────────────────────────────────────
export const SettingsSchema = z.object({
  aiThreshold: z.number().min(0).max(100),
  webhookUrl: z.string().url().optional().or(z.literal("")),
  micRequired: z.boolean(),
  camRequired: z.boolean(),
});
