import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const tools = [
  { href: "/gpa", title: "GPA / Percentage", desc: "Convert GPA <-> % and calculate scores." },
  { href: "/routine", title: "Routine Planner", desc: "Plan your weekly schedule quickly." },
  { href: "/split", title: "Expense Splitter", desc: "Split bills and settle balances." },
  { href: "/notes", title: "Notes to PDF", desc: "Write notes and export as PDF." },
];

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">StudySuite</h1>
        <p className="text-muted-foreground">
          Fast student tools, simple, clean, and mobile-friendly.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="group">
            <Card className="transition-shadow group-hover:shadow-md">
              <CardHeader>
                <CardTitle>{tool.title}</CardTitle>
                <CardDescription>{tool.desc}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
