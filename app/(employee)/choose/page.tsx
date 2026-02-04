"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabaseBrowser } from "@/src/lib/supabase/browser";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Gift = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
};

export default function ChoosePage() {
  const [bootLoading, setBootLoading] = useState(true);
  const [bootError, setBootError] = useState<string | null>(null);

  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [gifts, setGifts] = useState<Gift[]>([]);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState<string | null>(null);

  const [existingChoice, setExistingChoice] = useState<{
    giftTitle: string;
    createdAt: string;
  } | null>(null);

  const [previewGift, setPreviewGift] = useState<Gift | null>(null);







  

  useEffect(() => {
    (async () => {
      setBootLoading(true);
      setBootError(null);

      const supabase = supabaseBrowser();

      // 1) get logged-in user
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) {
        setBootError("אין משתמש מחובר. חזרי ל־Join והתחברי מחדש.");
        setBootLoading(false);
        return;
      }

      const user = userRes.user;

      // 2) check if profile exists
      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("user_id, company_id, role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profErr) {
        setBootError(profErr.message);
        setBootLoading(false);
        return;
      }
      // 3) create profile if missing (SAFE)
      if (!prof) {
        const pendingCompanyId = localStorage.getItem("pending_company_id");
        if (!pendingCompanyId) {
          setBootError("חסר שיוך חברה. חזרי ל־Join והתחברי מחדש.");
          setBootLoading(false);
          return;
        }

        const { error: upsertErr } = await supabase
          .from("profiles")
          .upsert(
            {
              user_id: user.id,
              company_id: pendingCompanyId,
              role: "employee",
            },
            {
              onConflict: "user_id",
              ignoreDuplicates: true, // ⬅️ אם כבר יש פרופיל (admin) – לא נוגעים בו
            }
          );

        if (upsertErr) {
          setBootError(upsertErr.message);
          setBootLoading(false);
          return;
        }

        localStorage.removeItem("pending_company_id");
      }

      // 4) load profile again (company_id)
      const { data: prof2, error: p2Err } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("user_id", user.id)
        .single();

      if (p2Err) {
        setBootError(p2Err.message);
        setBootLoading(false);
        return;
      }

      const companyId = prof2.company_id;

      // company name (גם אם כבר יש בחירה קיימת)
      const { data: company, error: compErr } = await supabase
        .from("companies")
        .select("name")
        .eq("id", companyId)
        .single();

      if (compErr) {
        setBootError(compErr.message);
        setBootLoading(false);
        return;
      }

      setCompanyName(company.name);

      // 5) check existing selection
      const { data: existing, error: exErr } = await supabase
        .from("selections")
        .select("created_at, gifts ( title )")
        .eq("company_id", companyId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (exErr) {
        setBootError(exErr.message);
        setBootLoading(false);
        return;
      }

      if (existing) {
        const giftTitle = (existing as any).gifts?.title ?? "המתנה שבחרת";

        setExistingChoice({
          giftTitle,
          createdAt: existing.created_at,
        });

        setBootLoading(false);
        return; // חשוב: לא ממשיכים לטעינת gifts
      }

      // 6) load company gifts (many-to-many)
      const { data: links, error: linkErr } = await supabase
        .from("company_gifts")
        .select("gift_id")
        .eq("company_id", companyId)
        .eq("active", true);

      if (linkErr) {
        setBootError(linkErr.message);
        setBootLoading(false);
        return;
      }

      const giftIds = (links ?? []).map((x) => x.gift_id).filter(Boolean);

      if (giftIds.length === 0) {
        setGifts([]);
        setBootLoading(false);
        return;
      }

      const { data: giftsData, error: giftsErr } = await supabase
        .from("gifts")
        .select("id, title, description, image_url")
        .in("id", giftIds)
        .eq("active", true);

      if (giftsErr) {
        setBootError(giftsErr.message);
        setBootLoading(false);
        return;
      }

      setGifts(giftsData ?? []);
      setBootLoading(false);

      console.log("AUTH user:", {
  id: user.id,
  email: user.email,
});
    })();
  }, []);

  async function confirmChoice() {
    if (!selectedGift) return;

    setSaveMsg(null);
    setSaveLoading(true);

    const supabase = supabaseBrowser();

    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) throw new Error("אין משתמש מחובר");
      const user = userRes.user;

      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("user_id", user.id)
        .single();

      if (profErr) throw profErr;

      const { error: insErr } = await supabase.from("selections").insert({
        company_id: prof.company_id,
        user_id: user.id,
        gift_id: selectedGift.id,
        employee_email: user.email?.toLowerCase(),
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
      });

      if (insErr) {
        const msg = (insErr as any).message || "";
        const code = (insErr as any).code;

        if (code === "23505" || msg.toLowerCase().includes("duplicate")) {
          setSaveMsg("כבר בחרת מתנה בחברה הזו. אי אפשר לבחור שוב 🙂");
          return;
        }

        throw insErr;
      }

      setSubmitted(true);
    } catch (e: any) {
      setSaveMsg(e?.message ?? "שגיאה לא צפויה");
    } finally {
      setSaveLoading(false);
    }
  }

  if (bootLoading) return <div className="p-6">טוען…</div>;
  if (bootError) return <div className="p-6 text-red-600">{bootError}</div>;

  if (existingChoice) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        {companyName && (
          <div className="rounded-2xl border bg-card px-4 py-3 text-sm">
            <span className="text-muted-foreground">חברה: </span>
            <strong>{companyName}</strong>
          </div>
        )}

        <Card className="rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-semibold">כבר בחרת מתנה 🎉</h1>
          <p className="mt-2 text-muted-foreground">
            בחרת: <strong>{existingChoice.giftTitle}</strong>
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            תודה! הבחירה נשמרה ואין אפשרות לבחור שוב.
          </p>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <Card className="rounded-2xl p-8">
          <h1 className="text-2xl font-semibold">איזו בחירה טובה 🎉</h1>
          <p className="mt-2 text-muted-foreground">
            המתנה <strong>{selectedGift?.title}</strong> נבחרה בהצלחה.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            הבחירה נשמרה במערכת ✅
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Dialog אחד בלבד — מחוץ ל-map */}
      <Dialog
        open={!!previewGift}
        onOpenChange={(open) => !open && setPreviewGift(null)}
      >
        <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden">
          {previewGift && (
            <div className="grid md:grid-cols-2">
              {/* Image */}
              <div className="bg-muted">
                {previewGift.image_url ? (
                  <img
                    src={previewGift.image_url}
                    alt={previewGift.title}
                    className="h-72 md:h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-72 md:h-full w-full" />
                )}
              </div>

              {/* Info */}
              <div className="p-6">
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    {previewGift.title}
                  </DialogTitle>
                  <DialogDescription className="mt-2 text-base">
                    {previewGift.description || "מתנה שווה במיוחד 🎁"}
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-6 flex gap-3">
                  <Button
                    className="rounded-xl"
                    onClick={() => {
                      setSelectedGift(previewGift);
                      setPreviewGift(null);
                    }}
                  >
                    בחרתי את זה ✅
                  </Button>

                  <Button
                    variant="secondary"
                    className="rounded-xl"
                    onClick={() => setPreviewGift(null)}
                  >
                    חזרה
                  </Button>
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                  בחירה היא חד־פעמית — אחרי אישור לא ניתן לשנות.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div>
        <Badge variant="secondary" className="rounded-xl">
          בחירה חד־פעמית
        </Badge>

        {companyName && (
          <div className="mt-3 rounded-2xl border bg-card px-4 py-3 text-sm">
            <span className="text-muted-foreground">
              את/ה בוחר/ת מתנה עבור:{" "}
            </span>
            <strong>{companyName}</strong>
          </div>
        )}

        <h1 className="mt-2 text-3xl font-semibold">בחרי את המתנה שלך 🎁</h1>
        <p className="text-muted-foreground">
          אפשר לבחור מתנה אחת בלבד. אחרי האישור – לא ניתן לשנות.
        </p>
      </div>

      {/* Gifts */}
      <div className="grid gap-6 md:grid-cols-3">
        {gifts.map((gift) => {
          const isSelected = selectedGift?.id === gift.id;

          return (
            <Card
              key={gift.id}
              className={`cursor-pointer rounded-2xl transition ${isSelected ? "ring-2 ring-primary" : "hover:shadow-md"
                }`}
              onClick={() => setPreviewGift(gift)}
            >
              <CardHeader>
                <div className="mb-3 h-32 rounded-xl bg-muted overflow-hidden">
                  {gift.image_url ? (
                    <img
                      src={gift.image_url}
                      alt={gift.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <CardTitle className="text-lg">{gift.title}</CardTitle>
              </CardHeader>

              <CardContent className="text-sm text-muted-foreground">
                {gift.description}
              </CardContent>

              <CardFooter>
                {isSelected ? (
                  <Badge className="rounded-xl">נבחרה</Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    לחצי לתצוגה ובחירה
                  </span>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Shipping form */}
      {selectedGift && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>פרטי עובד</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>טלפון</Label>
              <Input
                placeholder="050-0000000"
                className="rounded-xl"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>שם</Label>
              <Input
                placeholder="שם פרטי, שם משפחה"
                className="rounded-xl"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {/* אם תרצי להשתמש בכתובת — כבר יש לך state, רק לא הצגת בשדה */}
            {/* <div className="grid gap-2">
              <Label>כתובת</Label>
              <Input
                placeholder="עיר, רחוב, מספר"
                className="rounded-xl"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div> */}
          </CardContent>

          <Separator />

          <CardFooter className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-muted-foreground">
              נבחרה: <strong>{selectedGift.title}</strong>
            </div>

            <Button
              className="rounded-xl"
              onClick={confirmChoice}
              disabled={
                saveLoading ||
                !fullName.trim() ||
                !phone.trim() ||
                !selectedGift
              }
            >
              {saveLoading ? "שומר..." : "אישור בחירה"}
            </Button>

            {saveMsg && (
              <div className="w-full md:w-auto rounded-2xl border bg-muted p-3 text-sm">
                {saveMsg}
              </div>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
