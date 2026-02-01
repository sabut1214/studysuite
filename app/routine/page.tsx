import RoutineBoard from "@/components/routine/RoutineBoard";
import { ToolPage } from "@/components/tool-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RoutinePage() {
  return (
    <ToolPage title="Routine Planner" subtitle="Build your weekly schedule.">
      <Card>
        <CardHeader>
          <CardTitle>Your Routine</CardTitle>
        </CardHeader>
        <CardContent>
          <RoutineBoard />
        </CardContent>
      </Card>
    </ToolPage>
  );
}
