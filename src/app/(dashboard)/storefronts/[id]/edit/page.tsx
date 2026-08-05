import { StorefrontEditor } from "@/components/storefronts/storefront-editor";

export const metadata = {
  title: "Edit storefront",
};

export default async function StorefrontEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StorefrontEditor storefrontId={id} />;
}
