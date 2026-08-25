import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai";
import { aiBioOutputSchema, aiStorefrontOutputSchema } from "@/lib/ai/schemas";
import { validateAIOutput } from "@/lib/ai/validate";
import { trackGeneration } from "@/lib/ai/costs";
import {
  createBioDesignSpec,
  createStorefrontDesignSpec,
  bioToDesignSpec,
  storefrontToDesignSpec,
} from "@/lib/ai/design-spec";
import { classifyURL } from "@/lib/ai/url-classifier";
import { extractDesignFromURL } from "@/lib/ai/reference-extractor";
import { updateGeneration } from "@/server/ai";
import { normalizeBlockConfig } from "@/lib/bio-blocks";
import { DEFAULT_THEME } from "@/lib/bio-themes";
import { STOREFRONT_DEFAULT_THEME } from "@/lib/storefront-themes";
import type { AIGenerationTargetType } from "@/lib/ai/types";

type BioGenerationContext = {
  existingProfile?: {
    displayName?: string;
    bio?: string;
    avatar?: string;
    location?: string;
    website?: string;
    appearance?: unknown;
  };
  existingBlocks: Array<{ type: string; config?: unknown; order: number; hidden: boolean }>;
  existingSocials: Array<{ platform: string; url: string }>;
};

type StorefrontGenerationContext = {
  existingStorefront?: {
    name?: string;
    description?: string;
    coverImage?: string;
    bannerImage?: string;
    appearance?: unknown;
  };
  existingProducts: Array<{
    title: string;
    description?: string;
    image?: string;
    url: string;
    ctaText?: string;
    featured?: boolean;
    order: number;
  }>;
};

export async function buildBioContext(userId: string): Promise<BioGenerationContext> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: {
      displayName: true,
      bio: true,
      avatar: true,
      location: true,
      website: true,
      appearance: true,
    },
  });

  const blocks = await prisma.bioBlock.findMany({
    where: { profile: { userId }, deletedAt: null },
    select: { type: true, config: true, order: true, hidden: true },
    orderBy: { order: "asc" },
  });

  const socials = await prisma.socialLink.findMany({
    where: { profile: { userId } },
    select: { platform: true, url: true },
    orderBy: { order: "asc" },
  });

  return {
    existingProfile: profile
      ? {
          displayName: profile.displayName ?? undefined,
          bio: profile.bio ?? undefined,
          avatar: profile.avatar ?? undefined,
          location: profile.location ?? undefined,
          website: profile.website ?? undefined,
          appearance: profile.appearance ?? undefined,
        }
      : undefined,
    existingBlocks: blocks.map((b) => ({
      type: b.type,
      config: (b.config as Record<string, unknown>) ?? {},
      order: b.order,
      hidden: b.hidden,
    })),
    existingSocials: socials,
  };
}

export async function buildStorefrontContext(userId: string): Promise<StorefrontGenerationContext> {
  const storefront = await prisma.storefront.findFirst({
    where: { userId, deletedAt: null },
    select: {
      name: true,
      description: true,
      coverImage: true,
      bannerImage: true,
      appearance: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const products = storefront
    ? await prisma.productCard.findMany({
        where: { storefront: { userId }, deletedAt: null },
        select: {
          title: true,
          description: true,
          image: true,
          url: true,
          ctaText: true,
          featured: true,
          order: true,
        },
        orderBy: { order: "asc" },
      })
    : [];

  return {
    existingStorefront: storefront
      ? {
          name: storefront.name ?? undefined,
          description: storefront.description ?? undefined,
          coverImage: storefront.coverImage ?? undefined,
          bannerImage: storefront.bannerImage ?? undefined,
          appearance: storefront.appearance ?? undefined,
        }
      : undefined,
    existingProducts: products.map((p) => ({
      title: p.title,
      description: p.description ?? undefined,
      image: p.image ?? undefined,
      url: p.url,
      ctaText: p.ctaText ?? undefined,
      featured: p.featured,
      order: p.order,
    })),
  };
}

function buildBioSystemInstruction(): string {
  return `You are a LinkNest AI page builder. Generate Link-in-Bio pages as structured JSON.

Available block types: button, link, text, heading, divider, spacer, image, gallery, video, audio, youtube, spotify, tiktok, instagram, twitter, twitch, vimeo, maps, custom_embed, contact_form, newsletter, html, file_download, pdf_viewer, storefront.

Block config examples:
- button: { "label": "Click me", "url": "https://...", "style": "solid" }
- link: { "label": "My link", "url": "https://..." }
- text: { "content": "Some text here" }
- heading: { "content": "Section Title", "level": "h2" }
- image: { "src": "https://...", "alt": "Description", "caption": "" }
- youtube: { "url": "https://youtube.com/watch?v=..." }
- instagram: { "url": "https://instagram.com/p/..." }
- contact_form: { "title": "Contact me", "success": "Thanks!" }
- newsletter: { "title": "Join my newsletter", "success": "Subscribed!" }
- divider: { "color": "" }
- spacer: { "height": 16 }

Social platforms: instagram, twitter, youtube, tiktok, linkedin, facebook, github, twitch, discord, spotify, pinterest, snapchat, threads, custom.

Theme fields: themeName (light/dark), primaryColor, secondaryColor, accentColor, textColor, backgroundColor, buttonBackground, buttonText, fontFamily, fontSize, fontWeight, backgroundType (solid/gradient/image), gradientFrom, gradientTo, buttonStyle (solid/outline/ghost), buttonRadius, cardStyle (flat/outlined/shadow), blockSpacing, alignment (left/center/right).

Generate original, professional designs. Never invent product URLs. Use only real URLs provided by the user.`;
}

function buildStorefrontSystemInstruction(): string {
  return `You are a LinkNest AI storefront builder. Generate storefronts as structured JSON.

Generate storefronts with:
- Title, description, cover/banner images
- Product cards with title, description, image, URL, CTA text, featured flag
- Theme and layout settings

Theme extends bio theme with: layout (grid/list), cardRadius, cardShadow (none/sm/md/lg), productSpacing.

Never invent product URLs or images. Only use URLs provided by the user.
Generate professional, clean storefront designs.`;
}

function buildBioPrompt(
  userPrompt: string,
  context: BioGenerationContext,
  referenceDesign?: Record<string, unknown>,
): string {
  let prompt = `Generate a Link-in-Bio page based on this request:\n\n"${userPrompt}"\n\n`;

  if (context.existingProfile) {
    prompt += `Existing profile:\n${JSON.stringify(context.existingProfile, null, 2)}\n\n`;
  }

  if (context.existingBlocks.length > 0) {
    prompt += `Existing blocks:\n${JSON.stringify(context.existingBlocks, null, 2)}\n\n`;
  }

  if (context.existingSocials.length > 0) {
    prompt += `Existing social links:\n${JSON.stringify(context.existingSocials, null, 2)}\n\n`;
  }

  if (referenceDesign) {
    prompt += `Design characteristics from reference:\n${JSON.stringify(referenceDesign, null, 2)}\n\n`;
  }

  prompt += `Respond with a JSON object containing: profile, socialLinks, blocks, theme.`;

  return prompt;
}

function buildStorefrontPrompt(
  userPrompt: string,
  context: StorefrontGenerationContext,
  referenceDesign?: Record<string, unknown>,
): string {
  let prompt = `Generate a storefront based on this request:\n\n"${userPrompt}"\n\n`;

  if (context.existingStorefront) {
    prompt += `Existing storefront:\n${JSON.stringify(context.existingStorefront, null, 2)}\n\n`;
  }

  if (context.existingProducts.length > 0) {
    prompt += `Existing products:\n${JSON.stringify(context.existingProducts, null, 2)}\n\n`;
  }

  if (referenceDesign) {
    prompt += `Design characteristics from reference:\n${JSON.stringify(referenceDesign, null, 2)}\n\n`;
  }

  prompt += `Respond with a JSON object containing: storefront, products, theme.`;

  return prompt;
}

export async function generateBioPage(
  userId: string,
  generationId: string,
  input: {
    prompt: string;
    useCase?: string;
    referenceURLs?: string[];
    referenceImages?: string[];
  },
) {
  await updateGeneration(userId, generationId, { status: "processing" });

  try {
    const context = await buildBioContext(userId);

    let referenceDesign: Record<string, unknown> | undefined;
    if (input.referenceURLs && input.referenceURLs.length > 0) {
      const characteristics = await extractDesignFromURL(input.referenceURLs[0]);
      referenceDesign = characteristics as unknown as Record<string, unknown>;
    }

    const provider = getAIProvider();
    const systemInstruction = buildBioSystemInstruction();
    const prompt = buildBioPrompt(input.prompt, context, referenceDesign);

    const result = await provider.generateStructured({
      prompt,
      systemInstruction,
      schema: aiBioOutputSchema,
      temperature: 0.7,
    });

    const validation = validateAIOutput(aiBioOutputSchema, result.data);
    if (!validation.success) {
      throw new Error(`Invalid AI output: ${validation.error}`);
    }

    const output = validation.data;
    const costInfo = trackGeneration({
      provider: "gemini",
      model: "gemini-2.5-flash",
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
    });

    const designSpec = createBioDesignSpec({
      theme: output.theme as Partial<typeof DEFAULT_THEME>,
      components: (output.blocks ?? []).map((b, i) => ({
        type: b.type as import("@/lib/validations/bio").BlockType,
        config: b.config,
        order: b.order ?? i,
        hidden: false,
      })),
    });

    await updateGeneration(userId, generationId, {
      status: "completed",
      designSpec: designSpec as unknown as Prisma.InputJsonValue,
      result: output as unknown as Prisma.InputJsonValue,
      provider: costInfo.provider,
      model: costInfo.model,
      inputTokens: costInfo.inputTokens,
      outputTokens: costInfo.outputTokens,
      estimatedCost: costInfo.estimatedCost,
    });

    return { generationId, result: output, designSpec };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    await updateGeneration(userId, generationId, {
      status: "failed",
      error: message,
    });
    throw error;
  }
}

export async function generateStorefront(
  userId: string,
  generationId: string,
  input: {
    prompt: string;
    useCase?: string;
    referenceURLs?: string[];
    referenceImages?: string[];
  },
) {
  await updateGeneration(userId, generationId, { status: "processing" });

  try {
    const context = await buildStorefrontContext(userId);

    let referenceDesign: Record<string, unknown> | undefined;
    if (input.referenceURLs && input.referenceURLs.length > 0) {
      const characteristics = await extractDesignFromURL(input.referenceURLs[0]);
      referenceDesign = characteristics as unknown as Record<string, unknown>;
    }

    const provider = getAIProvider();
    const systemInstruction = buildStorefrontSystemInstruction();
    const prompt = buildStorefrontPrompt(input.prompt, context, referenceDesign);

    const result = await provider.generateStructured({
      prompt,
      systemInstruction,
      schema: aiStorefrontOutputSchema,
      temperature: 0.7,
    });

    const validation = validateAIOutput(aiStorefrontOutputSchema, result.data);
    if (!validation.success) {
      throw new Error(`Invalid AI output: ${validation.error}`);
    }

    const output = validation.data;
    const costInfo = trackGeneration({
      provider: "gemini",
      model: "gemini-2.5-flash",
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
    });

    const designSpec = createStorefrontDesignSpec({
      theme: output.theme as Partial<typeof STOREFRONT_DEFAULT_THEME>,
      components: (output.products ?? []).map((p, i) => ({
        type: "storefront" as import("@/lib/validations/bio").BlockType,
        config: {
          title: p.title,
          description: p.description,
          image: p.image,
          url: p.url,
          ctaText: p.ctaText,
          featured: p.featured,
        },
        order: i,
        hidden: false,
      })),
    });

    await updateGeneration(userId, generationId, {
      status: "completed",
      designSpec: designSpec as unknown as Prisma.InputJsonValue,
      result: output as unknown as Prisma.InputJsonValue,
      provider: costInfo.provider,
      model: costInfo.model,
      inputTokens: costInfo.inputTokens,
      outputTokens: costInfo.outputTokens,
      estimatedCost: costInfo.estimatedCost,
    });

    return { generationId, result: output, designSpec };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    await updateGeneration(userId, generationId, {
      status: "failed",
      error: message,
    });
    throw error;
  }
}

export async function applyGeneration(
  userId: string,
  generationId: string,
  targetType: AIGenerationTargetType,
) {
  const generation = await prisma.aIGeneration.findFirst({
    where: { id: generationId, userId, status: "completed" },
  });

  if (!generation) {
    throw new Error("Generation not found or not completed");
  }

  const result = generation.result as Record<string, unknown> | null;
  if (!result) {
    throw new Error("Generation has no result data");
  }

  if (targetType === "bio") {
    return applyBioGeneration(userId, result);
  }

  return applyStorefrontGeneration(userId, result);
}

async function applyBioGeneration(
  userId: string,
  result: Record<string, unknown>,
) {
  const profileData = result.profile as Record<string, unknown> | undefined;
  const socialLinksData = result.socialLinks;
  const blocksData = result.blocks;
  const themeData = result.theme;

  const socialLinks: Array<{ platform: string; url: string }> = Array.isArray(socialLinksData)
    ? (socialLinksData as Array<{ platform: string; url: string }>)
    : [];
  const blocks: Array<{ type: string; config: Record<string, unknown>; order: number }> = Array.isArray(blocksData)
    ? (blocksData as Array<{ type: string; config: Record<string, unknown>; order: number }>)
    : [];
  const theme: Record<string, unknown> = (themeData as Record<string, unknown>) ?? {};

  const profile = await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      username: `user-${userId.slice(0, 8)}`,
      displayName: (profileData?.displayName as string) ?? "My Page",
      bio: (profileData?.bio as string) ?? null,
      avatar: (profileData?.avatar as string) ?? null,
      location: (profileData?.location as string) ?? null,
      website: (profileData?.website as string) ?? null,
      appearance: theme as Prisma.InputJsonValue,
    },
    update: {
      displayName: (profileData?.displayName as string) ?? undefined,
      bio: (profileData?.bio as string) ?? undefined,
      avatar: (profileData?.avatar as string) ?? undefined,
      location: (profileData?.location as string) ?? undefined,
      website: (profileData?.website as string) ?? undefined,
      appearance: theme as Prisma.InputJsonValue,
    },
  });

  await prisma.socialLink.deleteMany({ where: { profileId: profile.id } });
  if (socialLinks.length > 0) {
    await prisma.socialLink.createMany({
      data: socialLinks.map((s, i) => ({
        profileId: profile.id,
        platform: s.platform,
        url: s.url,
        order: i,
      })),
    });
  }

  await prisma.bioBlock.deleteMany({ where: { profileId: profile.id, deletedAt: null } });
  if (blocks.length > 0) {
    await prisma.bioBlock.createMany({
      data: blocks.map((b, i) => ({
        profileId: profile.id,
        type: b.type,
        config: normalizeBlockConfig(b.type as import("@/lib/validations/bio").BlockType, b.config) as Prisma.InputJsonValue,
        order: b.order ?? i,
      })),
    });
  }

  return { profileId: profile.id };
}

async function applyStorefrontGeneration(
  userId: string,
  result: Record<string, unknown>,
) {
  const storefrontData = result.storefront as Record<string, unknown> | undefined;
  const productsData = result.products;
  const products: Array<{
    title: string;
    description?: string;
    image?: string;
    url: string;
    ctaText?: string;
    featured?: boolean;
  }> = Array.isArray(productsData)
    ? (productsData as Array<{
        title: string;
        description?: string;
        image?: string;
        url: string;
        ctaText?: string;
        featured?: boolean;
      }>)
    : [];
  const themeData = result.theme;
  const theme: Record<string, unknown> = (themeData as Record<string, unknown>) ?? {};

  const slug = slugify((storefrontData?.name as string) ?? "storefront");

  const storefront = await prisma.storefront.create({
    data: {
      userId,
      name: (storefrontData?.name as string) ?? "My Storefront",
      slug,
      description: (storefrontData?.description as string) ?? null,
      coverImage: (storefrontData?.coverImage as string) ?? null,
      bannerImage: (storefrontData?.bannerImage as string) ?? null,
      appearance: theme as Prisma.InputJsonValue,
    },
  });

  if (products.length > 0) {
    await prisma.productCard.createMany({
      data: products.map((p, i) => ({
        storefrontId: storefront.id,
        title: p.title,
        description: p.description ?? null,
        image: p.image ?? null,
        url: p.url,
        ctaText: p.ctaText ?? null,
        featured: p.featured ?? false,
        order: i,
      })),
    });
  }

  return { storefrontId: storefront.id };
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}
