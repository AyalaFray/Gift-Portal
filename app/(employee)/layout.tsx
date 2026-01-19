import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl border bg-muted" />
            <div className="leading-tight">
              <div className="font-semibold">בחירת מתנה</div>
              <div className="text-xs text-muted-foreground">בחירה חד־פעמית • חוויה קצרה ונעימה</div>
            </div>
            <Badge variant="secondary" className="rounded-xl">Employee</Badge>
          </div>

          <Button asChild variant="secondary" className="rounded-xl">
            <Link href="/join">חזרה ל-Join</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
    </div>
  );
}
