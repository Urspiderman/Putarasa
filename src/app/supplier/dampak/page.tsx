
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Leaf,
  Recycle,
} from "lucide-react";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import SupplierImpactWorkspace, {
  type SupplierImpactItem,
  type SupplierProcessedImpact,
} from "@/components/supplier/SupplierImpactWorkspace";

// Tipe data hasil RPC get_supplier_impact
type SupplierImpactRpcRow = {
  pickup_id: string | null;
  processed_weight_kg: number | string | null;
  allocated_emission_kgco2e: number | string | null;
  has_emission_calculation: boolean | null;
};

export default async function SupplierImpactPage() {
  const { user } = await requireRole("supplier");
  const supabase = await createClient();

  // Ambil data penjemputan dan dampak lingkungan
  const [requestsResult, impactResult] = await Promise.all([
    supabase
      .from("pickup_requests")
      .select(
        "id,waste_type,actual_weight_kg,estimated_weight_kg,pickup_date,status"
      )
      .eq("supplier_id", user.id)
      .order("pickup_date", { ascending: false }),

    supabase.rpc("get_supplier_impact"),
  ]);

  // Data penjemputan Supplier
  const requests: SupplierImpactItem[] = (
    requestsResult.data ?? []
  ).map((item) => ({
    id: String(item.id),
    waste_type: String(item.waste_type),
    actual_weight_kg:
      item.actual_weight_kg == null
        ? null
        : Number(item.actual_weight_kg),
    estimated_weight_kg: Number(
      item.estimated_weight_kg ?? 0
    ),
    pickup_date: String(item.pickup_date ?? ""),
    status: String(item.status),
  }));

  // Data hasil pengolahan dan pengurangan emisi
  const impactRows = (
    impactResult.data ?? []
  ) as SupplierImpactRpcRow[];

  const processedImpacts: SupplierProcessedImpact[] =
    impactRows.map((item: SupplierImpactRpcRow) => ({
      pickup_id: String(item.pickup_id),
      processed_weight_kg: Number(
        item.processed_weight_kg ?? 0
      ),
      allocated_emission_kgco2e: Number(
        item.allocated_emission_kgco2e ?? 0
      ),
      has_emission_calculation: Boolean(
        item.has_emission_calculation
      ),
    }));

  // Kumpulkan error dari Supabase
  const errors = [
    requestsResult.error,
    impactResult.error,
  ].filter(Boolean);

  return (
    <main className="min-h-screen bg-[#FFFBF1] text-[#332417]">
      <div className="mx-auto max-w-[1500px] space-y-7 px-4 py-7 sm:px-6 lg:px-8">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm text-[#8C7A65]">
          <Link
            href="/supplier/dashboard"
            className="hover:text-[#47763A]"
          >
            Supplier
          </Link>

          <ChevronRight size={15} />

          <span className="font-black text-[#47763A]">
            Dampak Lingkungan
          </span>
        </div>

        {/* HERO SECTION */}
        <section className="relative overflow-hidden rounded-[30px] bg-[#FFDA57] p-7 sm:p-9 lg:p-10">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/20" />

          <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-xs font-black text-[#47763A]">
                <Leaf size={16} />
                SUPPLIER IMPACT
              </span>

              <h1 className="mt-5 text-3xl font-black sm:text-4xl">
                Dampak Lingkungan
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#655221] sm:text-base">
                Pantau sampah organik yang berhasil
                dikumpulkan, jumlah yang telah diolah,
                serta estimasi kontribusi pengurangan emisi
                berdasarkan perhitungan Admin PUTARASA.
              </p>

              <Link
                href="/supplier/riwayat"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#47763A] px-6 py-3.5 text-sm font-black text-white transition hover:bg-[#315F2E]"
              >
                Lihat Riwayat
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="hidden h-28 w-28 shrink-0 items-center justify-center rounded-[30px] bg-[#47763A] text-white shadow-lg sm:flex">
              <Recycle size={58} strokeWidth={1.5} />
            </div>
          </div>
        </section>

        {/* ERROR HANDLING */}
        {errors.length > 0 ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
          >
            <p className="font-black">
              Gagal Memuat Data Dampak
            </p>

            <p className="mt-2">
              {errors
                .map((error) => error?.message)
                .join(" | ")}
            </p>
          </div>
        ) : (
          /* WORKSPACE DAMPAK LINGKUNGAN */
          <SupplierImpactWorkspace
            requests={requests}
            processedImpacts={processedImpacts}
          />
        )}

        {/* FOOTER */}
        <footer className="border-t border-[#EDE5D6] py-5 text-center text-xs text-[#9A8974]">
          PUTARASA — Supplier Workspace
        </footer>
      </div>
    </main>
  );
}
