
import {
  MapPinned,
  Truck,
} from "lucide-react";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import OperationalWorkspace from "@/components/courier/OperationalWorkspace";

export type CourierPickup = {
  id: string;
  category: string | null;
  estimated_kg: number | null;
  actual_kg: number | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  scheduled_at: string | null;
  status: string;
};

export type CourierDelivery = {
  id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string | null;
  shipping_address: string | null;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  status: string;
  created_at: string;
};

export default async function CourierOperationalPage() {
  await requireRole("courier");

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <p className="rounded-2xl bg-red-50 p-5 text-red-700">
          Sesi Kurir tidak ditemukan.
          Silakan login kembali.
        </p>
      </main>
    );
  }

  const [pickupsResult, deliveriesResult] =
    await Promise.all([
      supabase
        .from("pickups")
        .select(
          "id,category,estimated_kg,actual_kg,address,latitude,longitude,scheduled_at,status"
        )
        .eq("courier_id", user.id)
        .order("scheduled_at", {
          ascending: true,
        }),

      supabase
        .from("putarasa_orders")
        .select(
          "id,order_code,customer_name,customer_phone,shipping_address,delivery_latitude,delivery_longitude,status,created_at"
        )
        .eq("courier_id", user.id)
        .in("status", ["processing", "shipped"])
        .order("created_at", {
          ascending: false,
        }),
    ]);

  const error =
    pickupsResult.error ||
    deliveriesResult.error;

  if (error) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          <h1 className="text-xl font-black">
            Gagal memuat operasional
          </h1>
          <p className="mt-2 text-sm">
            {error.message}
          </p>
        </div>
      </main>
    );
  }

  const pickups: CourierPickup[] =
    pickupsResult.data ?? [];

  const deliveries: CourierDelivery[] =
    deliveriesResult.data ?? [];

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-8 px-5 py-8 text-[#332417] sm:px-8 lg:px-10">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#EAF3DF] px-4 py-2 text-xs font-extrabold text-[#47763A]">
          <Truck size={15} />
          OPERASIONAL KURIR
        </div>

        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#FFDA57]">
            <MapPinned
              size={30}
              className="text-[#332417]"
            />
          </div>

          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Peta Operasional
            </h1>
            <p className="mt-1 text-sm leading-6 text-[#8C7A65]">
              Pantau lokasi penjemputan sampah
              dan pengantaran produk Marketplace.
            </p>
          </div>
        </div>
      </header>

      <OperationalWorkspace
        pickups={pickups}
        deliveries={deliveries}
      />
    </main>
  );
}
