import { NextResponse } from "next/server";
import { supabaseServer } from "@/src/lib/supabase/server";

export async function POST(req: Request) {
  const { company_id } = await req.json();

  if (!company_id) {
    return NextResponse.json({ ok: false, error: "missing company_id" }, { status: 400 });
  }
  const supabase = await supabaseServer();

  // חייב להיות משתמש מחובר
  const {
    data: { user },
    error: uErr,
  } = await supabase.auth.getUser();

  if (uErr || !user) {
    return NextResponse.json({ ok: false, error: "not authenticated" }, { status: 401 });
  }
  // upsert לפרופיל: אם קיים יעדכן, אם לא קיים ייצור
  const { error } = await supabase.from("profiles").upsert(
 {
    user_id: user.id,
    company_id,
    role: "employee",
  },
  { onConflict: "user_id" }
);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
