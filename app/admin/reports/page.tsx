"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Company = { id: string; name: string };
type Gift = { id: string; title: string };
type Selection = {
  id: string;
  company_id: string;
  gift_id: string;
  employee_email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  created_at: string;
};

const COMPANIES: Company[] = [
  { id: "c1", name: "Acme Ltd" },
  { id: "c2", name: "Healson" },
  { id: "c3", name: "BlueTeam" },
];

const GIFTS: Gift[] = [
  { id: "g1", title: "שובר BUYME" },
  { id: "g2", title: "בקבוק תרמי יוקרתי" },
  { id: "g3", title: "סט מתוקים" },
  { id: "g4", title: "אוזניות אלחוטיות" },
];

const SELECTIONS: Selection[] = [
  { id: "s1", company_id: "c1", gift_id: "g1", employee_email: "a@acme.com", full_name: "נועה לוי", phone: "050-1111111", address: "תל אביב", created_at: "2026-01-16" },
  { id: "s2", company_id: "c1", gift_id: "g2", employee_email: "b@acme.com", full_name: "אורי כהן", phone: "050-2222222", address: "רמת גן", created_at: "2026-01-16" },
  { id: "s3", company_id: "c2", gift_id: "g4", employee_email: "c@healson.com", full_name: "מיכל", phone: "050-3333333", address: "ירושלים", created_at: "2026-01-17" },
  { id: "s4", company_id: "c2", gift_id: "g1", employee_email: "d@healson.com", full_name: "דניאל", phone: "050-4444444", address: "חיפה", created_at: "2026-01-17" },
  { id: "s5", company_id: "c3", gift_id: "g1", employee_email: "e@blue.com", full_name: "שיר", phone: "050-5555555", address: "אשדוד", created_at: "2026-01-18" },
];

function byId<T extends { id: string }>(arr: T[], id: string) {
  return arr.find((x) => x.id === id);
}

export default function AdminReportsPage() {
  const [companyId, setCompanyId] = useState<string>(COMPANIES[0].id);
  const [giftId, setGiftId] = useState<string>("all");
  const [q, setQ] = useState("");

  const company = byId(COMPANIES, companyId)!;

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    return SELECTIONS.filter((sel) => {
      if (sel.company_id !== companyId) return false;
      if (giftId !== "all" && sel.gift_id !== giftId) return false;

      if (!s) return true;

      return (
        sel.employee_email.toLowerCase().includes(s) ||
        (sel.full_name?.toLowerCase().includes(s) ?? false) ||
        (sel.phone?.toLowerCase().includes(s) ?? false) ||
        (sel.address?.toLowerCase().includes(s) ?? false)
      );
    });
  }, [companyId, giftId, q]);

  const totals = useMemo(() => {
    const total = filtered.length;
    const perGift = new Map<string, number>();
    for (const sel of filtered) {
      perGift.set(sel.gift_id, (perGift.get(sel.gift_id) ?? 0) + 1);
    }
    return { total, perGift };
  }, [filtered]);

  const topGift = useMemo(() => {
    let best: { gift_id: string; count: number } | null = null;
    for (const [gid, count] of totals.perGift.entries()) {
      if (!best || count > best.count) best = { gift_id: gid, count };
    }
    if (!best) return null;
    return { gift: byId(GIFTS, best.gift_id)!, count: best.count };
  }, [totals.perGift]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">דוחות</h1>
            <Badge variant="secondary" className="rounded-xl">
              {company.name}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            דוח בחירות לפי חברה/מתנה. (דמו כרגע)
          </p>
        </div>

        <div className="grid w-full gap-2 md:w-auto md:grid-cols-3">
          <Select value={companyId} onValueChange={setCompanyId}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="בחרי חברה" />
            </SelectTrigger>
            <SelectContent>
              {COMPANIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={giftId} onValueChange={setGiftId}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="פילטר מתנה" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל המתנות</SelectItem>
              {GIFTS.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            className="rounded-xl"
            placeholder="חיפוש לפי אימייל/שם/טלפון/כתובת…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl p-5">
          <div className="text-sm text-muted-foreground">סה״כ בחירות (לפי הפילטרים)</div>
          <div className="mt-2 text-3xl font-semibold">{totals.total}</div>
        </Card>

        <Card className="rounded-2xl p-5">
          <div className="text-sm text-muted-foreground">המתנה המובילה</div>
          <div className="mt-2 text-xl font-semibold">
            {topGift ? topGift.gift.title : "—"}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {topGift ? `${topGift.count} בחירות` : "אין נתונים"}
          </div>
        </Card>
      </div>

      {/* Breakdown */}
      <Card className="rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="font-medium">התפלגות לפי מתנה</div>
          <Badge variant="secondary" className="rounded-xl">
            {totals.perGift.size}
          </Badge>
        </div>

        <Separator className="my-4" />

        <div className="grid gap-2 md:grid-cols-2">
          {Array.from(totals.perGift.entries()).map(([gid, count]) => {
            const gift = byId(GIFTS, gid);
            return (
              <div key={gid} className="flex items-center justify-between rounded-2xl border p-3">
                <div className="text-sm">{gift?.title ?? gid}</div>
                <Badge className="rounded-xl">{count}</Badge>
              </div>
            );
          })}

          {totals.perGift.size === 0 && (
            <div className="text-sm text-muted-foreground">אין נתונים לפי הפילטרים.</div>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card className="rounded-2xl p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>תאריך</TableHead>
              <TableHead>מתנה</TableHead>
              <TableHead>אימייל</TableHead>
              <TableHead>שם</TableHead>
              <TableHead>טלפון</TableHead>
              <TableHead>כתובת</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((sel) => {
              const gift = byId(GIFTS, sel.gift_id);
              return (
                <TableRow key={sel.id}>
                  <TableCell className="text-muted-foreground">{sel.created_at}</TableCell>
                  <TableCell className="font-medium">{gift?.title ?? sel.gift_id}</TableCell>
                  <TableCell>{sel.employee_email}</TableCell>
                  <TableCell>{sel.full_name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{sel.phone ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{sel.address ?? "—"}</TableCell>
                </TableRow>
              );
            })}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  אין בחירות לפי הפילטרים.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
