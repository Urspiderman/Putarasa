
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SupplierProfileState = {
  success: boolean;
  message: string;
};

export async function registerSupplierProfile(
  _previous: SupplierProfileState,
  formData: FormData
): Promise<SupplierProfileState> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "Silakan login terlebih dahulu.",
      };
    }

    const supplierType = String(
      formData.get("supplier_type") ?? ""
    ).trim();

    const institutionName = String(
      formData.get("institution_name") ?? ""
    ).trim();

    if (
      supplierType !== "individual" &&
      supplierType !== "institution"
    ) {
      return {
        success: false,
        message: "Pilih tipe Supplier yang valid.",
      };
    }

    const { error } = await supabase.rpc(
      "putarasa_register_supplier_profile",
      {
        p_supplier_type: supplierType,
        p_institution_name:
          supplierType === "institution"
            ? institutionName
            : null,
      }
    );

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    revalidatePath("/supplier/points");
    revalidatePath("/admin/deposits");

    return {
      success: true,
      message: "Profil Supplier berhasil disimpan.",
    };
  } catch {
    return {
      success: false,
      message: "Terjadi kesalahan saat menyimpan profil.",
    };
  }
}
