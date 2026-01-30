import GpaForm from "@/components/gpa/GpaForm";
import { ToolPage } from "@/components/tool-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GpaPage() {
  return (
    <ToolPage title="GPA / Percentage" subtitle="Convert and calculate quickly.">
      <Card>
        <CardHeader>
          <CardTitle>Converter</CardTitle>
        </CardHeader>
        <CardContent>
          <GpaForm />
        </CardContent>
      </Card>
    </ToolPage>
  );
}
