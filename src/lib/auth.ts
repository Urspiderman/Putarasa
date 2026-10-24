
import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  type Role,
  isRole,
  getRoleDashboard,
} from "@/lib/roles";

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return user;
}

export async function getUserRoles(): Promise<Role[]> {
  const user = await getCurrentUser();

  if (!user) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (error) {
    throw new Error(
      `Gagal mengambil role: ${error.message}`
    );
  }

  return (data ?? [])
    .map((item: { role: string }) => item.role)
    .filter(isRole);
}

export async function requireRole(role: Role) {
  const user = await requireUser();
  const roles = await getUserRoles();

  if (!roles.includes(role)) {
    if (roles.length === 0) {
      redirect("/auth/pending");
    }

    if (roles.length === 1) {
      redirect(getRoleDashboard(roles[0]));
    }

    redirect("/auth/select-role");
  }

  return { user, role, roles };
}
