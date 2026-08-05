import { SharePanel } from "@/components/storefronts/share-panel";

export const metadata = {
  title: "Share storefront",
};

export default async function StorefrontSharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SharePanel storefrontId={id} />;
}
