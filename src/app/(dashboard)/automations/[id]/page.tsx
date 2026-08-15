import { AutomationDetail } from "@/components/automations/automation-detail";

export const metadata = {
  title: "Automation",
};

export default async function AutomationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AutomationDetail automationId={id} />;
}