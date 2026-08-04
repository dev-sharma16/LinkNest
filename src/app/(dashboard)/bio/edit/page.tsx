import { BioNav } from "@/components/bio/bio-nav";
import { BioEditor } from "@/components/bio/bio-editor";

export const metadata = {
  title: "Edit bio",
};

export default function BioEditPage() {
  return (
    <div className="grid gap-6">
      <BioNav />
      <BioEditor />
    </div>
  );
}