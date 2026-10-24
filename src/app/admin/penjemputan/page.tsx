
import Link from "next/link";
import {
  ArrowLeft,
  Truck,
  AlertCircle,
} from "lucide-react";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import PickupWorkspace from "@/components/admin/PickupWorkspace";

export default async function AdminPickupPage() {
  await requireRole("admin");

  const supabase = await createClient();

  const [pickupResult, courierResult] = await Promise.all([
    supabase.rpc("get_admin_pickups"),
    supabase.rpc("get_admin_couriers"),
  ]);

  const error =
    pickupResult.error || courierResult.error;

  return (
    <main className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#A77A00] hover:underline"
      >
        <ArrowLeft size={17} />
        Kembali ke Dashboard
      </Link>

      <div className="mb-8 mt-7">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#FFF0BF] px-4 py-2 text-xs font-bold text-[#916B00]">
          <Truck size={16} />
          Operasional PUTARASA
        </div>

        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Manajemen Penjemputan
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#817361]">
          Pantau permintaan penjemputan sampah organik,
          tugaskan Courier, dan catat hasil pengumpulan
          secara terpusat.
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
        >
          <div className="flex items-start gap-3">
            <AlertCircle size={22} />

            <div>
              <p className="font-bold">
                Gagal Memuat Penjemputan
              </p>

              <p className="mt-2">{error.message}</p>

              <p className="mt-3 text-xs">
                Pastikan SQL penjemputan telah dijalankan
                di Supabase.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <PickupWorkspace
          pickups={pickupResult.data ?? []}
          couriers={courierResult.data ?? []}
        />
      )}
    </main>
  );
}
