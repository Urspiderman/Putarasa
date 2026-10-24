
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FundingActionState = {
  success: boolean;
  message: string;
};

export async function addRewardFunding(
  _previousState: FundingActionState,
  formData: FormData
): Promise<FundingActionState> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      message: "Sesi berakhir. Silakan login kembali.",
    };
  }

  const { data: adminRole, error: roleError } =
    await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

  if (roleError || !adminRole) {
    return {
      success: false,
      message: "Hanya Admin yang dapat mencatat pendanaan.",
    };
  }

  const sourceName = String(
    formData.get("source_name") ?? ""
  ).trim();

  const rawAmount = String(
    formData.get("amount_idr") ?? ""
  ).trim();

  const notes = String(
    formData.get("notes") ?? ""
  ).trim();

  const amount = Number(rawAmount);

  if (sourceName.length < 3) {
    return {
      success: false,
      message: "Nama sponsor minimal 3 karakter.",
    };
  }

  if (
    !/^\d+$/.test(rawAmount) ||
    !Number.isSafeInteger(amount) ||
    amount <= 0
  ) {
    return {
      success: false,
      message: "Nominal harus berupa bilangan bulat positif.",
    };
  }

  if (notes.length > 1000) {
    return {
      success: false,
      message: "Keterangan maksimal 1000 karakter.",
    };
  }

  const { error } = await supabase
    .from("reward_funding")
    .insert({
      source_name: sourceName,
      amount_idr: amount,
      notes: notes || null,
    });

  if (error) {
    return {
      success: false,
      message: `Gagal menyimpan pendanaan: ${error.message}`,
    };
  }

  revalidatePath("/admin/points-budget");

  return {
    success: true,
    message: "Pendanaan sponsor berhasil dicatat.",
  };
}
