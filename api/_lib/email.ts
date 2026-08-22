import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * If RESEND_API_KEY isn't configured, this logs instead of sending — lets
 * the rest of the reset flow (token creation, expiry, single-use) be built
 * and tested before an email provider account exists. It never throws, so a
 * misconfigured/missing provider can't break registration or reset requests
 * (which must always look successful to the caller either way, to avoid
 * leaking whether an email is registered).
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  if (!resend) {
    console.warn(`RESEND_API_KEY not set — would have emailed a password reset link to ${to}: ${resetUrl}`);
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "SalaryIQ <onboarding@resend.dev>",
      to,
      subject: "Reset your SalaryIQ password",
      html: `
        <p>Someone requested a password reset for this SalaryIQ account.</p>
        <p><a href="${resetUrl}">Click here to choose a new password</a> (expires in 1 hour).</p>
        <p>If you didn't request this, you can safely ignore this email — your password won't change.</p>
      `,
    });
  } catch (error) {
    // Don't let an email-provider outage surface as a request failure —
    // log it server-side; the user can always ask for another link.
    console.error("Failed to send password reset email:", error);
  }
}
