import { getInstagramAdapter } from "@/server/instagram";
import { dispatchCommentWebhook } from "@/server/automation-webhook";

export async function GET(request: Request) {
  const adapter = getInstagramAdapter();
  const params = new URL(request.url).searchParams;
  const verification = adapter.verifyWebhookQuery(params);
  if (!verification.valid) {
    return new Response("Verification failed", { status: 403 });
  }
  return new Response(verification.challenge ?? "ok", { status: 200 });
}

export async function POST(request: Request) {
  try {
    const result = await dispatchCommentWebhook(request);
    if (!result.ok) {
      return Response.json({ error: "Invalid webhook" }, { status: 400 });
    }
    return Response.json({ ok: true, delivered: result.delivered });
  } catch {
    return Response.json({ error: "Processing failed" }, { status: 500 });
  }
}