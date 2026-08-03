import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UtmTemplatesForm } from "@/components/settings/utm-templates-form";

export const metadata = {
  title: "UTM templates",
};

export default function UtmTemplatesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>UTM templates</CardTitle>
        <CardDescription>
          Save reusable UTM parameter sets to quickly apply to new links.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UtmTemplatesForm />
      </CardContent>
    </Card>
  );
}