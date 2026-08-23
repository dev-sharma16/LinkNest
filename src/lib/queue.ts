import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { env } from "@/lib/env";

export const COMMENT_AUTOMATION_QUEUE = "comment-automation";

export type CommentAutomationJob = {
  automationId: string;
  commentId: string;
  mediaId?: string | null;
  commenterUsername?: string | null;
  commentText?: string | null;
};

let connection: IORedis | null = null;

/** Redis connection reused by the producer and the worker. Null when REDIS_URL is unset. */
export function getQueueConnection(): IORedis | null {
  if (!env.REDIS_URL) return null;
  if (!connection) {
    connection = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
    });
  }
  return connection;
}

let queue: Queue<CommentAutomationJob, unknown, string> | null = null;

export function getCommentAutomationQueue(): Queue<
  CommentAutomationJob,
  unknown,
  string
> | null {
  const conn = getQueueConnection();
  if (!conn) return null;
  if (!queue) {
    queue = new Queue<CommentAutomationJob, unknown, string>(
      COMMENT_AUTOMATION_QUEUE,
      { connection: conn },
    );
  }
  return queue;
}

export function createCommentAutomationWorker(
  handler: (job: CommentAutomationJob) => Promise<void>,
) {
  const conn = getQueueConnection();
  if (!conn) {
    throw new Error(
      "REDIS_URL is not configured. Cannot start the comment automation worker.",
    );
  }
  return new Worker<CommentAutomationJob>(
    COMMENT_AUTOMATION_QUEUE,
    async (job) => {
      await handler(job.data);
    },
    {
      connection: conn,
      concurrency: 5,
    },
  );
}

export { IORedis };