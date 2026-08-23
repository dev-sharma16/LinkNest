import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import { env } from "@/lib/env";
import type {
  InstagramAdapter,
  NormalizedComment,
  WebhookVerification,
} from "@/server/instagram/index";

/**
 * Meta/Instagram Graph API adapter.
 *
 * This adapter talks to the official Instagram Graph API:
 * - Comment replies: POST /{ig-comment-id}/replies
 * - Comment webhooks: delivered via the Instagram Real-Time / Live Comments topic.
 *
 * NOTE: End-to-end use requires a Meta App that has passed review for the
 * relevant permissions/scopes and an Instagram Business or Creator account
 * linked to a Facebook Page. Until credentials and review are in place this
 * adapter is not exercised; it is kept behind the `INSTAGRAM_ADAPTER=meta`
 * flag so the rest of the automation engine runs untested-free on the
 * simulated adapter.
 */
export class MetaInstagramAdapter implements InstagramAdapter {
  readonly name = "meta";

  verifyWebhookQuery(params: URLSearchParams): WebhookVerification {
    const mode = params.get("hub.mode");
    const token = params.get("hub.verify_token");
    const challenge = params.get("hub.challenge");
    if (
      mode === "subscribe" &&
      token &&
      challenge &&
      token === env.INSTAGRAM_VERIFY_TOKEN
    ) {
      return { valid: true, challenge };
    }
    return { valid: false };
  }

  verifyWebhookRequest(
    rawBody: string,
    signature: string | null,
  ): { valid: boolean } {
    const secret = env.INSTAGRAM_WEBHOOK_SECRET;
    if (!secret || !signature) return { valid: false };
    const expected = signature.startsWith("sha256=")
      ? signature.slice("sha256=".length)
      : signature;
    const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
    const a = Buffer.from(digest);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return { valid: false };
    return { valid: timingSafeEqual(a, b) };
  }

  normalizeWebhookEvent(
    payload: unknown,
  ): NormalizedComment | null {
    if (!payload || typeof payload !== "object") return null;
    const body = payload as {
      object?: string;
      entry?: Array<{
        changes?: Array<{ field?: string; value?: Record<string, unknown> }>;
      }>;
    };
    if (body.object !== "instagram") return null;
    const change = body.entry?.[0]?.changes?.[0];
    if (!change || change.field !== "comments") return null;
    const value = change.value ?? {};
    const commentId =
      (value.id as string) ||
      (value.comment_id as string) ||
      (value.commentId as string);
    if (!commentId) return null;
    const from = value.from as { username?: string; id?: string } | undefined;
    return {
      commentId,
      mediaId: (value.media_id as string) ?? (value.mediaId as string) ?? null,
      commenterUsername: from?.username ?? (value.username as string) ?? null,
      commentText: (value.text as string) ?? (value.commentText as string) ?? null,
    };
  }

  async postCommentReply(
    commentId: string,
    message: string,
    accessToken: string,
  ): Promise<{ id: string }> {
    const params = new URLSearchParams({
      message,
      access_token: accessToken,
    });
    const res = await fetch(
      `https://graph.instagram.com/v21.0/${commentId}/replies`,
      { method: "POST", body: params, cache: "no-store" },
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Instagram reply failed (${res.status}): ${body.slice(0, 200)}`);
    }
    const json = (await res.json()) as { id?: string };
    if (!json.id) throw new Error("Instagram reply returned no id");
    return { id: json.id };
  }
}