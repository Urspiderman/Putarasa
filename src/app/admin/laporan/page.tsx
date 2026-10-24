
import Link from "next/link";
import {
  ArrowLeft,
  ChartNoAxesCombined,
} from "lucide-react";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import ReportWorkspace from "@/components/admin/ReportWorkspace";

export default async function LaporanPage() {
  await requireRole("admin");

  const supabase = await createClient();

  const [
    pickupsResult,
    batchesResult,
    inputsResult,
    outputsResult,
    ordersResult,
    paymentsResult,
    productsResult,
    inventoryResult,
    emissionsResult,
  ] = await Promise.all([
    supabase
      .from("pickups")
      .select("id,status,actual_kg,created_at")
      .order("created_at", { ascending: false }),

    supabase
      .from("processing_batches")
      .select(
        "id,batch_code,processing_method,status,created_at,completion_date"
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("processing_batch_inputs")
      .select("batch_id,weight_kg"),

    supabase
      .from("processing_outputs")
      .select("batch_id,output_type,weight_kg"),

    supabase
      .from("putarasa_orders")
      .select(
        "id,order_code,status,payment_status,total_amount,created_at"
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("putarasa_payments")
      .select(
        "id,order_id,amount,status,verified_at,created_at"
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("putarasa_products")
      .select("id,name,sku,unit"),

    supabase
      .from("putarasa_inventory")
      .select("product_id,quantity"),

    supabase
      .from("emission_calculations")
      .select(
        "id,batch_id,baseline_emissions_kgco2e,project_emissions_kgco2e,net_reduction_kgco2e,methodology,calculated_at"
      )
      .order("calculated_at", { ascending: false }),
  ]);

  const error = [
    pickupsResult.error,
    batchesResult.error,
    inputsResult.error,
    outputsResult.error,
    ordersResult.error,
    paymentsResult.error,
    productsResult.error,
    inventoryResult.error,
    emissionsResult.error,
  ].find(Boolean);

  if (error) {
    return (
      <main className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        <h1 className="text-xl font-extrabold">
          Gagal memuat laporan
        </h1>
        <p className="mt-2 text-sm">{error.message}</p>
        <p className="mt-2 text-xs">
          Periksa kesesuaian nama tabel dan kolom di Supabase.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-8 px-5 py-8 text-[#332417] sm:px-8 lg:px-10">
      <header className="space-y-6">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#47763A] hover:opacity-75"
        >
          <ArrowLeft size={18} />
          Kembali ke Dashboard
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-2xl bg-[#FFDA57]">
            <ChartNoAxesCombined size={30} />
          </div>

          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Laporan Operasional
            </h1>
            <p className="mt-1 text-sm leading-6 text-[#8C7A65]">
              Pantau pengumpulan sampah, pengolahan,
              inventori, penjualan, pembayaran, dan
              dampak lingkungan PUTARASA.
            </p>
          </div>
        </div>
      </header>

      <ReportWorkspace
        pickups={(pickupsResult.data ?? []).map((item) => ({
          id: item.id,
          status: item.status,
          created_at: item.created_at,
          actual_weight_kg: Number(item.actual_kg ?? 0),
        }))}
        batches={batchesResult.data ?? []}
        inputs={(inputsResult.data ?? []).map((item) => ({
          ...item,
          weight_kg: Number(item.weight_kg ?? 0),
        }))}
        outputs={(outputsResult.data ?? []).map((item) => ({
          ...item,
          weight_kg: Number(item.weight_kg ?? 0),
        }))}
        orders={(ordersResult.data ?? []).map((item) => ({
          ...item,
          total_amount: Number(item.total_amount ?? 0),
        }))}
        payments={(paymentsResult.data ?? []).map((item) => ({
          ...item,
          amount: Number(item.amount ?? 0),
        }))}
        products={productsResult.data ?? []}
        inventory={(inventoryResult.data ?? []).map((item) => ({
          ...item,
          quantity: Number(item.quantity ?? 0),
        }))}
        emissions={(emissionsResult.data ?? []).map((item) => ({
          ...item,
          baseline_emissions_kgco2e: Number(
            item.baseline_emissions_kgco2e ?? 0
          ),
          project_emissions_kgco2e: Number(
            item.project_emissions_kgco2e ?? 0
          ),
          net_reduction_kgco2e: Number(
            item.net_reduction_kgco2e ?? 0
          ),
        }))}
      />
    </main>
  );
}
