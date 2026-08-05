import { StorefrontNav } from "@/components/storefronts/storefront-nav";

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="grid gap-6">
      <StorefrontNav storefrontId={id} />
      {children}
    </div>
  );
}
