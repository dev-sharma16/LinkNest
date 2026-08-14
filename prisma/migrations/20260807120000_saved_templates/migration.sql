-- CreateTable
CREATE TABLE "saved_templates" (
    "id" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "appearance" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "saved_templates_userId_name_type_key" ON "saved_templates"("userId", "name", "type");

-- CreateIndex
CREATE INDEX "saved_templates_userId_type_idx" ON "saved_templates"("userId", "type");

-- AddForeignKey
ALTER TABLE "saved_templates" ADD CONSTRAINT "saved_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
