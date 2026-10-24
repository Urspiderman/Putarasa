
import { redirect } from "next/navigation";
import { requireUser, getUserRoles } from "@/lib/auth";
import { getRoleDashboard } from "@/lib/roles";

export default async function DashboardPage() {
  await requireUser();

  const roles = await getUserRoles();

  if (roles.length === 0) {
    redirect("/auth/pending");
  }

  if (roles.length === 1) {
    redirect(getRoleDashboard(roles[0]));
  }

  redirect("/auth/select-role");
}
