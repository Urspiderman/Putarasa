
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type RewardActionState = {
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

export async function createReward(
  _previous: RewardActionState,
  formData: FormData
): Promise<RewardActionState> {
  try {
    const supabase = await requireAdmin();

    const name = String(formData.get("name") ?? "").trim();
    const description = String(
      formData.get("description") ?? ""
    ).trim();

    const pointsRaw = String(
      formData.get("points_cost") ?? ""
    ).trim();
    const costRaw = String(
      formData.get("cost_idr") ?? ""
    ).trim();
    const stockRaw = String(
      formData.get("stock") ?? ""
    ).trim();

    const points = Number(pointsRaw);
    const cost = Number(costRaw);
    const stock = Number(stockRaw);

    if (name.length < 3 || name.length > 120) {
      return {
        success: false,
        message: "Nama hadiah harus 3–120 karakter.",
      };
    }

    if (
      pointsRaw === "" ||
      !Number.isSafeInteger(points) ||
      points <= 0 ||
      points > 2147483647
    ) {
      return {
        success: false,
        message: "Jumlah poin tidak valid.",
      };
    }

    if (
      costRaw === "" ||
      !Number.isFinite(cost) ||
      cost <= 0
    ) {
      return {
        success: false,
        message: "Biaya hadiah harus lebih dari Rp0.",
      };
    }

    if (
      stockRaw === "" ||
      !Number.isSafeInteger(stock) ||
      stock < 0
    ) {
      return {
        success: false,
        message: "Stok hadiah tidak valid.",
      };
    }

    const { error } = await supabase
      .from("reward_catalog")
      .insert({
        name,
        description: description || null,
        points_cost: points,
        cost_idr: cost,
        stock,
        is_active: false,
      });

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    revalidatePath("/admin/rewards");

    return {
      success: true,
      message:
        "Hadiah berhasil ditambahkan sebagai draft.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menambahkan hadiah.",
    };
  }
}

export async function toggleReward(
  rewardId: string,
  nextStatus: boolean
) {
  const supabase = await requireAdmin();

  const { error } = await supabase
    .from("reward_catalog")
    .update({ is_active: nextStatus })
    .eq("id", rewardId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/rewards");
  revalidatePath("/supplier/points/rewards");
}
