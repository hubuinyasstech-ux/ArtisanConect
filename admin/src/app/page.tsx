import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminRootPage() {
  const supabase = await createClient();
  const { user, profile } = await requireAdmin(supabase);

  if (user && profile && profile.role === "admin" && profile.status === "active") {
    redirect("/dashboard");
  }

  redirect("/login");
}
