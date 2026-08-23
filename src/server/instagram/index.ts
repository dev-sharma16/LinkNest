import { env } from "@/lib/env";
import { SimulatedInstagramAdapter } from "@/server/instagram/simulated";
import { MetaInstagramAdapter } from "@/server/instagram/meta";

export type NormalizedComment = {
  commentId: string;
  mediaId?: string | null;
  commenterUsername?: string | null;
  commentText?: string | null;
};

export type WebhookVerification = {
  valid: boolean;
  challenge?: string;
};

export interface InstagramAdapter {
  readonly name: string;
  /** Handle the Meta `GET` hub.challenge verification handshake. */
  verifyWebhookQuery(params: URLSearchParams): WebhookVerification;
  /** Normalize a webhook payload into a normalized comment or null when irrelevant. */
  normalizeWebhookEvent(
    payload: unknown,
    signature?: string | null,
  ): NormalizedComment | null;
  /** Post a reply to a comment. Returns the platform reply id. */
  postCommentReply(
    commentId: string,
    message: string,
    accessToken: string,
  ): Promise<{ id: string }>;
  /** Verify an incoming webhook request signature/call. */
  verifyWebhookRequest(
    rawBody: string,
    signature: string | null,
  ): { valid: boolean };
}

export function getInstagramAdapter(): InstagramAdapter {
  return env.INSTAGRAM_ADAPTER === "meta"
    ? new MetaInstagramAdapter()
    : new SimulatedInstagramAdapter();
}