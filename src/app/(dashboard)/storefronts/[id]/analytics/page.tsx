import { StorefrontAnalytics } from "@/components/storefronts/storefront-analytics";

export const metadata = {
  title: "Storefront analytics",
};

export default async function StorefrontAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StorefrontAnalytics storefrontId={id} />;
}
