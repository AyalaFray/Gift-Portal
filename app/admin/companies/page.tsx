"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabaseBrowser } from "@/src/lib/supabase/browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Gift = { id: string; title: string; description: string | null; image_url: string | null; active: boolean };
type LinkRow = { gift_id: string; active: boolean };

export default function AdminCompanyGiftsPage() {
  const params = useParams<{ id: string }>();
  const companyId = params.id;

  const [bootLoading, setBootLoading] = useState(true);
  const [bootError, setBootError] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState<string>("");
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [links, setLinks] = useState<Record<string, boolean>>({}); // gift_id -> active

  const [q, setQ] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return gifts;
    return gifts.filter((g) => g.title.toLowerCase().includes(s));
  }, [q, gifts]);

  useEffect(() => {
    (async () => {
      setBootLoading(true);
      setBootError(null);

      const supabase = supabaseBrowser();

      // guard: admin
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) {
        setBootError("אין משתמש מחובר");
        setBootLoading(false);
        return;
      }

      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", userRes.user.id)
        .single();

      if (profErr) {
        setBootError(profErr.message);
        setBootLoading(false);
        return;
      }
      if (prof.role !== "admin") {
        setBootError("אין הרשאת אדמין");
        setBootLoading(false);
        return;
      }

      // company
      const { data: c, error: cErr } = await supabase
        .from("companies")
        .select("name")
        .eq("id", companyId)
        .single();

      if (cErr) {
        setBootError(cErr.message);
        setBootLoading(false);
        return;
      }
      setCompanyName(c.name);

      // gifts (master)
      const { data: g, error: gErr } = await supabase
        .from("gifts")
        .select("id, title, description, image_url, active")
        .order("title", { ascending: true });

      if (gErr) {
        setBootError(gErr.message);
        setBootLoading(false);
        return;
      }
      setGifts((g as Gift[]) ?? []);

      // links for this company
      const { data: l, error: lErr } = await supabase
        .from("company_gifts")
        .select("gift_id, active")
        .eq("company_id", companyId);

      if (lErr) {
        setBootError(lErr.message);
        setBootLoading(false);
        return;
      }

      const map: Record<string, boolean> = {};
      (l as LinkRow[] | null)?.forEach((row) => (map[row.gift_id] = row.active));
      setLinks(map);

      setBootLoading(false);
    })();
  }, [companyId]);

  async function setGiftForCompany(giftId: string, active: boolean) {
    setMsg(null);
    setSavingId(giftId);

    const supabase = supabaseBrowser();

    // upsert: אם לא קיים שורה – ניצור, אם קיים – נעדכן
    const { error } = await supabase
      .from("company_gifts")
      .upsert(
        { company_id: companyId, gift_id: giftId, active },
        { onConflict: "company_id,gift_id" }
      );

    setSavingId(null);

    if (error) {
      setMsg(error.message);
      return;
    }

    setLinks((prev) => ({ ...prev, [giftId]: active }));
  }

  if (bootLoading) return <div className="p-6">טוען…</div>;
  if (bootError) return <div className="p-6 text-red-600">{bootError}</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <a href="/admin/companies" className="text-sm text-muted-foreground hover:underline">
            ← חזרה לחברות
          </a>
          <h1 className="mt-2 text-3xl font-semibold">ניהול מתנות · {companyName}</h1>
          <p className="text-muted-foreground">הדליקי/כבי מתנות זמינות לעובדי החברה</p>
        </div>
        <Badge variant="secondary" className="rounded-xl">ADMIN</Badge>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>חיפוש מתנות</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            className="rounded-xl"
            placeholder="חיפוש לפי שם מתנה…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          {msg && (
            <div className="rounded-2xl border bg-muted p-3 text-sm">{msg}</div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((gift) => {
              const enabled = !!links[gift.id];

              return (
                <div key={gift.id} className="rounded-2xl border bg-card p-4 flex gap-4">
                  <div className="h-20 w-20 rounded-xl bg-muted overflow-hidden shrink-0">
                    {gift.image_url ? (
                      <img src={gift.image_url} alt={gift.title} className="h-full w-full object-cover" />
                    ) : null}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{gift.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {gift.description || "—"}
                        </div>
                      </div>

                      <Badge className="rounded-xl" variant={enabled ? "default" : "secondary"}>
                        {enabled ? "זמין" : "לא זמין"}
                      </Badge>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Button
                        className="rounded-xl"
                        onClick={() => setGiftForCompany(gift.id, true)}
                        disabled={savingId === gift.id}
                      >
                        הפעל
                      </Button>
                      <Button
                        variant="secondary"
                        className="rounded-xl"
                        onClick={() => setGiftForCompany(gift.id, false)}
                        disabled={savingId === gift.id}
                      >
                        כבה
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-sm text-muted-foreground">אין תוצאות</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
