
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  MapPin,
  Package,
  Recycle,
  Truck,
} from "lucide-react";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type Pickup = {
  id: string;
  supplier_id: string;
  category: string | null;
  estimated_kg: number | null;
  actual_kg: number | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  scheduled_at: string | null;
  status: string;
};

type Delivery = {
  id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string | null;
  shipping_address: string | null;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  total_amount: number;
  status: string;
  created_at: string;
};

function mapsUrl(
  latitude: number | null,
  longitude: number | null
) {
  if (latitude == null || longitude == null) return null;

  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

function dateTime(value: string | null) {
  if (!value) return "Belum dijadwalkan";

  return new Date(value).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

export default async function CourierTugasPage() {
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
          Sesi Kurir tidak ditemukan. Silakan login kembali.
        </p>
      </main>
    );
  }

  const [pickupsResult, deliveriesResult] =
    await Promise.all([
      supabase
        .from("pickups")
        .select(
          "id,supplier_id,category,estimated_kg,actual_kg,address,latitude,longitude,scheduled_at,status"
        )
        .eq("courier_id", user.id)
        .order("scheduled_at", { ascending: true }),

      supabase
        .from("putarasa_orders")
        .select(
          "id,order_code,customer_name,customer_phone,shipping_address,delivery_latitude,delivery_longitude,total_amount,status,created_at"
        )
        .eq("courier_id", user.id)
        .in("status", ["processing", "shipped"])
        .order("created_at", { ascending: false }),
    ]);

  if (pickupsResult.error || deliveriesResult.error) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          <h1 className="text-xl font-black">
            Gagal memuat tugas
          </h1>
          <p className="mt-2 text-sm">
            {pickupsResult.error?.message ||
              deliveriesResult.error?.message}
          </p>
        </div>
      </main>
    );
  }

  const pickups = (pickupsResult.data ?? []) as Pickup[];
  const deliveries = (deliveriesResult.data ?? []) as Delivery[];

  return (
    <main className="mx-auto w-full max-w-[1400px] space-y-8 px-5 py-8 text-[#332417] sm:px-8 lg:px-10">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#EAF3DF] px-4 py-2 text-xs font-extrabold text-[#47763A]">
          <ClipboardList size={15} />
          OPERASIONAL KURIR
        </div>

        <h1 className="text-3xl font-black tracking-tight">
          Tugas Saya
        </h1>

        <p className="max-w-2xl text-sm leading-6 text-[#8C7A65]">
          Pantau penjemputan sampah organik dari Supplier
          dan pengantaran produk Marketplace PUTARASA.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total Tugas",
            value: pickups.length + deliveries.length,
            icon: ClipboardList,
          },
          {
            label: "Penjemputan",
            value: pickups.length,
            icon: Recycle,
          },
          {
            label: "Pengantaran",
            value: deliveries.length,
            icon: Truck,
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-3xl border border-[#EFE5D4] bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-bold text-[#8C7A65]">
                  {stat.label}
                </p>
                <div className="rounded-xl bg-[#FFF0BF] p-3">
                  <Icon size={20} className="text-[#47763A]" />
                </div>
              </div>

              <p className="text-3xl font-black">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <section className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">
              Penjemputan Sampah
            </h2>
            <p className="mt-1 text-sm text-[#8C7A65]">
              Tugas pengambilan sampah organik Supplier.
            </p>
          </div>
          <span className="rounded-full bg-[#EAF3DF] px-4 py-2 text-sm font-black text-[#47763A]">
            {pickups.length} Tugas
          </span>
        </div>

        {pickups.length === 0 ? (
          <div className="rounded-3xl border border-[#EFE5D4] bg-white p-8 text-center">
            <Recycle
              size={40}
              className="mx-auto mb-3 text-[#9DBB90]"
            />
            <p className="font-extrabold">
              Belum ada tugas penjemputan
            </p>
            <p className="mt-2 text-sm text-[#8C7A65]">
              Penjemputan yang ditugaskan Admin akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {pickups.map((pickup) => {
              const url = mapsUrl(
                pickup.latitude,
                pickup.longitude
              );

              return (
                <article
                  key={pickup.id}
                  className="rounded-3xl border border-[#EFE5D4] bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-xl bg-[#EAF3DF] p-3">
                      <Recycle
                        size={22}
                        className="text-[#47763A]"
                      />
                    </div>
                    <span className="rounded-full bg-[#FFF0BF] px-3 py-1.5 text-xs font-bold">
                      {pickup.status}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-black">
                    {pickup.category || "Sampah Organik"}
                  </h3>

                  <p className="mt-2 text-sm text-[#8C7A65]">
                    Perkiraan berat:{" "}
                    <strong className="text-[#332417]">
                      {pickup.estimated_kg ?? "-"} kg
                    </strong>
                  </p>

                  <p className="mt-2 text-sm text-[#8C7A65]">
                    Jadwal: {dateTime(pickup.scheduled_at)}
                  </p>

                  <div className="mt-4 flex gap-2 text-sm text-[#665745]">
                    <MapPin
                      size={17}
                      className="mt-0.5 shrink-0 text-[#47763A]"
                    />
                    <span>{pickup.address || "Alamat belum tersedia"}</span>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#47763A] px-4 py-3 text-sm font-bold text-white"
                      >
                        Buka Navigasi
                        <ArrowRight size={16} />
                      </a>
                    ) : (
                      <span className="rounded-xl bg-[#F5F0E8] px-4 py-3 text-xs text-[#8C7A65]">
                        Koordinat belum tersedia
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">
              Pengantaran Marketplace
            </h2>
            <p className="mt-1 text-sm text-[#8C7A65]">
              Pengantaran produk kepada Buyer atau Supplier.
            </p>
          </div>
          <span className="rounded-full bg-[#FFF0BF] px-4 py-2 text-sm font-black text-[#332417]">
            {deliveries.length} Tugas
          </span>
        </div>

        {deliveries.length === 0 ? (
          <div className="rounded-3xl border border-[#EFE5D4] bg-white p-8 text-center">
            <Package
              size={40}
              className="mx-auto mb-3 text-[#9DBB90]"
            />
            <p className="font-extrabold">
              Belum ada tugas pengantaran
            </p>
            <p className="mt-2 text-sm text-[#8C7A65]">
              Pesanan yang ditugaskan Admin akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {deliveries.map((delivery) => {
              const url = mapsUrl(
                delivery.delivery_latitude,
                delivery.delivery_longitude
              );

              return (
                <article
                  key={delivery.id}
                  className="rounded-3xl border border-[#EFE5D4] bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-xl bg-[#FFF0BF] p-3">
                      <Truck
                        size={22}
                        className="text-[#47763A]"
                      />
                    </div>

                    <span className="rounded-full bg-[#EAF3DF] px-3 py-1.5 text-xs font-bold text-[#47763A]">
                      {delivery.status === "shipped"
                        ? "Dalam Pengiriman"
                        : "Menunggu Pengiriman"}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-black">
                    {delivery.order_code}
                  </h3>

                  <p className="mt-2 text-sm font-bold">
                    {delivery.customer_name}
                  </p>

                  {delivery.customer_phone && (
                    <p className="mt-1 text-sm text-[#8C7A65]">
                      {delivery.customer_phone}
                    </p>
                  )}

                  <div className="mt-4 flex gap-2 text-sm text-[#665745]">
                    <MapPin
                      size={17}
                      className="mt-0.5 shrink-0 text-[#47763A]"
                    />
                    <span>
                      {delivery.shipping_address ||
                        "Alamat belum tersedia"}
                    </span>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#47763A] px-4 py-3 text-sm font-bold text-white"
                      >
                        Buka Navigasi
                        <ArrowRight size={16} />
                      </a>
                    ) : (
                      <span className="rounded-xl bg-[#F5F0E8] px-4 py-3 text-xs text-[#8C7A65]">
                        Koordinat belum tersedia
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <div className="rounded-3xl bg-[#47763A] p-6 text-white">
        <h2 className="text-xl font-black">
          Pantau Semua Lokasi Tugas
        </h2>
        <p className="mt-2 text-sm leading-6 text-white/80">
          Buka halaman Operasional untuk melihat titik
          penjemputan dan pengantaran pada peta.
        </p>

        <Link
          href="/courier/operasional"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#FFDA57] px-5 py-3 text-sm font-black text-[#332417]"
        >
          Buka Peta Operasional
          <ArrowRight size={17} />
        </Link>
      </div>
    </main>
  );
}
