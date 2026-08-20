import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.from("activity_logs").insert({ user_id: user.id, event_type: "logout" });
  }

  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url));
}
