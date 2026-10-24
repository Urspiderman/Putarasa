
"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ReviewResult = {
  success: boolean;
  message: string;
};

export async function reviewApplication(
  applicationId: string,
  decision: "approved" | "rejected",
  notes: string = ""
): Promise<ReviewResult> {
  await requireRole("admin");

  if (!applicationId) {
    return {
      success: false,
      message: "ID pengajuan tidak valid.",
    };
  }

  if (decision !== "approved" && decision !== "rejected") {
    return {
      success: false,
      message: "Keputusan tidak valid.",
    };
  }

  if (decision === "rejected" && !notes.trim()) {
    return {
      success: false,
      message: "Alasan penolakan wajib diisi.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.rpc(
    "review_role_application",
    {
      p_application_id: applicationId,
      p_decision: decision,
      p_notes: notes.trim() || null,
    }
  );

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/admin/verifikasi");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/pengguna");

  return {
    success: true,
    message:
      decision === "approved"
        ? "Pengajuan berhasil disetujui dan role diaktifkan."
        : "Pengajuan berhasil ditolak.",
  };
}
