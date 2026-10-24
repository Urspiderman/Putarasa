
"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function refreshImpactPages() {
  revalidatePath("/admin/dampak-lingkungan");
  revalidatePath("/admin/dashboard");
  revalidatePath("/supplier/dampak");
}

export async function calculateEmission(
  batchId: string,
  baselineFactor: number,
  projectFactor: number,
  methodologyNotes: string
) {
  try {
    await requireRole("admin");

    if (
      !batchId ||
      !Number.isFinite(baselineFactor) ||
      !Number.isFinite(projectFactor) ||
      baselineFactor < 0 ||
      projectFactor < 0
    ) {
      return {
        success: false,
        message: "Data perhitungan tidak valid.",
      };
    }

    if (!methodologyNotes.trim()) {
      return {
        success: false,
        message: "Sumber dan asumsi perhitungan wajib diisi.",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase.rpc(
      "calculate_batch_emission",
      {
        p_batch_id: batchId,
        p_baseline_factor: baselineFactor,
        p_project_factor: projectFactor,
        p_methodology_notes: methodologyNotes.trim(),
      }
    );

    if (error) {
      return { success: false, message: error.message };
    }

    refreshImpactPages();

    return {
      success: true,
      message: "Estimasi emisi batch berhasil disimpan.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menghitung emisi.",
    };
  }
}

export async function saveEmissionFactor(input: {
  name: string;
  wasteType: "baseline" | "project";
  factor: number;
  methodology: string;
  sourceReference: string;
  effectiveFrom: string;
}) {
  try {
    const { user } = await requireRole("admin");

    if (
      !input.name.trim() ||
      !["baseline", "project"].includes(input.wasteType) ||
      !Number.isFinite(input.factor) ||
      input.factor < 0 ||
      !input.methodology.trim() ||
      !input.sourceReference.trim() ||
      !/^\d{4}-\d{2}-\d{2}$/.test(input.effectiveFrom)
    ) {
      return {
        success: false,
        message: "Lengkapi seluruh data faktor emisi dengan benar.",
      };
    }

    const supabase = await createClient();

    // Nonaktifkan faktor sebelumnya untuk jenis yang sama.
    const { error: deactivateError } = await supabase
      .from("putarasa_emission_factors")
      .update({ is_active: false })
      .eq("waste_type", input.wasteType)
      .eq("is_active", true);

    if (deactivateError) {
      return {
        success: false,
        message: deactivateError.message,
      };
    }

    const { error } = await supabase
      .from("putarasa_emission_factors")
      .insert({
        name: input.name.trim(),
        waste_type: input.wasteType,
        factor_kg_co2e_per_kg: input.factor,
        methodology: input.methodology.trim(),
        source_reference: input.sourceReference.trim(),
        effective_from: input.effectiveFrom,
        is_active: true,
        created_by: user.id,
      });

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    refreshImpactPages();

    return {
      success: true,
      message: "Faktor emisi berhasil disimpan dan diaktifkan.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menyimpan faktor emisi.",
    };
  }
}
