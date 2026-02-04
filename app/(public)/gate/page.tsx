import { redirect } from "next/navigation";
import { supabaseServer } from "@/src/lib/supabase/server";

export default async function GatePage() {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/join");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) redirect("/join");
  if (!profile?.company_id) redirect("/join");

  if (profile.role === "admin") redirect("/admin");
  redirect("/choose");
}
