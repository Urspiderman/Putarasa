
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type DepositActionState = {
  success: boolean;
  message: string;
};

const initialError = (message: string): DepositActionState => ({
  success: false,
  message,
});

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

export async function createDeposit(
  _previous: DepositActionState,
  formData: FormData
): Promise<DepositActionState> {
  try {
    const supabase = await adminClient();

    const supplierId = String(
      formData.get("supplier_id") ?? ""
    );
    const outletId = String(
      formData.get("outlet_id") ?? ""
    );
    const wasteType = String(
      formData.get("waste_type") ?? ""
    ).trim();
    const rawWeight = String(
      formData.get("gross_weight_kg") ?? ""
    ).trim();
    const notes = String(
      formData.get("notes") ?? ""
    ).trim();

    const weight = Number(rawWeight);

    if (!supplierId || !outletId) {
      return initialError(
        "Pilih Supplier dan outlet terlebih dahulu."
      );
    }

    if (wasteType.length < 3) {
      return initialError("Jenis sampah tidak valid.");
    }

    if (
      rawWeight === "" ||
      !Number.isFinite(weight) ||
      weight <= 0 ||
      weight > 100000
    ) {
      return initialError(
        "Berat sampah harus lebih dari 0 kg."
      );
    }

    const { error } = await supabase.rpc(
      "putarasa_create_deposit",
      {
        p_supplier_id: supplierId,
        p_outlet_id: outletId,
        p_waste_type: wasteType,
        p_gross_weight_kg: weight,
        p_notes: notes || null,
      }
    );

    if (error) {
      return initialError(error.message);
    }

    revalidatePath("/admin/deposits");

    return {
      success: true,
      message:
        "Setoran berhasil dicatat dan menunggu verifikasi.",
    };
  } catch (error) {
    return initialError(
      error instanceof Error
        ? error.message
        : "Gagal mencatat setoran."
    );
  }
}

export async function verifyDeposit(
  _previous: DepositActionState,
  formData: FormData
): Promise<DepositActionState> {
  try {
    const supabase = await adminClient();

    const depositId = String(
      formData.get("deposit_id") ?? ""
    );
    const rawWeight = String(
      formData.get("accepted_weight_kg") ?? ""
    ).trim();
    const weight = Number(rawWeight);

    if (
      !depositId ||
      rawWeight === "" ||
      !Number.isFinite(weight) ||
      weight <= 0
    ) {
      return initialError(
        "Masukkan berat diterima yang valid."
      );
    }

    const { error } = await supabase.rpc(
      "putarasa_verify_deposit",
      {
        p_deposit_id: depositId,
        p_accepted_weight_kg: weight,
      }
    );

    if (error) {
      return initialError(error.message);
    }

    revalidatePath("/admin/deposits");
    revalidatePath("/supplier");

    return {
      success: true,
      message:
        "Setoran berhasil diverifikasi. Poin sudah ditambahkan ke saldo Supplier.",
    };
  } catch (error) {
    return initialError(
      error instanceof Error
        ? error.message
        : "Gagal memverifikasi setoran."
    );
  }
}

export async function rejectDeposit(
  _previous: DepositActionState,
  formData: FormData
): Promise<DepositActionState> {
  try {
    const supabase = await adminClient();

    const depositId = String(
      formData.get("deposit_id") ?? ""
    );
    const reason = String(
      formData.get("reason") ?? ""
    ).trim();

    if (!depositId || reason.length < 5) {
      return initialError(
        "Alasan penolakan minimal 5 karakter."
      );
    }

    const { error } = await supabase.rpc(
      "putarasa_reject_deposit",
      {
        p_deposit_id: depositId,
        p_reason: reason,
      }
    );

    if (error) {
      return initialError(error.message);
    }

    revalidatePath("/admin/deposits");

    return {
      success: true,
      message: "Setoran berhasil ditolak.",
    };
  } catch (error) {
    return initialError(
      error instanceof Error
        ? error.message
        : "Gagal menolak setoran."
    );
  }
}
