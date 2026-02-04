"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/src/lib/supabase/browser";

export default function RoutePage() {
  const router = useRouter();
  const [msg, setMsg] = useState("בודק משתמש…");

  useEffect(() => {
    (async () => {
      const supabase = supabaseBrowser();

      // 1) user
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) {
        setMsg("אין משתמש מחובר. מעבירה ל־Join…");
        router.replace("/join");
        return;
      }

      const user = userRes.user;

      // 2) profile (role)
      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profErr) {
        setMsg("שגיאה: " + profErr.message);
        return;
      }

      const role = prof?.role;

      // 3) route by role
      if (role === "admin") {
        router.replace("/admin/companies");
        return;
      }

      // ברירת מחדל: עובד
      router.replace("/choose");
    })();
  }, [router]);

  return <div className="p-6">{msg}</div>;
}
