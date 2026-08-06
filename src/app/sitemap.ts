import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [profiles, storefronts] = await Promise.all([
    prisma.profile.findMany({
      where: { published: true, visibility: "public", deletedAt: null },
      select: {
        username: true,
        updatedAt: true,
        avatar: true,
        ogImage: true,
      },
    }),
    prisma.storefront.findMany({
      where: {
        published: true,
        visibility: "public",
        archived: false,
        deletedAt: null,
      },
      select: {
        slug: true,
        updatedAt: true,
        coverImage: true,
        ogImage: true,
      },
    }),
  ]);

  return [
    {
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/login"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/signup"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/forgot-password"),
      changeFrequency: "monthly",
      priority: 0.2,
    },
    ...profiles.map(
      (profile): MetadataRoute.Sitemap[number] => {
        const images = [profile.ogImage, profile.avatar]
          .filter((image): image is string => Boolean(image))
          .map(absoluteUrl);
        return {
          url: absoluteUrl(`/u/${encodeURIComponent(profile.username)}`),
          lastModified: profile.updatedAt,
          changeFrequency: "weekly",
          priority: 0.7,
          ...(images.length > 0 ? { images } : {}),
        };
      },
    ),
    ...storefronts.map(
      (storefront): MetadataRoute.Sitemap[number] => {
        const images = [storefront.ogImage, storefront.coverImage]
          .filter((image): image is string => Boolean(image))
          .map(absoluteUrl);
        return {
          url: absoluteUrl(`/s/${encodeURIComponent(storefront.slug)}`),
          lastModified: storefront.updatedAt,
          changeFrequency: "weekly",
          priority: 0.7,
          ...(images.length > 0 ? { images } : {}),
        };
      },
    ),
  ];
}
