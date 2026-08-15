import { env } from "@/lib/env";
import type {
  InstagramAdapter,
  NormalizedComment,
  WebhookVerification,
} from "@/server/instagram/index";

/**
 * Simulated Instagram adapter used for development and tests.
 *
 * It lets the full automation engine (webhook → queue → engine → reply →
 * activity/analytics) run end-to-end without Meta credentials. Webhook
 * events are accepted in a simple JSON shape:
 *
 *   {
 *     "desired": "reply",
 *     "commentId": "...",
 *     "mediaId": "...",
 *     "commenterUsername": "...",
 *     "commentText": "link please"
 *   }
 *
 * Replies are recorded with a deterministic simulated id rather than calling
 * an external API.
 */
export class SimulatedInstagramAdapter implements InstagramAdapter {
  readonly name = "simulated";

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

  verifyWebhookRequest(): { valid: boolean } {
    return { valid: true };
  }

  normalizeWebhookEvent(payload: unknown): NormalizedComment | null {
    if (!payload || typeof payload !== "object") return null;
    const body = payload as {
      commentId?: unknown;
      mediaId?: unknown;
      commenterUsername?: unknown;
      commentText?: unknown;
    };
    const commentId = String(body.commentId ?? "");
    if (!commentId) return null;
    return {
      commentId,
      mediaId: body.mediaId ? String(body.mediaId) : null,
      commenterUsername: body.commenterUsername
        ? String(body.commenterUsername)
        : null,
      commentText: body.commentText ? String(body.commentText) : null,
    };
  }

  async postCommentReply(
    commentId: string,
  ): Promise<{ id: string }> {
    return { id: `sim-reply-${commentId}` };
  }
}