import { AutomationAnalyticsPage } from "@/components/automations/automation-analytics";

export const metadata = {
  title: "Automation Analytics",
};

export default function AutomationOverallAnalytics() {
  return <AutomationAnalyticsPage scope="all" />;
}