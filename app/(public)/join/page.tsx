"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabaseBrowser } from "@/src/lib/supabase/browser";

export default function JoinPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [companyCode, setCompanyCode] = useState(""); // קוד חברה
  const [otp, setOtp] = useState(""); // קוד 6 ספרות מהמייל

  const [step, setStep] = useState<"enter" | "otp">("enter");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function sendEmailCode() {
    setMsg(null);
    setLoading(true);

    const supabase = supabaseBrowser();
    const cleanEmail = email.trim().toLowerCase();
    const cleanCompanyCode = companyCode.trim();

    try {
      // 1) Validate company join_code
      const { data: company, error: cErr } = await supabase
        .from("companies")
        .select("id, join_code")
        .ilike("join_code", cleanCompanyCode)
        .maybeSingle();

      if (cErr) throw cErr;
      if (!company) {
        setMsg("קוד חברה לא תקין.");
        return;
      }

      // 2) Store company_id temporarily (used later to create/update profile)
      localStorage.setItem("pending_company_id", company.id);

      // 3) Send OTP code to email (no redirect link)
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
      });

      if (error) throw error;

      setStep("otp");
      setMsg("שלחנו לך קוד למייל ✅ תרשמי אותו כאן.");
    } catch (err: any) {
      setMsg(err?.message ?? "שגיאה לא צפויה");
    } finally {
      setLoading(false);
    }
  }

  async function verifyEmailCode() {
    setMsg(null);
    setLoading(true);

    const supabase = supabaseBrowser();
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanOtp,
        type: "email",
      });

      if (error) throw error;

      setMsg("התחברת בהצלחה ✅");

      const pendingCompanyId = localStorage.getItem("pending_company_id");
      if (!pendingCompanyId) {
        setMsg("חסר company_id (נסי שוב להזין קוד חברה)");
        return;
      }

      const res = await fetch("/api/profile/attach-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: pendingCompanyId }),
      });

      const json = await res.json();
      if (!res.ok || !json?.ok) {
        setMsg("שגיאה בשמירת החברה: " + (json?.error ?? "unknown"));
        return;
      }

      // ניקוי
      localStorage.removeItem("pending_company_id");

      // ממשיכים לניתוב
      router.replace("/gate");

    } catch (err: any) {
      setMsg(err?.message ?? "קוד לא תקין / פג תוקף");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
      {/* Left: copy */}
      <div className="flex flex-col justify-center gap-4">
        <Badge variant="secondary" className="w-fit rounded-xl">
          בחירה חד־פעמית
        </Badge>

        <h1 className="text-3xl font-semibold leading-tight">
          בוחרים מתנה בקלות.
          <br />
          תוך דקה את מסודרת 🎁
        </h1>

        <p className="text-muted-foreground">
          מכניסים אימייל + קוד חברה, מקבלים <b>קוד</b> למייל, ומאשרים כאן.
        </p>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="text-sm font-medium">מה צריך לדעת?</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>אפשר לבחור רק פעם אחת</li>
            <li>לא צריך סיסמה</li>
            <li>הקוד נשלח למייל (6 ספרות)</li>
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
              disabled={step === "otp"} // אחרי שליחה לא משנים כדי למנוע בלבול
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="companyCode">קוד חברה</Label>
            <Input
              id="companyCode"
              placeholder="לדוגמה: ABC123"
              value={companyCode}
              onChange={(e) => setCompanyCode(e.target.value)}
              className="rounded-xl"
              disabled={step === "otp"}
            />
          </div>



          {/* למחוק פיתוח בלבד: */}
          {process.env.NEXT_PUBLIC_DEV_BYPASS_OTP === "true" && (
            <Button
              type="button"
              variant="secondary"
              className="rounded-xl"
              disabled={loading || !companyCode.trim() || !email.trim()}
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                setMsg(null);
                setLoading(true);
                try {
                  const supabase = supabaseBrowser();

                  const { data: company, error: cErr } = await supabase
                    .from("companies")
                    .select("id")
                    .ilike("join_code", companyCode.trim())
                    .maybeSingle();

                  if (cErr) throw cErr;
                  if (!company) {
                    setMsg("קוד חברה לא תקין.");
                    return;
                  }

                  localStorage.setItem("pending_company_id", company.id);

                  const res = await fetch("/api/profile/attach-company", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ company_id: company.id }),
                  });

                  const json = await res.json();
                  if (!res.ok || !json?.ok) {
                    setMsg("שגיאה: " + (json?.error ?? "unknown"));
                    return;
                  }

                  localStorage.removeItem("pending_company_id");
                  window.location.href = "/gate";
                } finally {
                  setLoading(false);
                }
              }}

            >
              כניסה לפיתוח (בלי קוד)
            </Button>
          )}
          {/* עד פה למחוק פיתוח בלבד  */}

          {step === "enter" ? (
            <Button


              className="rounded-xl"
              // disabled={loading || !email.trim() || !companyCode.trim()}
              disabled={
                loading ||
                process.env.NEXT_PUBLIC_DEV_BYPASS_OTP === "true" ||
                !email.trim() ||
                !companyCode.trim()
              }
              onClick={sendEmailCode}
            >
              {loading ? "שולח..." : "שלחו לי קוד למייל"}
            </Button>







          ) : (
            <>
              <div className="grid gap-2">
                <Label htmlFor="otp">קוד מהמייל (6 ספרות)</Label>
                <Input
                  id="otp"
                  inputMode="numeric"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <Button
                className="rounded-xl"
                disabled={loading || otp.trim().length < 6}
                onClick={verifyEmailCode}
              >
                {loading ? "בודק..." : "אמת קוד והכנס"}
              </Button>

              <Button
                variant="secondary"
                className="rounded-xl"
                disabled={loading}
                onClick={() => {
                  setStep("enter");
                  setOtp("");
                  setMsg(null);
                }}
              >
                טעיתי באימייל / קוד חברה
              </Button>
            </>
          )}

          {msg && (
            <div className="rounded-2xl border bg-muted p-3 text-sm">{msg}</div>
          )}

          <p className="text-xs text-muted-foreground">
            לא קיבלת קוד? בדקי ספאם/קידומי מכירות ונסי שוב.
          </p>
        </CardContent>

      </Card>
    </div>
  );
}
