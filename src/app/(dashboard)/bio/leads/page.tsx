import { BioNav } from "@/components/bio/bio-nav";
import { BioLeads } from "@/components/bio/bio-leads";

export const metadata = {
  title: "Bio leads",
};

export default function BioLeadsPage() {
  return (
    <div className="grid gap-6">
      <BioNav />
      <BioLeads />
    </div>
  );
}