
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type ProfileInput = {
  fullName: string;
  phone: string;
  defaultAddress: string;
};

type ActionResult = {
  success: boolean;
  message: string;
};

export async function saveBuyerProfile(
  input: ProfileInput
): Promise<ActionResult> {
  try {
    await requireRole("buyer");

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Silakan login kembali.",
      };
    }

    const fullName = input.fullName?.trim() ?? "";
    const phone = input.phone?.trim() ?? "";
    const defaultAddress =
      input.defaultAddress?.trim() ?? "";

    if (fullName.length < 2 || fullName.length > 150) {
      return {
        success: false,
        message:
          "Nama lengkap harus terdiri dari 2–150 karakter.",
      };
    }

    if (
      phone &&
      !/^\+?[0-9\s()-]{8,30}$/.test(phone)
    ) {
      return {
        success: false,
        message: "Nomor telepon tidak valid.",
      };
    }

    if (defaultAddress.length > 1000) {
      return {
        success: false,
        message: "Alamat terlalu panjang.",
      };
    }

    const { error } = await supabase
      .from("putarasa_buyer_profiles")
      .upsert(
        {
          user_id: user.id,
          full_name: fullName,
          phone,
          default_address: defaultAddress,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    // Sinkronkan nama dengan metadata autentikasi
    // agar greeting navbar juga ikut berubah.
    const { error: metadataError } =
      await supabase.auth.updateUser({
        data: {
          full_name: fullName,
        },
      });

    revalidatePath("/buyer/profil");
    revalidatePath("/buyer", "layout");

    return {
      success: true,
      message: metadataError
        ? "Profil tersimpan, tetapi nama di navbar mungkin belum diperbarui."
        : "Profil berhasil diperbarui.",
    };
  } catch {
    return {
      success: false,
      message: "Gagal menyimpan perubahan profil.",
    };
  }
}

export async function logoutBuyer() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
