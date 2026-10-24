
"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type ActionResult = {
  success: boolean;
  message: string;
};

type ProcessingMethod = "compost" | "maggot";
type BatchStatus =
  | "planned"
  | "processing"
  | "completed"
  | "cancelled";

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan.";
}

async function adminClient() {
  await requireRole("admin");
  return createClient();
}

function refreshProcessing() {
  revalidatePath("/admin/pengolahan");
  revalidatePath("/admin/dampak-lingkungan");
  revalidatePath("/admin/dashboard");
}

export async function createProcessingBatch(
  method: ProcessingMethod,
  pickupId: string,
  weight: number,
  notes: string
): Promise<ActionResult> {
  try {
    const supabase = await adminClient();

    if (!["compost", "maggot"].includes(method)) {
      return {
        success: false,
        message: "Metode tidak valid.",
      };
    }

    if (
      !pickupId ||
      !Number.isFinite(weight) ||
      weight <= 0
    ) {
      return {
        success: false,
        message: "Data bahan baku tidak valid.",
      };
    }

    const { error } = await supabase.rpc(
      "create_processing_batch",
      {
        p_method: method,
        p_pickup_id: pickupId,
        p_weight_kg: weight,
        p_notes: notes.trim() || null,
      }
    );

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    refreshProcessing();

    return {
      success: true,
      message: "Batch berhasil dibuat dan stok dialokasikan.",
    };
  } catch (error) {
    return {
      success: false,
      message: errorMessage(error),
    };
  }
}

export async function updateProcessingBatchStatus(
  batchId: string,
  nextStatus: BatchStatus
): Promise<ActionResult> {
  try {
    const supabase = await adminClient();

    const { error } = await supabase.rpc(
      "change_processing_batch_status",
      {
        p_batch_id: batchId,
        p_next_status: nextStatus,
      }
    );

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    refreshProcessing();

    return {
      success: true,
      message: "Status pengolahan berhasil diperbarui.",
    };
  } catch (error) {
    return {
      success: false,
      message: errorMessage(error),
    };
  }
}

export async function addProcessingOutput(
  batchId: string,
  outputType: string,
  weight: number,
  notes: string
): Promise<ActionResult> {
  try {
    const supabase = await adminClient();

    const allowedTypes = [
      "compost",
      "fresh_maggot",
      "dried_maggot",
      "frass",
      "residue",
      "other",
    ];

    if (!allowedTypes.includes(outputType)) {
      return {
        success: false,
        message: "Jenis hasil produksi tidak valid.",
      };
    }

    if (!Number.isFinite(weight) || weight <= 0) {
      return {
        success: false,
        message: "Berat hasil harus lebih dari nol.",
      };
    }

    const { data: batch, error: batchError } =
      await supabase
        .from("processing_batches")
        .select("status")
        .eq("id", batchId)
        .single();

    if (batchError || batch?.status !== "processing") {
      return {
        success: false,
        message: "Batch harus berstatus diproses.",
      };
    }

    const { error } = await supabase
      .from("processing_outputs")
      .insert({
        batch_id: batchId,
        output_type: outputType,
        weight_kg: weight,
        notes: notes.trim() || null,
      });

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    refreshProcessing();

    return {
      success: true,
      message: "Hasil produksi berhasil dicatat.",
    };
  } catch (error) {
    return {
      success: false,
      message: errorMessage(error),
    };
  }
}
