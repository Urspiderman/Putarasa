
"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type PickupAction =
  | "assign"
  | "on_the_way"
  | "complete"
  | "cancel";

export async function managePickupAction(
  pickupId: string,
  action: PickupAction,
  courierId?: string,
  actualWeight?: number
) {
  await requireRole("admin");

  if (!pickupId) {
    return {
      success: false,
      message: "ID penjemputan tidak valid.",
    };
  }

  const allowedActions: PickupAction[] = [
    "assign",
    "on_the_way",
    "complete",
    "cancel",
  ];

  if (!allowedActions.includes(action)) {
    return {
      success: false,
      message: "Tindakan tidak valid.",
    };
  }

  if (action === "assign" && !courierId) {
    return {
      success: false,
      message: "Silakan pilih Courier.",
    };
  }

  if (
    action === "complete" &&
    (!actualWeight ||
      !Number.isFinite(actualWeight) ||
      actualWeight <= 0)
  ) {
    return {
      success: false,
      message: "Masukkan berat aktual yang valid.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.rpc("manage_pickup", {
    p_pickup_id: pickupId,
    p_action: action,
    p_courier_id: courierId || null,
    p_actual_weight_kg: actualWeight ?? null,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/admin/penjemputan");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/pengolahan");

  return {
    success: true,
    message: "Data penjemputan berhasil diperbarui.",
  };
}
