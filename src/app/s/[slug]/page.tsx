import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { toStorefrontTheme, storefrontVars } from "@/lib/storefront-css";
import { StorefrontViewTracker } from "@/components/storefronts/public/view-tracker";
import { ClickableProduct } from "@/components/storefronts/public/clickable-product";
import { JsonLd } from "@/components/seo/json-ld";
import {
  absoluteUrl,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  siteMetadata,
  truncate,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

// Shared by generateMetadata, generateViewport and the page so the
// storefront is only fetched once per request.
const getPublicStorefront = cache((slug: string) =>
  prisma.storefront.findFirst({
    where: {
      slug,
      published: true,
      visibility: "public",
      archived: false,
      deletedAt: null,
    },
    include: {
      products: {
        where: { deletedAt: null },
        orderBy: [{ featured: "desc" }, { order: "asc" }],
        select: {
          id: true,
          title: true,
          description: true,
          image: true,
          url: true,
          ctaText: true,
          featured: true,
          order: true,
        },
      },
    },
  }),
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const storefront = await getPublicStorefront(slug);
  if (!storefront) return { title: "Storefront not found" };

  const title = storefront.seoTitle || storefront.name;
  const description = truncate(
    storefront.seoDescription ||
      storefront.description ||
      `${storefront.name} on ${SITE_NAME}`,
  );
  const url = absoluteUrl(`/s/${encodeURIComponent(storefront.slug)}`);
  const images = [
    storefront.ogImage || storefront.coverImage || DEFAULT_OG_IMAGE,
  ].filter(Boolean) as string[];

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      ...siteMetadata.openGraph,
      type: "website",
      url,
      title,
      description,
      images,
    },
    twitter: {
      ...siteMetadata.twitter,
      title,
      description,
      images,
    },
  };
}

export async function generateViewport({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Viewport> {
  const { slug } = await params;
  const storefront = await getPublicStorefront(slug);
  if (!storefront) return {};
  const theme = toStorefrontTheme(
    storefront.appearance as Record<string, unknown> | null,
  );
  return { themeColor: theme.backgroundColor };
}

export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const storefront = await getPublicStorefront(slug);
  if (!storefront) notFound();

  const appearance = (storefront.appearance ?? {}) as Record<string, unknown> | null;
  const theme = toStorefrontTheme(appearance);
  const isList = theme.layout === "list";

  return (
    <main style={storefrontVars(theme)} className="min-h-dvh text-foreground">
      <StorefrontViewTracker slug={storefront.slug} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Store",
          name: storefront.name,
          url: absoluteUrl(`/s/${encodeURIComponent(storefront.slug)}`),
          description: storefront.description ?? undefined,
          image: storefront.coverImage
            ? absoluteUrl(storefront.coverImage)
            : undefined,
        }}
      />
      {storefront.products.length > 0 ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `${storefront.name} products`,
            itemListElement: storefront.products.map((product, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Product",
                name: product.title,
                description: product.description ?? undefined,
                image: product.image ? absoluteUrl(product.image) : undefined,
              },
            })),
          }}
        />
      ) : null}

      {storefront.bannerImage ? (
        <div className="h-44 w-full sm:h-56">
          <img
            src={storefront.bannerImage}
            alt=""
            className="h-full w-full object-cover"
            width={1200}
            height={224}
          />
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <header style={{ textAlign: theme.alignment }}>
          {storefront.coverImage ? (
            <img
              src={storefront.coverImage}
              alt={storefront.name}
              width={96}
              height={96}
              className="mx-auto rounded-2xl border object-cover shadow-sm"
            />
          ) : null}
          <h1
            className="mt-4 text-3xl font-bold tracking-tight"
            style={{ fontSize: "calc(var(--sf-font-size) + 10px)" }}
          >
            {storefront.name}
          </h1>
          {storefront.description ? (
            <p className="mx-auto mt-2 max-w-xl text-base opacity-80">
              {storefront.description}
            </p>
          ) : null}
        </header>

        {storefront.products.length > 0 ? (
          <div
            className={
              isList
                ? "mt-10 grid gap-(--sf-spacing)"
                : "mt-10 grid gap-(--sf-spacing) sm:grid-cols-2 lg:grid-cols-3"
            }
          >
            {storefront.products.map((product) => (
              <ProductView
                key={product.id}
                slug={storefront.slug}
                product={product}
                theme={theme}
                list={isList}
              />
            ))}
          </div>
        ) : (
          <p className="mt-16 text-center text-sm opacity-60">
            This storefront has no products yet.
          </p>
        )}

        <footer className="mt-14 text-center text-xs opacity-40">
          Made with LinkNest
        </footer>
      </div>
    </main>
  );
}

function ProductView({
  slug,
  product,
  theme,
  list,
}: {
  slug: string;
  product: {
    id: string;
    title: string;
    description: string | null;
    image: string | null;
    url: string;
    ctaText: string | null;
    featured: boolean;
    order: number;
  };
  theme: ReturnType<typeof toStorefrontTheme>;
  list: boolean;
}) {
  const cardClass = `flex h-full flex-col overflow-hidden rounded-[--sf-card-radius] bg-card ring-1 ring-foreground/10 ${
    list ? "sm:flex-row" : ""
  }`;
  const shadow = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  }[theme.cardShadow];

  const ctaText = product.ctaText || "Visit website";

  return (
    <div className={`${cardClass} ${shadow}`}>
      {product.image ? (
        <img
          src={product.image}
          alt={product.title}
          className={list ? "h-40 w-full object-cover sm:h-auto sm:w-48 sm:shrink-0" : "h-40 w-full object-cover"}
          width={400}
          height={160}
          loading="lazy"
        />
      ) : null}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-base font-semibold">{product.title}</h2>
          {product.featured ? (
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Featured
            </span>
          ) : null}
        </div>
        {product.description ? (
          <p className="mt-1 line-clamp-3 flex-1 text-sm opacity-75">
            {product.description}
          </p>
        ) : null}
        <ClickableProduct
          slug={slug}
          productId={product.id}
          href={product.url}
          className="mt-4 inline-block w-full rounded-[--sf-btn-radius] px-4 py-2.5 text-center text-sm font-semibold transition-opacity hover:opacity-90"
          style={{
            background: "var(--sf-btn-bg)",
            color: "var(--sf-btn-text)",
            borderRadius: "var(--sf-btn-radius)",
          }}
        >
          {ctaText}
        </ClickableProduct>
      </div>
    </div>
  );
}
