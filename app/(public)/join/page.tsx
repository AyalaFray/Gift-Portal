"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function JoinPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function fakeSend() {
    setMsg(null);
    setLoading(true);

    // כרגע “מדמה” שליחה כי נטפרי חוסם את Supabase
    setTimeout(() => {
      setLoading(false);
      setMsg("קישור התחברות נשלח למייל שלך ✅ (כרגע זה דמו עד שייפתח החיבור)");
    }, 700);
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
      {/* Left: copy */}
      <div className="flex flex-col justify-center gap-4">
        <Badge variant="secondary" className="w-fit rounded-xl">בחירה חד־פעמית</Badge>
        <h1 className="text-3xl font-semibold leading-tight">
          בוחרים מתנה בקלות.
          <br />
          תוך דקה את מסודרת 🎁
        </h1>
        <p className="text-muted-foreground">
          מכניסים אימייל + קוד חברה, מקבלים קישור למייל, ובוחרים מתנה אחת.
        </p>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="text-sm font-medium">מה צריך לדעת?</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>אפשר לבחור רק פעם אחת</li>
            <li>לא צריך סיסמה</li>
            <li>הפרטים שלך נשמרים רק למשלוח</li>
          </ul>
        </div>
      </div>

      {/* Right: form */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">כניסה לבחירת מתנה</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">אימייל</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="code">קוד חברה</Label>
            <Input
              id="code"
              placeholder="לדוגמה: ABC123"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <Button
            className="rounded-xl"
            disabled={loading || !email.trim() || !code.trim()}
            onClick={fakeSend}
          >
            {loading ? "שולח..." : "שלחו לי קישור למייל"}
          </Button>

          {msg && (
            <div className="rounded-2xl border bg-muted p-3 text-sm">
              {msg}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            * כרגע זה במצב דמו כי נטפרי חוסם את Supabase. ברגע שייפתח — זה יהפוך לשליחה אמיתית.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
