import { NextResponse } from "next/server";
import { supabaseServer } from "@/src/lib/supabase/server";

export async function POST(req: Request) {
  const { email, code } = await req.json();

  const supabase = await supabaseServer();

  const { error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "email",
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
