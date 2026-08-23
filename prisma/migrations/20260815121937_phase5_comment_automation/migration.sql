-- CreateTable
CREATE TABLE "social_accounts" (
    "id" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'instagram',
    "platformUserId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "status" TEXT NOT NULL DEFAULT 'connected',
    "email" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "social_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment_automations" (
    "id" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "socialAccountId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "keywords" JSONB NOT NULL,
    "replyMessage" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "cooldownMinutes" INTEGER NOT NULL DEFAULT 60,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "comment_automations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_processed_comments" (
    "id" UUID NOT NULL,
    "automationId" UUID NOT NULL,
    "commentId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "replyId" TEXT,
    "error" TEXT,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_processed_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_events" (
    "id" UUID NOT NULL,
    "automationId" UUID NOT NULL,
    "socialAccountId" UUID,
    "eventType" TEXT NOT NULL,
    "commentId" TEXT,
    "mediaId" TEXT,
    "commenterUsername" TEXT,
    "commentText" TEXT,
    "replyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "social_accounts_userId_idx" ON "social_accounts"("userId");

-- CreateIndex
CREATE INDEX "social_accounts_status_idx" ON "social_accounts"("status");

-- CreateIndex
CREATE INDEX "social_accounts_deletedAt_idx" ON "social_accounts"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "social_accounts_platform_platformUserId_key" ON "social_accounts"("platform", "platformUserId");

-- CreateIndex
CREATE INDEX "comment_automations_userId_idx" ON "comment_automations"("userId");

-- CreateIndex
CREATE INDEX "comment_automations_socialAccountId_idx" ON "comment_automations"("socialAccountId");

-- CreateIndex
CREATE INDEX "comment_automations_status_idx" ON "comment_automations"("status");

-- CreateIndex
CREATE INDEX "comment_automations_deletedAt_idx" ON "comment_automations"("deletedAt");

-- CreateIndex
CREATE INDEX "automation_processed_comments_processedAt_idx" ON "automation_processed_comments"("processedAt");

-- CreateIndex
CREATE UNIQUE INDEX "automation_processed_comments_automationId_commentId_key" ON "automation_processed_comments"("automationId", "commentId");

-- CreateIndex
CREATE INDEX "automation_events_automationId_idx" ON "automation_events"("automationId");

-- CreateIndex
CREATE INDEX "automation_events_socialAccountId_idx" ON "automation_events"("socialAccountId");

-- CreateIndex
CREATE INDEX "automation_events_eventType_idx" ON "automation_events"("eventType");

-- CreateIndex
CREATE INDEX "automation_events_createdAt_idx" ON "automation_events"("createdAt");

-- AddForeignKey
ALTER TABLE "social_accounts" ADD CONSTRAINT "social_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_automations" ADD CONSTRAINT "comment_automations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_automations" ADD CONSTRAINT "comment_automations_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "social_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_processed_comments" ADD CONSTRAINT "automation_processed_comments_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "comment_automations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_events" ADD CONSTRAINT "automation_events_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "comment_automations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
