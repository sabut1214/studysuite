import SplitForm from "@/components/split/SplitForm";
import { ToolPage } from "@/components/tool-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SplitPage() {
  return (
    <ToolPage title="Expense Splitter" subtitle="Split bills and compute balances.">
      <Card>
        <CardHeader>
          <CardTitle>Split Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <SplitForm />
        </CardContent>
      </Card>
    </ToolPage>
  );
}
