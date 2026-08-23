import "dotenv/config";
import { createCommentAutomationWorker, type CommentAutomationJob } from "@/lib/queue";
import { processAutomation } from "@/server/automation-engine";
import { env } from "@/lib/env";

const handler = async (job: CommentAutomationJob): Promise<void> => {
  await processAutomation(job);
};

if (!env.REDIS_URL) {
  console.error(
    "REDIS_URL is not configured. Add it to your environment to run the worker.",
  );
  process.exit(1);
}

const worker = createCommentAutomationWorker(handler);

worker.on("ready", () => {
  console.log("Comment automation worker ready.");
});
worker.on("error", (error) => {
  console.error("Comment automation worker error:", error?.message ?? error);
});
worker.on("failed", (_job, error) => {
  console.error("Job failed:", error?.message ?? error);
});

console.log("Starting comment automation worker…");

process.on("SIGTERM", async () => {
  await worker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await worker.close();
  process.exit(0);
});