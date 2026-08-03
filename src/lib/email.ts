import { env, APP_URL } from "@/lib/env";

type SendEmailParams = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
  if (!env.RESEND_API_KEY) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[email] dev preview -> ${to} :: ${subject}\n${text}`);
    }
    return { ok: true as const, preview: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL ?? "LinkNest <noreply@linknest.dev>",
      to,
      subject,
      text,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[email] send failed", res.status, body);
    return { ok: false as const, error: body };
  }

  return { ok: true as const, preview: false };
}

export function buildVerificationEmail(url: string, name: string) {
  return {
    subject: "Verify your email — LinkNest",
    text: `Hi ${name},\n\nVerify your email to activate your LinkNest account:\n${url}\n\nIf you did not request this, you can safely ignore this email.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Welcome to LinkNest</h2>
        <p>Hi ${name},</p>
        <p>Verify your email address to activate your account.</p>
        <p><a href="${url}" style="background:#18181b;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;display:inline-block">Verify email</a></p>
        <p style="color:#71717a;font-size:12px">Or open: ${url}</p>
      </div>`,
  };
}

export function buildPasswordResetEmail(url: string, name: string) {
  return {
    subject: "Reset your password — LinkNest",
    text: `Hi ${name},\n\nReset your LinkNest password here:\n${url}\n\nIf you did not request this, you can safely ignore this email.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Reset your password</h2>
        <p>Hi ${name},</p>
        <p><a href="${url}" style="background:#18181b;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;display:inline-block">Reset password</a></p>
        <p style="color:#71717a;font-size:12px">Or open: ${url}</p>
      </div>`,
  };
}

export { APP_URL };
