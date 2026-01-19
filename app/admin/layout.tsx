import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link
    href={href}
    className="rounded-xl px-3 py-2 text-sm hover:bg-muted transition"
  >
    {children}
  </Link>
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">Admin</div>
              <div className="text-xs text-muted-foreground">ניהול מערכת מתנות</div>
            </div>
            <Badge variant="secondary" className="rounded-xl">Backoffice</Badge>
          </div>

          <Separator className="my-3" />

          <nav className="grid gap-1">
            <NavLink href="/admin/companies">חברות</NavLink>
            <NavLink href="/admin/gifts">מתנות</NavLink>
            <NavLink href="/admin/reports">דוחות</NavLink>
            <NavLink href="/admin/availability">זמינות מתנות לחברות</NavLink>

          </nav>

          <Separator className="my-4" />

          <div className="grid gap-2">
            <Button asChild variant="secondary" className="rounded-xl">
              <Link href="/join">Join</Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link href="/choose">Employee view</Link>
            </Button>
          </div>
        </aside>

        <main className="rounded-2xl border bg-card p-6 shadow-sm">{children}</main>
      </div>
    </div>
  );
}
