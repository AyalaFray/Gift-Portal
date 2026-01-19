"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Company = { id: string; name: string };
type Gift = { id: string; title: string; description: string; active: boolean };

const FAKE_COMPANIES: Company[] = [
  { id: "c1", name: "Acme Ltd" },
  { id: "c2", name: "Healson" },
  { id: "c3", name: "BlueTeam" },
];

const FAKE_GIFTS: Gift[] = [
  { id: "g1", title: "שובר BUYME", description: "שובר דיגיטלי למגוון חנויות", active: true },
  { id: "g2", title: "בקבוק תרמי יוקרתי", description: "שומר חום וקור לאורך זמן", active: true },
  { id: "g3", title: "סט מתוקים", description: "מארז קטן ומגניב", active: false },
  { id: "g4", title: "אוזניות אלחוטיות", description: "איכות מעולה ליום־יום", active: true },
];

// company_gifts: key = `${companyId}:${giftId}`
const initialAssignments = new Set<string>([
  "c1:g1",
  "c1:g2",
  "c2:g1",
  "c2:g4",
]);

export default function AdminAvailabilityPage() {
  const [companyId, setCompanyId] = useState<string>(FAKE_COMPANIES[0].id);
  const [q, setQ] = useState("");
  const [assigned, setAssigned] = useState<Set<string>>(initialAssignments);

  const company = FAKE_COMPANIES.find((c) => c.id === companyId)!;

  const gifts = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return FAKE_GIFTS;
    return FAKE_GIFTS.filter(
      (g) =>
        g.title.toLowerCase().includes(s) ||
        g.description.toLowerCase().includes(s)
    );
  }, [q]);

  const assignedCount = useMemo(() => {
    let count = 0;
    for (const g of FAKE_GIFTS) {
      if (assigned.has(`${companyId}:${g.id}`)) count++;
    }
    return count;
  }, [assigned, companyId]);

  function toggle(companyId: string, giftId: string, next: boolean) {
    const key = `${companyId}:${giftId}`;
    setAssigned((prev) => {
      const n = new Set(prev);
      if (next) n.add(key);
      else n.delete(key);
      return n;
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">זמינות מתנות לחברות</h1>
            <Badge variant="secondary" className="rounded-xl">
              {assignedCount} זמינות
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            בחרי חברה ואז סמני אילו מתנות יוצגו לעובדים שלה. (דמו כרגע)
          </p>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="w-full md:w-[260px]">
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="בחרי חברה" />
              </SelectTrigger>
              <SelectContent>
                {FAKE_COMPANIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            className="w-full md:w-[300px] rounded-xl"
            placeholder="חיפוש מתנה…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <Card className="rounded-2xl p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>זמין ל־{company.name}</TableHead>
              <TableHead>שם מתנה</TableHead>
              <TableHead>תיאור</TableHead>
              <TableHead>סטטוס מתנה</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {gifts.map((g) => {
              const key = `${companyId}:${g.id}`;
              const isOn = assigned.has(key);

              return (
                <TableRow key={g.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={isOn}
                        onCheckedChange={(v) => toggle(companyId, g.id, Boolean(v))}
                        className="rounded-md"
                      />
                      <span className="text-sm text-muted-foreground">
                        {isOn ? "כן" : "לא"}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="font-medium">{g.title}</TableCell>
                  <TableCell className="text-muted-foreground">{g.description}</TableCell>
                  <TableCell>
                    {g.active ? (
                      <Badge className="rounded-xl">Active</Badge>
                    ) : (
                      <Badge variant="secondary" className="rounded-xl">Inactive</Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}

            {gifts.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  אין תוצאות.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Note */}
      <Card className="rounded-2xl p-4 text-sm text-muted-foreground">
        כשנחבר ל-Supabase זה יישמר בטבלה <strong>company_gifts</strong> (many-to-many).
      </Card>
    </div>
  );
}
