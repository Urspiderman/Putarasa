
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  History,
  Recycle,
} from "lucide-react";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import SupplierHistoryWorkspace, {
  type SupplierHistoryItem,
} from "@/components/supplier/SupplierHistoryWorkspace";

export default async function SupplierHistoryPage() {
  const { user } = await requireRole("supplier");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pickup_requests")
    .select(
      "id,waste_type,estimated_weight_kg,actual_weight_kg,pickup_date,pickup_time,address,notes,status,courier_id,created_at"
    )
    .eq("supplier_id", user.id)
    .order("created_at", { ascending: false })
    .limit(500);

  const requests: SupplierHistoryItem[] = (
    data ?? []
  ).map((item) => ({
    id: String(item.id),
    waste_type: String(item.waste_type),
    estimated_weight_kg: Number(
      item.estimated_weight_kg ?? 0
    ),
    actual_weight_kg:
      item.actual_weight_kg == null
        ? null
        : Number(item.actual_weight_kg),
    pickup_date: String(item.pickup_date),
    pickup_time: item.pickup_time ?? null,
    address: String(item.address),
    notes: item.notes ?? null,
    status: String(item.status),
    courier_id: item.courier_id ?? null,
    created_at: String(item.created_at),
  }));

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
            Riwayat
          </span>
        </div>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[30px] bg-[#FFDA57] p-7 sm:p-9 lg:p-10">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/20" />

          <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-xs font-black text-[#47763A]">
                <History size={16} />
                SUPPLIER HISTORY
              </span>

              <h1 className="mt-5 text-3xl font-black sm:text-4xl">
                Riwayat Penjemputan
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#655221] sm:text-base">
                Lihat perjalanan pengelolaan sampah
                organikmu, pantau status penjemputan,
                dan periksa berat sampah yang berhasil
                dikumpulkan.
              </p>

              <Link
                href="/supplier/penjemputan"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#47763A] px-6 py-3.5 text-sm font-black text-white transition hover:bg-[#315F2E]"
              >
                Ajukan Penjemputan
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="hidden h-28 w-28 shrink-0 items-center justify-center rounded-[30px] bg-[#47763A] text-white shadow-lg sm:flex">
              <Recycle size={58} strokeWidth={1.5} />
            </div>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
          >
            <p className="font-black">
              Gagal Memuat Riwayat
            </p>
            <p className="mt-2">{error.message}</p>
          </div>
        )}

        {/* WORKSPACE */}
        {!error && (
          <SupplierHistoryWorkspace requests={requests} />
        )}

        {/* FOOTER */}
        <footer className="border-t border-[#EDE5D6] py-5 text-center text-xs text-[#9A8974]">
          PUTARASA — Supplier Workspace
        </footer>
      </div>
    </main>
  );
}
