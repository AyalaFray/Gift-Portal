"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Company = {
  id: string;
  name: string;
  join_code: string;
  created_at: string;
};

const FAKE_COMPANIES: Company[] = [
  { id: "c1", name: "Acme Ltd", join_code: "ACME123", created_at: "2026-01-10" },
  { id: "c2", name: "Healson", join_code: "HEALSON9", created_at: "2026-01-12" },
  { id: "c3", name: "BlueTeam", join_code: "BLUE777", created_at: "2026-01-15" },
];

function makeJoinCode(name: string) {
  const base = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 6);
  const rand = Math.floor(100 + Math.random() * 900);
  return `${base || "COMP"}${rand}`;
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>(FAKE_COMPANIES);
  const [q, setQ] = useState("");

  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return companies;
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.join_code.toLowerCase().includes(s)
    );
  }, [companies, q]);

  function copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  function openCreateDialog() {
    setNewName("");
    setNewCode("");
  }

  function generateCode() {
    setNewCode(makeJoinCode(newName));
  }

  function createCompany() {
    const name = newName.trim();
    const code = newCode.trim().toUpperCase();

    if (!name) return alert("חסר שם חברה");
    if (!code) return alert("חסר קוד חברה");

    // בדמו: בודקים ייחודיות מקומית
    if (companies.some((c) => c.join_code.toLowerCase() === code.toLowerCase())) {
      return alert("קוד החברה כבר קיים. בחרי קוד אחר.");
    }

    const c: Company = {
      id: `c${Date.now()}`,
      name,
      join_code: code,
      created_at: new Date().toISOString().slice(0, 10),
    };

    setCompanies([c, ...companies]);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">חברות</h1>
            <Badge variant="secondary" className="rounded-xl">
              {filtered.length}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            יוצרים חברה ומפיצים לעובדים את קוד החברה (join_code).
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="rounded-xl" onClick={openCreateDialog}>
              + הוספת חברה
            </Button>
          </DialogTrigger>

          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>הוספת חברה</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>שם חברה</Label>
                <Input
                  className="rounded-xl"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="לדוגמה: Acme Ltd"
                />
              </div>

              <div className="grid gap-2">
                <Label>קוד חברה (join_code)</Label>
                <div className="flex gap-2">
                  <Input
                    className="rounded-xl"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="לדוגמה: ACME123"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-xl"
                    onClick={generateCode}
                    disabled={!newName.trim()}
                  >
                    יצרי אוטומטי
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  מומלץ קוד קצר, ברור, לא אישי (כדי שלא ינחשו).
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="secondary" className="rounded-xl" type="button" onClick={() => copy(newCode || "")} disabled={!newCode.trim()}>
                  העתק קוד
                </Button>
                <Button className="rounded-xl" type="button" onClick={createCompany}>
                  שמירה
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="rounded-2xl p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm font-medium">חיפוש</div>
          <Input
            className="max-w-md rounded-xl"
            placeholder="חפשי לפי שם חברה או join_code…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="rounded-2xl p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>שם חברה</TableHead>
              <TableHead>join_code</TableHead>
              <TableHead>נוצר בתאריך</TableHead>
              <TableHead className="text-right">פעולות</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>
                  <Badge className="rounded-xl">{c.join_code}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{c.created_at}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="secondary"
                    className="rounded-xl"
                    onClick={() => copy(c.join_code)}
                  >
                    העתק קוד
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  אין תוצאות לחיפוש.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
