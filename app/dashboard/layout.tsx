import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole, ensureProfile } from "@/lib/auth/role";
import { DashboardShell } from "@/components/dashboard-shell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) redirect("/login");

  const name = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "there";

  await ensureProfile(user.id);
  const role = await getUserRole(user.id, user.email!);

  return (
    <DashboardShell name={name} email={user.email ?? ""} role={role}>
      {children}
    </DashboardShell>
  );
}
