
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Silakan login terlebih dahulu.");
  }

  const { data: adminRole, error: roleError } =
    await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

  if (roleError || !adminRole) {
    throw new Error(
      "Akses ditolak. Hanya Admin yang diizinkan."
    );
  }

  return supabase;
}

export async function createOutlet(formData: FormData) {
  const supabase = await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const address = String(
    formData.get("address") ?? ""
  ).trim();

  if (name.length < 3 || name.length > 120) {
    throw new Error(
      "Nama outlet harus terdiri dari 3–120 karakter."
    );
  }

  if (address.length < 5 || address.length > 500) {
    throw new Error(
      "Alamat outlet harus terdiri dari 5–500 karakter."
    );
  }

  const { error } = await supabase
    .from("outlets")
    .insert({
      name,
      address,
      is_active: true,
    });

  if (error) {
    throw new Error(
      `Gagal menambahkan outlet: ${error.message}`
    );
  }

  revalidatePath("/admin/outlets");
}

export async function toggleOutlet(
  outletId: string,
  nextStatus: boolean
) {
  const supabase = await requireAdmin();

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(outletId)) {
    throw new Error("ID outlet tidak valid.");
  }

  const { data, error } = await supabase
    .from("outlets")
    .update({ is_active: nextStatus })
    .eq("id", outletId)
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(
      error?.message ?? "Outlet tidak ditemukan."
    );
  }

  revalidatePath("/admin/outlets");
}
