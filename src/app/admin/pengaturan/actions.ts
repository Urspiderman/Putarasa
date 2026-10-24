
"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type ActionResult = {
  success: boolean;
  message: string;
};

export async function updateAdminProfile(payload: {
  fullName: string;
  phone: string;
}): Promise<ActionResult> {
  try {
    await requireRole("admin");

    const fullName = payload.fullName.trim();
    const phone = payload.phone.trim();

    if (fullName.length < 3 || fullName.length > 100) {
      return {
        success: false,
        message: "Nama harus terdiri dari 3–100 karakter.",
      };
    }

    if (phone && !/^\+?[0-9\s()-]{8,20}$/.test(phone)) {
      return {
        success: false,
        message: "Format nomor telepon tidak valid.",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        phone_number: phone,
      },
    });

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    revalidatePath("/admin/pengaturan");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin", "layout");

    return {
      success: true,
      message: "Profil Admin berhasil diperbarui.",
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

export async function changeAdminPassword(payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ActionResult> {
  try {
    await requireRole("admin");

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = payload;

    if (!currentPassword) {
      return {
        success: false,
        message: "Masukkan password saat ini.",
      };
    }

    if (newPassword.length < 8) {
      return {
        success: false,
        message: "Password baru minimal 8 karakter.",
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        success: false,
        message: "Konfirmasi password tidak sesuai.",
      };
    }

    if (currentPassword === newPassword) {
      return {
        success: false,
        message: "Password baru harus berbeda dari password lama.",
      };
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      return {
        success: false,
        message: "Sesi akun tidak valid.",
      };
    }

    // Validasi password lama menggunakan autentikasi
    // tanpa mengganti sesi Admin yang sedang aktif.
    const { createClient: createSupabaseClient } =
      await import("@supabase/supabase-js");

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      return {
        success: false,
        message: "Konfigurasi Supabase belum lengkap.",
      };
    }

    const verificationClient = createSupabaseClient(
      url,
      anonKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );

    const { error: verificationError } =
      await verificationClient.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

    if (verificationError) {
      return {
        success: false,
        message: "Password saat ini tidak sesuai.",
      };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: true,
      message: "Password berhasil diubah.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal mengubah password.",
    };
  }
}
