import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOtpEmail(to: string, otp: string) {
  await transporter.sendMail({
    from: `"GetAWay" <${process.env.SMTP_USER}>`,
    to,
    subject: "Your GetAWay Password Reset Code",
    text: `Your one-time password reset code is: ${otp}\n\nThis code expires in 10 minutes. Do not share it with anyone.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
        <h1 style="color: #10B981; font-size: 24px; margin-bottom: 8px;">GetAWay</h1>
        <p style="color: #94a3b8; margin-bottom: 24px;">Password Reset Request</p>
        <p style="margin-bottom: 16px;">Use the code below to reset your password. It expires in <strong>10 minutes</strong>.</p>
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #10B981; font-family: monospace;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 13px;">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
      </div>
    `,
  });
}
