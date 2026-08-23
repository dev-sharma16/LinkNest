import { prisma } from "@/lib/prisma";
import { getInstagramAdapter } from "@/server/instagram";
import { getCommentAutomationQueue } from "@/lib/queue";
import { processAutomation } from "@/server/automation-engine";
import { getActiveAutomationsForAccount } from "@/server/automations";

export type WebhookDispatchResult = { ok: boolean; delivered: number };

async function resolveAccount(payload: Record<string, unknown>) {
  const explicitId = payload.socialAccountId
    ? String(payload.socialAccountId)
    : null;
  const platformUserId = payload.platformUserId
    ? String(payload.platformUserId)
    : null;

  if (explicitId || platformUserId) {
    return prisma.socialAccount.findFirst({
      where: {
        deletedAt: null,
        status: "connected",
        ...(explicitId ? { id: explicitId } : {}),
        ...(platformUserId ? { platformUserId } : {}),
      },
      select: { id: true },
    });
  }

  // Dev convenience for the simulated adapter: route to the sole connected
  // account when the payload does not self-identify.
  const only = await prisma.socialAccount.findFirst({
    where: {
      deletedAt: null,
      status: "connected",
      automations: { some: { status: "active", deletedAt: null } },
    },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return only;
}

async function enqueueOrProcess(job: {
  automationId: string;
  commentId: string;
  mediaId?: string | null;
  commenterUsername?: string | null;
  commentText?: string | null;
}) {
  const queue = getCommentAutomationQueue();
  if (queue) {
    // Dedupe at the queue level using a per-automation comment key, so webhook
    // retries collapse into a single job before the engine's own guard.
    await queue.add("comment", job, {
      jobId: `${job.automationId}:${job.commentId}`,
      removeOnComplete: true,
      removeOnFail: 1000,
    });
    return;
  }
  // Fallback without Redis: process synchronously so the engine still works.
  await processAutomation(job);
}

export async function dispatchCommentWebhook(
  httpRequest: Request,
): Promise<WebhookDispatchResult> {
  const adapter = getInstagramAdapter();

  const rawBody = await httpRequest.text();
  const signature = httpRequest.headers.get("x-hub-signature-256");
  const verified = adapter.verifyWebhookRequest(rawBody, signature);
  // The simulated adapter always passes; the meta adapter enforces signing.
  if (!verified.valid) {
    return { ok: false, delivered: 0 };
  }

  let payload: unknown;
  try {
    payload = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return { ok: false, delivered: 0 };
  }

  const comment = adapter.normalizeWebhookEvent(payload);
  if (!comment) return { ok: true, delivered: 0 };

  const account = await resolveAccount(
    (payload && typeof payload === "object" ? payload : {}) as Record<
      string,
      unknown
    >,
  );
  if (!account) return { ok: true, delivered: 0 };

  const automations = await getActiveAutomationsForAccount(account.id);

  let delivered = 0;
  for (const automation of automations) {
    await enqueueOrProcess({
      automationId: automation.id,
      commentId: comment.commentId,
      mediaId: comment.mediaId,
      commenterUsername: comment.commenterUsername,
      commentText: comment.commentText,
    });
    delivered += 1;
  }

  return { ok: true, delivered };
}