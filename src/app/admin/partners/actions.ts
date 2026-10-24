
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type PartnerActionState = {
  success: boolean;
  message: string;
};

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Silakan login terlebih dahulu.");
  }

  const { data: role, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (roleError || !role) {
    throw new Error("Akses hanya untuk Admin.");
  }

  return supabase;
}

export async function createPartner(
  _previous: PartnerActionState,
  formData: FormData
): Promise<PartnerActionState> {
  try {
    const supabase = await requireAdmin();

    const name = String(formData.get("name") ?? "").trim();
    const address = String(
      formData.get("address") ?? ""
    ).trim();
    const phone = String(
      formData.get("contact_phone") ?? ""
    ).trim();

    if (name.length < 3 || name.length > 120) {
      return {
        success: false,
        message: "Nama warung harus 3–120 karakter.",
      };
    }

    if (address.length < 5 || address.length > 500) {
      return {
        success: false,
        message: "Alamat harus 5–500 karakter.",
      };
    }

    if (phone.length > 30) {
      return {
        success: false,
        message: "Nomor kontak terlalu panjang.",
      };
    }

    const { error } = await supabase
      .from("partner_stores")
      .insert({
        name,
        address,
        contact_phone: phone || null,
        is_active: true,
      });

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    revalidatePath("/admin/partners");
    revalidatePath("/supplier/points/rewards");

    return {
      success: true,
      message: "Warung mitra berhasil ditambahkan.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menyimpan warung mitra.",
    };
  }
}

export async function togglePartner(
  id: string,
  isActive: boolean
) {
  const supabase = await requireAdmin();

  const { error } = await supabase
    .from("partner_stores")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/partners");
  revalidatePath("/supplier/points/rewards");
}
