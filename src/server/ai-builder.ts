import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { generateJSON } from "@/lib/ai/gemini";
import { buildGeneratePrompt, buildRegeneratePrompt } from "@/lib/ai/prompts";
import {
  normalizeDesignSpec,
  validateDesignSpec,
} from "@/lib/ai/design-spec";
import {
  aiGenerateInputSchema,
  aiRegenerateInputSchema,
  type AIDesignSpecification,
} from "@/lib/validations/ai-builder";

// ============================================================
// Generate AI Design
// ============================================================

export async function generateAIDesign(
  userId: string,
  input: unknown,
): Promise<{ id: string; designSpec: AIDesignSpecification }> {
  const parsed = aiGenerateInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const data = parsed.data;

  // Create generation record
  const generation = await prisma.aIGeneration.create({
    data: {
      userId,
      targetType: data.targetType,
      prompt: data.prompt,
      useCase: data.useCase ?? null,
      status: "processing",
      referenceMetadata: {
        referenceUrls: data.referenceUrls ?? [],
        referenceImageUrls: data.referenceImageUrls ?? [],
        links: data.links ?? [],
      } as Prisma.InputJsonValue,
    },
  });

  try {
    const { systemPrompt, userPrompt } = buildGeneratePrompt(data);

    const rawSpec = await generateJSON<AIDesignSpecification>({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
    });

    const normalizedSpec = normalizeDesignSpec(rawSpec);
    const validation = validateDesignSpec(normalizedSpec);

    if (!validation.valid) {
      await prisma.aIGeneration.update({
        where: { id: generation.id },
        data: {
          status: "failed",
          error: `Validation errors: ${validation.errors.join("; ")}`,
        },
      });
      throw new Error(
        `AI output validation failed: ${validation.errors.join("; ")}`,
      );
    }

    await prisma.aIGeneration.update({
      where: { id: generation.id },
      data: {
        status: "completed",
        designSpec: normalizedSpec as Prisma.InputJsonValue,
      },
    });

    return { id: generation.id, designSpec: normalizedSpec };
  } catch (error) {
    await prisma.aIGeneration.update({
      where: { id: generation.id },
      data: {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
    throw error;
  }
}

// ============================================================
// Regenerate AI Design (targeted)
// ============================================================

export async function regenerateAIDesign(
  userId: string,
  input: unknown,
): Promise<{ id: string; designSpec: AIDesignSpecification }> {
  const parsed = aiRegenerateInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const data = parsed.data;

  const generation = await prisma.aIGeneration.create({
    data: {
      userId,
      targetType: data.targetType,
      prompt: data.prompt,
      status: "processing",
      referenceMetadata: {
        operation: data.operation ?? "full_regenerate",
      } as Prisma.InputJsonValue,
    },
  });

  try {
    const { systemPrompt, userPrompt } = buildRegeneratePrompt(data);

    const rawSpec = await generateJSON<AIDesignSpecification>({
      systemPrompt,
      userPrompt,
      temperature: 0.5,
    });

    const normalizedSpec = normalizeDesignSpec(rawSpec);
    const validation = validateDesignSpec(normalizedSpec);

    if (!validation.valid) {
      await prisma.aIGeneration.update({
        where: { id: generation.id },
        data: {
          status: "failed",
          error: `Validation errors: ${validation.errors.join("; ")}`,
        },
      });
      throw new Error(
        `AI output validation failed: ${validation.errors.join("; ")}`,
      );
    }

    await prisma.aIGeneration.update({
      where: { id: generation.id },
      data: {
        status: "completed",
        designSpec: normalizedSpec as Prisma.InputJsonValue,
      },
    });

    return { id: generation.id, designSpec: normalizedSpec };
  } catch (error) {
    await prisma.aIGeneration.update({
      where: { id: generation.id },
      data: {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
    throw error;
  }
}

// ============================================================
// Get Generation Status
// ============================================================

export async function getGeneration(userId: string, id: string) {
  const generation = await prisma.aIGeneration.findFirst({
    where: { id, userId },
  });
  if (!generation) throw new Error("Generation not found");
  return generation;
}

// ============================================================
// Apply AI Design to Bio Page
// ============================================================

export async function applyAIDesignToBio(
  userId: string,
  designSpec: AIDesignSpecification,
) {
  const profile = await prisma.profile.findFirst({
    where: { userId },
  });
  if (!profile) throw new Error("No bio profile found. Create one first.");

  // Merge theme
  if (designSpec.theme) {
    const currentAppearance = (profile.appearance as Record<string, unknown>) ?? {};
    const mergedAppearance = { ...currentAppearance, ...designSpec.theme };
    await prisma.profile.update({
      where: { id: profile.id },
      data: { appearance: mergedAppearance as Prisma.InputJsonValue },
    });
  }

  // Update social links
  if (designSpec.socialLinks?.length) {
    // Remove existing social links
    await prisma.socialLink.deleteMany({
      where: { profileId: profile.id },
    });

    // Add new social links
    await prisma.socialLink.createMany({
      data: designSpec.socialLinks.map((link, i) => ({
        profileId: profile.id,
        userId,
        platform: link.platform,
        url: link.url,
        order: i,
      })),
    });
  }

  // Update blocks
  if (designSpec.blocks?.length) {
    // Remove existing blocks
    await prisma.bioBlock.deleteMany({
      where: { profileId: profile.id },
    });

    // Add new blocks
    await prisma.bioBlock.createMany({
      data: designSpec.blocks.map((block) => ({
        profileId: profile.id,
        userId,
        type: block.type,
        order: block.order ?? 0,
        config: block.config as Prisma.InputJsonValue,
      })),
    });
  }

  // Update profile fields
  if (designSpec.profile) {
    const updateData: Record<string, unknown> = {};
    if (designSpec.profile.displayName) {
      updateData.displayName = designSpec.profile.displayName;
    }
    if (designSpec.profile.bio !== undefined) {
      updateData.bio = designSpec.profile.bio;
    }
    if (designSpec.profile.avatar) {
      updateData.avatar = designSpec.profile.avatar;
    }
    if (Object.keys(updateData).length > 0) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: updateData,
      });
    }
  }

  return profile;
}

// ============================================================
// Apply AI Design to Storefront
// ============================================================

export async function applyAIDesignToStorefront(
  userId: string,
  storefrontId: string,
  designSpec: AIDesignSpecification,
) {
  const storefront = await prisma.storefront.findFirst({
    where: { id: storefrontId, userId },
  });
  if (!storefront) throw new Error("Storefront not found");

  // Merge theme/appearance
  if (designSpec.theme) {
    const currentAppearance = (storefront.appearance as Record<string, unknown>) ?? {};
    const mergedAppearance = { ...currentAppearance, ...designSpec.theme };
    await prisma.storefront.update({
      where: { id: storefront.id },
      data: { appearance: mergedAppearance as Prisma.InputJsonValue },
    });
  }

  // Update storefront details
  if (designSpec.storefront) {
    const updateData: Record<string, unknown> = {};
    if (designSpec.storefront.name) {
      updateData.name = designSpec.storefront.name;
    }
    if (designSpec.storefront.description !== undefined) {
      updateData.description = designSpec.storefront.description;
    }
    if (Object.keys(updateData).length > 0) {
      await prisma.storefront.update({
        where: { id: storefront.id },
        data: updateData,
      });
    }
  }

  // Update products
  if (designSpec.storefront?.products?.length) {
    // Remove existing products
    await prisma.productCard.deleteMany({
      where: { storefrontId: storefront.id },
    });

    // Add new products
    await prisma.productCard.createMany({
      data: designSpec.storefront.products.map((product) => ({
        storefrontId: storefront.id,
        title: product.title,
        description: product.description || null,
        image: product.image || null,
        url: product.url,
        ctaText: product.ctaText || "View Product",
        featured: product.featured ?? false,
        order: product.order ?? 0,
      })),
    });
  }

  return storefront;
}

// ============================================================
// Save AI Design as Preset
// ============================================================

export async function saveAIAsPreset(
  userId: string,
  designSpec: AIDesignSpecification,
  name: string,
  description?: string,
) {
  const { createSavedTemplate } = await import("@/server/saved-templates");

  const type = designSpec.target === "link_in_bio" ? "bio" : "storefront";
  const compatibility = designSpec.target;

  return createSavedTemplate(userId, {
    name,
    description: description ?? designSpec.metadata?.suggestedDescription ?? "",
    type,
    source: "ai",
    compatibility,
    appearance: designSpec.theme ?? {},
  });
}
