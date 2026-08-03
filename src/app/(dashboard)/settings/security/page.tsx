import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SecurityForm } from "@/components/settings/security-form";

export default function SecuritySettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>Update your password and secure your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <SecurityForm />
      </CardContent>
    </Card>
  );
}