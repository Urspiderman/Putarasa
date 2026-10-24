
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type RedeemState = {
  success: boolean;
  message: string;
  code?: string;
  status?: string;
  requestId?: string;
  uncertain?: boolean;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function redeemReward(
  _previous: RedeemState,
  formData: FormData
): Promise<RedeemState> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      message: "Silakan login kembali.",
    };
  }

  const rewardId = String(
    formData.get("reward_id") ?? ""
  );

  const storeId = String(
    formData.get("store_id") ?? ""
  );

  const requestId = String(
    formData.get("request_id") ?? ""
  );

  if (
    !uuidPattern.test(rewardId) ||
    !uuidPattern.test(storeId) ||
    !uuidPattern.test(requestId)
  ) {
    return {
      success: false,
      message: "Data penukaran tidak valid.",
    };
  }

  if (formData.get("confirmed") !== "yes") {
    return {
      success: false,
      message: "Konfirmasi penukaran dahulu.",
      requestId,
    };
  }

  // Periksa apakah permintaan ini sudah tercatat.
  const existing = await supabase.rpc(
    "putarasa_redemption_request_status",
    { p_request_id: requestId }
  );

  if (existing.error) {
    return {
      success: false,
      message: "Status permintaan belum dapat diperiksa. Coba lagi dengan permintaan yang sama.",
      requestId,
      uncertain: true,
    };
  }

  const previousRedemption = existing.data?.[0];

  if (previousRedemption) {
    return {
      success:
        previousRedemption.redemption_status !==
        "cancelled",
      message:
        previousRedemption.redemption_status ===
        "cancelled"
          ? "Permintaan ini sudah dibatalkan."
          : "Permintaan penukaran sudah tercatat.",
      code: previousRedemption.redemption_code,
      status: previousRedemption.redemption_status,
      requestId,
    };
  }

  // RPC ini tetap menjadi sumber kebenaran:
  // memeriksa saldo, stok, dan dana secara atomik.
  const result = await supabase.rpc(
    "putarasa_redeem_reward",
    {
      p_reward_id: rewardId,
      p_store_id: storeId,
      p_request_id: requestId,
    }
  );

  if (result.error) {
    return {
      success: false,
      message:
        "Penukaran belum dapat dipastikan: " +
        result.error.message +
        ". Periksa kembali menggunakan permintaan yang sama.",
      requestId,
      uncertain: true,
    };
  }

  const redemption = result.data?.[0];

  if (!redemption) {
    return {
      success: false,
      message:
        "Respons penukaran belum dapat dipastikan. Jangan membuat permintaan baru.",
      requestId,
      uncertain: true,
    };
  }

  // Baca status aktual, termasuk jika terjadi
  // perubahan status setelah RPC selesai.
  const statusResult = await supabase.rpc(
    "putarasa_redemption_request_status",
    { p_request_id: requestId }
  );

  if (statusResult.error || !statusResult.data?.[0]) {
    return {
      success: false,
      message:
        "Penukaran tercatat, tetapi status terbaru belum dapat diperiksa. Gunakan permintaan yang sama.",
      requestId,
      uncertain: true,
    };
  }

  const current = statusResult.data[0];

  revalidatePath("/supplier/points");
  revalidatePath("/supplier/points/rewards");
  revalidatePath("/admin/points-redemptions");
  revalidatePath("/admin/points-budget");

  return {
    success: current.redemption_status !== "cancelled",
    message:
      current.redemption_status === "cancelled"
        ? "Penukaran sudah dibatalkan."
        : "Penukaran berhasil tercatat.",
    code: current.redemption_code,
    status: current.redemption_status,
    requestId,
  };
}
