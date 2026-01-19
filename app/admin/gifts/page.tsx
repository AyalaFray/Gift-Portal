"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Gift = {
  id: string;
  title: string;
  description: string;
  active: boolean;
  image_preview?: string; // local preview (demo)
  created_at: string;
};

const FAKE_GIFTS: Gift[] = [
  {
    id: "g1",
    title: "שובר BUYME",
    description: "שובר דיגיטלי למגוון חנויות",
    active: true,
    created_at: "2026-01-12",
  },
  {
    id: "g2",
    title: "בקבוק תרמי יוקרתי",
    description: "שומר חום וקור לאורך זמן",
    active: true,
    created_at: "2026-01-14",
  },
  {
    id: "g3",
    title: "סט מתוקים",
    description: "מארז קטן ומגניב",
    active: false,
    created_at: "2026-01-15",
  },
];

export default function AdminGiftsPage() {
  const [gifts, setGifts] = useState<Gift[]>(FAKE_GIFTS);
  const [q, setQ] = useState("");

  // create form
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [active, setActive] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return gifts;
    return gifts.filter(
      (g) => g.title.toLowerCase().includes(s) || g.description.toLowerCase().includes(s)
    );
  }, [gifts, q]);

  function resetForm() {
    setTitle("");
    setDesc("");
    setActive(true);
    setImagePreview(null);
  }

  function onPickImage(file?: File | null) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  }

  function createGift() {
    const t = title.trim();
    if (!t) return alert("חסר שם מתנה");

    const g: Gift = {
      id: `g${Date.now()}`,
      title: t,
      description: desc.trim(),
      active,
      image_preview: imagePreview ?? undefined,
      created_at: new Date().toISOString().slice(0, 10),
    };

    setGifts([g, ...gifts]);
    resetForm();
  }

  function toggleActive(id: string) {
    setGifts((prev) =>
      prev.map((g) => (g.id === id ? { ...g, active: !g.active } : g))
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">מתנות</h1>
            <Badge variant="secondary" className="rounded-xl">
              {filtered.length}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            כאן מנהלים את קטלוג המתנות. (כרגע דמו – תמונה נשמרת רק כתצוגה מקומית)
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="rounded-xl" onClick={resetForm}>
              + הוספת מתנה
            </Button>
          </DialogTrigger>

          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>הוספת מתנה</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>שם מתנה</Label>
                <Input
                  className="rounded-xl"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="לדוגמה: אוזניות אלחוטיות"
                />
              </div>

              <div className="grid gap-2">
                <Label>תיאור</Label>
                <Input
                  className="rounded-xl"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="תיאור קצר שיעשה חשק"
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl border p-3">
                <div>
                  <div className="text-sm font-medium">זמינה (Active)</div>
                  <div className="text-xs text-muted-foreground">
                    אם לא פעילה – לא תוצג לעובדים
                  </div>
                </div>

                <Button
                  type="button"
                  variant={active ? "default" : "secondary"}
                  className="rounded-xl"
                  onClick={() => setActive((v) => !v)}
                >
                  {active ? "פעילה" : "לא פעילה"}
                </Button>
              </div>

              <div className="grid gap-2">
                <Label>תמונה</Label>
                <Input
                  className="rounded-xl"
                  type="file"
                  accept="image/*"
                  onChange={(e) => onPickImage(e.target.files?.[0])}
                />
                {imagePreview && (
                  <div className="mt-2 overflow-hidden rounded-2xl border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="h-44 w-full object-cover"
                    />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  בהמשך נחבר ל-Supabase Storage ונשמור URL אמיתי.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-xl"
                  onClick={resetForm}
                >
                  נקה
                </Button>
                <Button type="button" className="rounded-xl" onClick={createGift}>
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
            placeholder="חפשי לפי שם/תיאור…"
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
              <TableHead>תמונה</TableHead>
              <TableHead>שם</TableHead>
              <TableHead>תיאור</TableHead>
              <TableHead>סטטוס</TableHead>
              <TableHead>נוצר בתאריך</TableHead>
              <TableHead className="text-right">פעולות</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((g) => (
              <TableRow key={g.id}>
                <TableCell>
                  <div className="h-12 w-16 overflow-hidden rounded-xl border bg-muted">
                    {g.image_preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={g.image_preview} alt="" className="h-full w-full object-cover" />
                    ) : null}
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
                <TableCell className="text-muted-foreground">{g.created_at}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="secondary"
                    className="rounded-xl"
                    onClick={() => toggleActive(g.id)}
                  >
                    {g.active ? "כבה" : "הפעל"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  אין מתנות להצגה.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
