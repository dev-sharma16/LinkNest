import { AutomationAnalyticsPage } from "@/components/automations/automation-analytics";

export const metadata = {
  title: "Automation Analytics",
};

export default async function AutomationAnalyticsRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AutomationAnalyticsPage scope={{ id }} />;
}