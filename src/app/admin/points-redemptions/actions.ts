
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type RedemptionActionState = {
  success: boolean;
  message: string;
};

async function adminClient() {
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

export async function completeRedemption(
  _previous: RedemptionActionState,
  formData: FormData
): Promise<RedemptionActionState> {
  try {
    const supabase = await adminClient();

    const redemptionId = String(
      formData.get("redemption_id") ?? ""
    ).trim();

    const code = String(
      formData.get("redemption_code") ?? ""
    )
      .trim()
      .toUpperCase();

    if (!redemptionId || !code) {
      return {
        success: false,
        message: "ID dan kode penukaran wajib diisi.",
      };
    }

    const { error } = await supabase.rpc(
      "putarasa_complete_redemption",
      {
        p_redemption_id: redemptionId,
        p_redemption_code: code,
      }
    );

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    revalidatePath("/admin/points-redemptions");
    revalidatePath("/admin/points-budget");
    revalidatePath("/supplier/points/rewards");

    return {
      success: true,
      message: "Hadiah berhasil ditandai sudah diambil.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menyelesaikan penukaran.",
    };
  }
}

export async function cancelRedemption(
  _previous: RedemptionActionState,
  formData: FormData
): Promise<RedemptionActionState> {
  try {
    const supabase = await adminClient();

    const redemptionId = String(
      formData.get("redemption_id") ?? ""
    ).trim();

    if (!redemptionId) {
      return {
        success: false,
        message: "ID penukaran tidak valid.",
      };
    }

    const { error } = await supabase.rpc(
      "putarasa_cancel_redemption",
      {
        p_redemption_id: redemptionId,
      }
    );

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    revalidatePath("/admin/points-redemptions");
    revalidatePath("/admin/points-budget");
    revalidatePath("/supplier/points");
    revalidatePath("/supplier/points/rewards");

    return {
      success: true,
      message:
        "Penukaran dibatalkan. Poin dan stok dikembalikan.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal membatalkan penukaran.",
    };
  }
}
