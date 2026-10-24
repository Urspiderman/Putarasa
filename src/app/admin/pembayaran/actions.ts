
"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type Result = {
  success: boolean;
  message: string;
};

function refreshPages() {
  revalidatePath("/admin/pembayaran");
  revalidatePath("/admin/pesanan");
  revalidatePath("/admin/dashboard");
}

export async function createPayment(payload: {
  orderId: string;
  referenceNumber: string;
  senderName: string;
  paymentDate: string;
  notes: string;
}): Promise<Result> {
  try {
    await requireRole("admin");

    if (!payload.orderId || !payload.paymentDate) {
      return {
        success: false,
        message: "Pilih pesanan dan tanggal pembayaran.",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase.rpc(
      "create_putarasa_payment",
      {
        p_order_id: payload.orderId,
        p_reference_number: payload.referenceNumber,
        p_sender_name: payload.senderName,
        p_payment_date: payload.paymentDate,
        p_notes: payload.notes,
      }
    );

    if (error) {
      return { success: false, message: error.message };
    }

    refreshPages();

    return {
      success: true,
      message: "Pembayaran berhasil dicatat dan menunggu verifikasi.",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error
        ? error.message
        : "Gagal mencatat pembayaran.",
    };
  }
}

export async function reviewPayment(payload: {
  paymentId: string;
  decision: "verified" | "rejected";
  notes: string;
}): Promise<Result> {
  try {
    await requireRole("admin");

    if (
      !payload.paymentId ||
      (payload.decision === "rejected" && !payload.notes.trim())
    ) {
      return {
        success: false,
        message: "Lengkapi keputusan dan alasan penolakan.",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase.rpc(
      "review_putarasa_payment",
      {
        p_payment_id: payload.paymentId,
        p_decision: payload.decision,
        p_notes: payload.notes,
      }
    );

    if (error) {
      return { success: false, message: error.message };
    }

    refreshPages();

    return {
      success: true,
      message: payload.decision === "verified"
        ? "Pembayaran terverifikasi. Status pesanan menjadi Lunas."
        : "Pembayaran ditolak. Pesanan tetap Belum Dibayar.",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error
        ? error.message
        : "Gagal meninjau pembayaran.",
    };
  }
}
