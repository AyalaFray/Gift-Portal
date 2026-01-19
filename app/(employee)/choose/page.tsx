"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Gift = {
  id: string;
  title: string;
  description: string;
};

const FAKE_GIFTS: Gift[] = [
  { id: "1", title: "שובר BUYME", description: "שובר דיגיטלי למגוון חנויות" },
  { id: "2", title: "אוזניות אלחוטיות", description: "איכות מעולה ליום־יום" },
  { id: "3", title: "בקבוק תרמי יוקרתי", description: "שומר חום וקור לאורך זמן" },
];

export default function ChoosePage() {
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function confirmChoice() {
    // דמו – בהמשך זה יהיה INSERT ל-selections
    setSubmitted(true);
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
            ברגע שהמערכת תהיה מחוברת – הבחירה תישמר סופית במערכת.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <Badge variant="secondary" className="rounded-xl">בחירה חד־פעמית</Badge>
        <h1 className="mt-2 text-3xl font-semibold">בחרי את המתנה שלך 🎁</h1>
        <p className="text-muted-foreground">
          אפשר לבחור מתנה אחת בלבד. אחרי האישור – לא ניתן לשנות.
        </p>
      </div>

      {/* Gifts */}
      <div className="grid gap-6 md:grid-cols-3">
        {FAKE_GIFTS.map((gift) => {
          const isSelected = selectedGift?.id === gift.id;

          return (
            <Card
              key={gift.id}
              className={`cursor-pointer rounded-2xl transition ${
                isSelected ? "ring-2 ring-primary" : "hover:shadow-md"
              }`}
              onClick={() => setSelectedGift(gift)}
            >
              <CardHeader>
                <div className="mb-3 h-32 rounded-xl bg-muted" />
                <CardTitle className="text-lg">{gift.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {gift.description}
              </CardContent>
              <CardFooter>
                {isSelected ? (
                  <Badge className="rounded-xl">נבחרה</Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">לחצי לבחירה</span>
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
              <Input placeholder="050-0000000" className="rounded-xl" />
            </div>

            <div className="grid gap-2">
              <Label>כתובת למשלוח</Label>
              <Input placeholder="רחוב, מספר, עיר" className="rounded-xl" />
            </div>
          </CardContent>

          <Separator />

          <CardFooter className="justify-between">
            <div className="text-sm text-muted-foreground">
              נבחרה: <strong>{selectedGift.title}</strong>
            </div>
            <Button className="rounded-xl" onClick={confirmChoice}>
              אישור בחירה
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
