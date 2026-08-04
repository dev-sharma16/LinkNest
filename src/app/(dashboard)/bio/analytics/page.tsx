import { BioNav } from "@/components/bio/bio-nav";
import { BioAnalytics } from "@/components/bio/bio-analytics";

export const metadata = {
  title: "Bio analytics",
};

export default function BioAnalyticsPage() {
  return (
    <div className="grid gap-6">
      <BioNav />
      <BioAnalytics />
    </div>
  );
}