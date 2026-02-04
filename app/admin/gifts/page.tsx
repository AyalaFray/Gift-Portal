"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/src/lib/supabase/browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function AdminGiftsPage() {
  const [bootLoading, setBootLoading] = useState(true);
  const [bootError, setBootError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setBootLoading(true);
      setBootError(null);

      const supabase = supabaseBrowser();

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

      setBootLoading(false);
    })();
  }, []);

  async function createGift() {
    const t = title.trim();
    if (!t) return;

    setMsg(null);
    setSaving(true);

    const supabase = supabaseBrowser();
    const { error } = await supabase.from("gifts").insert({
      title: t,
      description: description.trim() || null,
      image_url: imageUrl.trim() || null,
      active: true,
    });

    setSaving(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    setTitle("");
    setDescription("");
    setImageUrl("");
    setMsg("מתנה נוספה ✅");
  }

  if (bootLoading) return <div className="p-6">טוען…</div>;
  if (bootError) return <div className="p-6 text-red-600">{bootError}</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-3xl font-semibold">אדמין · מתנות</h1>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>הוספת מתנה</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label>שם מתנה</Label>
            <Input className="rounded-xl" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label>תיאור</Label>
            <Input className="rounded-xl" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label>תמונה (URL)</Label>
            <Input className="rounded-xl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </div>

          <Button className="rounded-xl" onClick={createGift} disabled={saving || !title.trim()}>
            {saving ? "שומר..." : "שמירה"}
          </Button>

          {msg && <div className="rounded-2xl border bg-muted p-3 text-sm">{msg}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
