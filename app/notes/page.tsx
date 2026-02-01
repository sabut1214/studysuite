import NotesEditor from "@/components/notes/NotesEditor";
import { ToolPage } from "@/components/tool-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotesPage() {
  return (
    <ToolPage title="Notes to PDF" subtitle="Write notes and export as PDF.">
      <Card>
        <CardHeader>
          <CardTitle>Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <NotesEditor />
        </CardContent>
      </Card>
    </ToolPage>
  );
}
