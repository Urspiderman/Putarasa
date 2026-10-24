
"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type SupplierProfileInput = {
  fullName: string;
  phone: string;
  supplierType: string;
  institutionName: string;
  defaultAddress: string;
};

export async function updateSupplierProfile(
  input: SupplierProfileInput
) {
  try {
    const { user } = await requireRole("supplier");

    const fullName = input.fullName.trim();
    const phone = input.phone.trim();
    const supplierType = input.supplierType.trim();
    const institutionName =
      input.institutionName.trim();
    const defaultAddress =
      input.defaultAddress.trim();

    if (!fullName || fullName.length > 100) {
      return {
        success: false,
        message:
          "Nama lengkap wajib diisi, maksimal 100 karakter.",
      };
    }

    if (
      phone &&
      !/^\+?[0-9\s()-]{8,20}$/.test(phone)
    ) {
      return {
        success: false,
        message: "Format nomor telepon tidak valid.",
      };
    }

    if (
      supplierType.length > 100 ||
      institutionName.length > 150 ||
      defaultAddress.length > 500
    ) {
      return {
        success: false,
        message: "Ada data yang melebihi batas karakter.",
      };
    }

    const supabase = await createClient();

    const { data: existingSupplier, error: lookupError } =
      await supabase
        .from("supplier_profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (lookupError) {
      return {
        success: false,
        message: lookupError.message,
      };
    }

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id)
        .select("id")
        .single();

    if (profileError || !profile) {
      return {
        success: false,
        message:
          profileError?.message ??
          "Profil pribadi tidak ditemukan.",
      };
    }

    const supplierPayload = {
      supplier_type: supplierType,
      institution_name: institutionName,
    };

    const supplierSave = existingSupplier
      ? await supabase
          .from("supplier_profiles")
          .update(supplierPayload)
          .eq("user_id", user.id)
      : await supabase
          .from("supplier_profiles")
          .insert({
            user_id: user.id,
            ...supplierPayload,
          });

    if (supplierSave.error) {
      return {
        success: false,
        message: supplierSave.error.message,
      };
    }

    const { error: authError } =
      await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          full_name: fullName,
          phone,
          default_pickup_address: defaultAddress,
        },
      });

    if (authError) {
      return {
        success: false,
        message:
          "Data profil tersimpan, tetapi data kontak gagal diperbarui: " +
          authError.message,
      };
    }

    revalidatePath("/supplier/profil");
    revalidatePath("/supplier/dashboard");

    return {
      success: true,
      message: "Profil Supplier berhasil diperbarui.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal memperbarui profil.",
    };
  }
}
