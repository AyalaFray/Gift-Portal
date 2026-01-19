import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/join" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl border bg-muted" />
            <div className="leading-tight">
              <div className="font-semibold">Gift Portal</div>
              <div className="text-xs text-muted-foreground">בחרי מתנה, בקלות</div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Button asChild variant="secondary" className="rounded-xl">
              <Link href="/admin/companies">Admin</Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link href="/join">התחלה</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
    </div>
  );
}