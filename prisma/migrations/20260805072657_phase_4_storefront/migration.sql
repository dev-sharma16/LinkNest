-- CreateTable
CREATE TABLE "storefronts" (
    "id" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "bannerImage" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImage" TEXT,
    "appearance" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "storefronts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_cards" (
    "id" UUID NOT NULL,
    "storefrontId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "url" TEXT NOT NULL,
    "ctaText" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "product_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storefront_events" (
    "id" UUID NOT NULL,
    "storefrontId" UUID NOT NULL,
    "productId" UUID,
    "eventType" TEXT NOT NULL,
    "ipHash" TEXT,
    "country" TEXT,
    "city" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "device" TEXT,
    "referrer" TEXT,
    "language" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "storefront_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "storefronts_slug_key" ON "storefronts"("slug");

-- CreateIndex
CREATE INDEX "storefronts_userId_idx" ON "storefronts"("userId");

-- CreateIndex
CREATE INDEX "storefronts_visibility_idx" ON "storefronts"("visibility");

-- CreateIndex
CREATE INDEX "storefronts_published_idx" ON "storefronts"("published");

-- CreateIndex
CREATE INDEX "storefronts_archived_idx" ON "storefronts"("archived");

-- CreateIndex
CREATE INDEX "storefronts_deletedAt_idx" ON "storefronts"("deletedAt");

-- CreateIndex
CREATE INDEX "product_cards_storefrontId_order_idx" ON "product_cards"("storefrontId", "order");

-- CreateIndex
CREATE INDEX "product_cards_featured_idx" ON "product_cards"("featured");

-- CreateIndex
CREATE INDEX "product_cards_deletedAt_idx" ON "product_cards"("deletedAt");

-- CreateIndex
CREATE INDEX "storefront_events_storefrontId_idx" ON "storefront_events"("storefrontId");

-- CreateIndex
CREATE INDEX "storefront_events_productId_idx" ON "storefront_events"("productId");

-- CreateIndex
CREATE INDEX "storefront_events_eventType_idx" ON "storefront_events"("eventType");

-- CreateIndex
CREATE INDEX "storefront_events_createdAt_idx" ON "storefront_events"("createdAt");

-- AddForeignKey
ALTER TABLE "storefronts" ADD CONSTRAINT "storefronts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_cards" ADD CONSTRAINT "product_cards_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES "storefronts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storefront_events" ADD CONSTRAINT "storefront_events_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES "storefronts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storefront_events" ADD CONSTRAINT "storefront_events_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product_cards"("id") ON DELETE SET NULL ON UPDATE CASCADE;
