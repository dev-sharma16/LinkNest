import { prisma } from "@/lib/prisma";
import { getInstagramAdapter } from "@/server/instagram";
import type { CommentAutomationJob } from "@/lib/queue";

/** Post-level cap on automated replies within the cooldown window. */
const PER_POST_REPLY_CAP = 6;

export type TriggerContext = {
  commentText?: string | null;
  keywords: string[];
};

/** Swappable trigger evaluator — the AI-ready decision boundary. */
export type TriggerEvaluator = (ctx: TriggerContext) => boolean;

/**
 * Deterministic, case-insensitive keyword matching.
 * A comment matches when any configured keyword appears anywhere in the text,
 * so variations like "link", "LINK", "link please" and "send link" all match.
 */
export const keywordTrigger: TriggerEvaluator = ({ commentText, keywords }) => {
  if (!commentText) return false;
  const text = commentText.toLowerCase();
  return keywords.some((k) => {
    const kw = k.trim().toLowerCase();
    return kw.length > 0 && text.includes(kw);
  });
};

export function buildReplyMessage(message: string, url: string): string {
  const trimmed = message.trim();
  return trimmed ? `${trimmed}\n\n${url}` : url;
}

export async function processAutomation(job: CommentAutomationJob): Promise<void> {
  const { automationId, commentId } = job;

  try {
    const automation = await prisma.commentAutomation.findFirst({
      where: { id: automationId, deletedAt: null },
      include: { socialAccount: true },
    });
    if (!automation || automation.socialAccount.deletedAt) return;
    if (automation.status !== "active") return;

    // Atomic idempotency claim. The unique (automationId, commentId) constraint
    // guarantees the same comment is only ever processed once, even across
    // concurrent webhook retries.
    const claimed = await prisma.automationProcessedComment
      .create({
        data: { automationId, commentId, status: "processing" },
      })
      .catch(() => null);
    if (!claimed) return;

    const keywords = (automation.keywords as string[]) || [];

    await prisma.automationEvent.create({
      data: {
        automationId,
        socialAccountId: automation.socialAccountId,
        eventType: "comment_received",
        commentId,
        mediaId: job.mediaId ?? null,
        commenterUsername: job.commenterUsername ?? null,
        commentText: job.commentText ?? null,
      },
    });

    if (!keywordTrigger({ commentText: job.commentText, keywords })) {
      await prisma.automationProcessedComment.update({
        where: { id: claimed.id },
        data: { status: "ignored" },
      });
      return;
    }

    await prisma.automationEvent.create({
      data: {
        automationId,
        socialAccountId: automation.socialAccountId,
        eventType: "keyword_matched",
        commentId,
        mediaId: job.mediaId ?? null,
        commenterUsername: job.commenterUsername ?? null,
        commentText: job.commentText ?? null,
      },
    });

    // Rate limit: do not reply to the same user more than once for the same
    // post within the cooldown window, and cap replies per post.
    const cooldownMs = automation.cooldownMinutes * 60 * 1000;
    const since = new Date(Date.now() - cooldownMs);
    const repliesInWindow = await prisma.automationEvent.findMany({
      where: {
        automationId,
        eventType: "reply_successful",
        ...(job.mediaId ? { mediaId: job.mediaId } : {}),
        createdAt: { gte: since },
      },
      select: { commenterUsername: true },
    });

    const sameUser = job.commenterUsername
      ? repliesInWindow.some(
          (r) => r.commenterUsername === job.commenterUsername,
        )
      : false;

    if (sameUser || repliesInWindow.length >= PER_POST_REPLY_CAP) {
      await prisma.automationProcessedComment.update({
        where: { id: claimed.id },
        data: { status: "rate_limited" },
      });
      await prisma.automationEvent.create({
        data: {
          automationId,
          socialAccountId: automation.socialAccountId,
          eventType: "rate_limited",
          commentId,
          mediaId: job.mediaId ?? null,
          commenterUsername: job.commenterUsername ?? null,
        },
      });
      await prisma.commentAutomation.update({
        where: { id: automationId },
        data: { status: "paused" },
      });
      return;
    }

    await prisma.automationEvent.create({
      data: {
        automationId,
        socialAccountId: automation.socialAccountId,
        eventType: "reply_attempted",
        commentId,
        mediaId: job.mediaId ?? null,
        commenterUsername: job.commenterUsername ?? null,
      },
    });

    const replyMessage = buildReplyMessage(
      automation.replyMessage,
      automation.url,
    );
    const adapter = getInstagramAdapter();

    try {
      const { id: replyId } = await adapter.postCommentReply(
        commentId,
        replyMessage,
        automation.socialAccount.accessToken,
      );
      await prisma.automationProcessedComment.update({
        where: { id: claimed.id },
        data: { status: "replied", replyId },
      });
      await prisma.automationEvent.create({
        data: {
          automationId,
          socialAccountId: automation.socialAccountId,
          eventType: "reply_successful",
          commentId,
          mediaId: job.mediaId ?? null,
          commenterUsername: job.commenterUsername ?? null,
          replyId,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Reply failed";
      await prisma.automationProcessedComment.update({
        where: { id: claimed.id },
        data: { status: "error", error: message },
      });
      await prisma.automationEvent.create({
        data: {
          automationId,
          socialAccountId: automation.socialAccountId,
          eventType: "reply_failed",
          commentId,
          mediaId: job.mediaId ?? null,
          commenterUsername: job.commenterUsername ?? null,
        },
      });
      await prisma.commentAutomation.update({
        where: { id: automationId },
        data: { status: "error" },
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Processing failed";
    await prisma.automationEvent
      .create({
        data: {
          automationId,
          eventType: "error",
          commentId,
          mediaId: job.mediaId ?? null,
          commenterUsername: job.commenterUsername ?? null,
          commentText: message,
        },
      })
      .catch(() => undefined);
  }
}