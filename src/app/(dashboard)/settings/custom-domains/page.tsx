import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomDomainsForm } from "@/components/settings/custom-domains-form";

export const metadata = {
  title: "Custom domains",
};

export default function CustomDomainsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom domains</CardTitle>
        <CardDescription>
          Use your own domain for short links. Add a CNAME pointing your domain
          (or subdomain) to your LinkNest instance to verify it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CustomDomainsForm />
      </CardContent>
    </Card>
  );
}