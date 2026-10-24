
import Link from "next/link";
import { ArrowLeft, Leaf } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import EnvironmentalImpactWorkspace from
  "@/components/admin/EnvironmentalImpactWorkspace";

export default async function DampakLingkunganPage() {
  await requireRole("admin");

  const supabase = await createClient();

  const [
    batchesResult,
    inputsResult,
    emissionsResult,
    factorsResult,
  ] = await Promise.all([
    supabase
      .from("processing_batches")
      .select(
        "id,batch_code,processing_method,status,created_at"
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("processing_batch_inputs")
      .select("batch_id,weight_kg"),

    supabase
      .from("emission_calculations")
      .select(
        "id,batch_id,baseline_emissions_kgco2e,project_emissions_kgco2e,net_reduction_kgco2e,methodology,assumptions,factor_snapshot,calculated_at"
      )
      .order("calculated_at", { ascending: false }),

    supabase
      .from("putarasa_emission_factors")
      .select(
        "id,name,waste_type,factor_kg_co2e_per_kg,methodology,source_reference,effective_from,is_active,created_at"
      )
      .order("created_at", { ascending: false }),
  ]);

  const errors = [
    batchesResult.error,
    inputsResult.error,
    emissionsResult.error,
    factorsResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    return (
      <main className="mx-auto max-w-[1500px] px-5 py-10">
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700"
        >
          <h1 className="font-extrabold">
            Gagal memuat Dampak Lingkungan
          </h1>
          <p className="mt-2 text-sm">
            {errors.map((error) => error?.message).join(" | ")}
          </p>
        </div>
      </main>
    );
  }

  const batches = (batchesResult.data ?? []).map((item) => ({
    id: String(item.id),
    batch_code: item.batch_code,
    processing_method: item.processing_method,
    status: String(item.status),
    created_at: String(item.created_at),
  }));

  const inputs = (inputsResult.data ?? []).map((item) => ({
    batch_id: String(item.batch_id),
    weight_kg: Number(item.weight_kg ?? 0),
  }));

  const emissions = (emissionsResult.data ?? []).map((item) => ({
    id: String(item.id),
    batch_id: String(item.batch_id),
    baseline_emissions_kgco2e: Number(
      item.baseline_emissions_kgco2e ?? 0
    ),
    project_emissions_kgco2e: Number(
      item.project_emissions_kgco2e ?? 0
    ),
    net_reduction_kgco2e: Number(
      item.net_reduction_kgco2e ?? 0
    ),
    methodology: item.methodology,
    assumptions: item.assumptions,
    factor_snapshot: item.factor_snapshot,
    calculated_at: String(item.calculated_at),
  }));

  const factors = (factorsResult.data ?? []).map((item) => ({
    id: String(item.id),
    name: String(item.name),
    waste_type: String(item.waste_type),
    factor_kg_co2e_per_kg: Number(
      item.factor_kg_co2e_per_kg ?? 0
    ),
    methodology: String(item.methodology),
    source_reference: String(item.source_reference),
    effective_from: String(item.effective_from),
    is_active: Boolean(item.is_active),
    created_at: String(item.created_at),
  }));

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-8 px-5 py-8 text-[#332417] sm:px-8 lg:px-10">
      <div>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#47763A] hover:underline"
        >
          <ArrowLeft size={17} />
          Kembali ke Dashboard
        </Link>

        <div className="mt-5 flex items-center gap-4">
          <div className="rounded-2xl bg-[#F0F7E9] p-4">
            <Leaf size={30} className="text-[#47763A]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold sm:text-3xl">
              Dampak Lingkungan
            </h1>
            <p className="mt-1 text-sm text-[#8C7A65]">
              Pantau pengolahan, kelola faktor emisi,
              dan hitung estimasi pengurangan emisi PUTARASA.
            </p>
          </div>
        </div>
      </div>

      <EnvironmentalImpactWorkspace
        batches={batches}
        inputs={inputs}
        emissions={emissions}
        factors={factors}
      />

      <footer className="border-t border-[#EEE5D6] py-5 text-center text-xs text-[#8C7A65]">
        PUTARASA — Dari Dapur, Untuk Bumi
      </footer>
    </main>
  );
}
