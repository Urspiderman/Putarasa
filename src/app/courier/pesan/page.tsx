
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  CreditCard,
  MapPin,
  MapPinned,
  Package,
  Phone,
  ShoppingBag,
  Truck,
  UserRound,
  AlertCircle,
} from "lucide-react";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type CourierOrder = {
  id: string;
  order_code: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  shipping_address: string | null;
  status: string;
  payment_status: string | null;
  total_amount: number | string | null;
  created_at: string | null;
  notes: string | null;
};

function formatCurrency(value: number | string | null) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function formatDate(value: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function getOrderStatus(status: string) {
  switch (status) {
    case "pending":
      return {
        label: "Menunggu",
        className: "bg-amber-100 text-amber-700",
      };
    case "processing":
      return {
        label: "Siap Dikirim",
        className: "bg-[#FFF0B5] text-[#866500]",
      };
    case "shipped":
      return {
        label: "Dalam Pengiriman",
        className: "bg-blue-100 text-blue-700",
      };
    case "completed":
      return {
        label: "Selesai",
        className: "bg-[#E8F2DE] text-[#47763A]",
      };
    case "cancelled":
      return {
        label: "Dibatalkan",
        className: "bg-red-100 text-red-700",
      };
    default:
      return {
        label: status.replace(/_/g, " "),
        className: "bg-gray-100 text-gray-700",
      };
  }
}

export default async function CourierOrdersPage() {
  const { user } = await requireRole("courier");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("putarasa_orders")
    .select(
      "id,order_code,customer_name,customer_phone,shipping_address,status,payment_status,total_amount,created_at,notes"
    )
    .eq("courier_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const orders = (data ?? []) as CourierOrder[];

  const totalOrders = orders.length;

  const readyOrders = orders.filter(
    (order) => order.status === "processing"
  ).length;

  const shippingOrders = orders.filter(
    (order) => order.status === "shipped"
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === "completed"
  ).length;

  return (
    <main className="min-h-screen bg-[#FFFBF1] text-[#332417]">
      <div className="mx-auto max-w-[1500px] space-y-7 px-4 py-7 sm:px-6 lg:px-8">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm text-[#8C7A65]">
          <Link
            href="/courier/dashboard"
            className="hover:text-[#47763A]"
          >
            Kurir
          </Link>

          <ChevronRight size={15} />

          <span className="font-black text-[#47763A]">
            Pesanan
          </span>
        </div>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[30px] bg-[#FFDA57] p-7 sm:p-9">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/20" />

          <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/65 px-4 py-2 text-xs font-black text-[#47763A]">
                <ShoppingBag size={15} />
                PESANAN MARKETPLACE
              </span>

              <h1 className="mt-5 text-3xl font-black sm:text-4xl">
                Daftar Pesanan
                <span className="block text-[#47763A]">
                  Kurir PUTARASA
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[#655221] sm:text-base">
                Pantau pesanan Marketplace yang
                ditugaskan kepadamu. Periksa alamat,
                informasi pelanggan, dan status
                pengiriman sebelum menuju lokasi.
              </p>

              <Link
                href="/courier/operasional"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#47763A] px-6 py-3.5 text-sm font-black text-white transition hover:bg-[#315F2E]"
              >
                <MapPinned size={18} />
                Buka Operasional
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="hidden h-40 w-40 shrink-0 items-center justify-center rounded-[40px] bg-[#47763A] text-white lg:flex">
              <Truck size={86} strokeWidth={1.3} />
            </div>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5"
          >
            <AlertCircle
              size={21}
              className="shrink-0 text-red-600"
            />
            <div>
              <h2 className="font-black text-red-700">
                Gagal Memuat Pesanan
              </h2>
              <p className="mt-1 text-sm text-red-600">
                {error.message}
              </p>
            </div>
          </div>
        )}

        {/* STATISTICS */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Total Pesanan",
              value: totalOrders,
              subtitle: "Pesanan yang ditugaskan",
              icon: Package,
              color: "bg-[#E8F2DE] text-[#47763A]",
            },
            {
              title: "Siap Dikirim",
              value: readyOrders,
              subtitle: "Menunggu pengiriman",
              icon: Clock3,
              color: "bg-[#FFF0B5] text-[#866500]",
            },
            {
              title: "Dalam Pengiriman",
              value: shippingOrders,
              subtitle: "Sedang diantarkan",
              icon: Truck,
              color: "bg-blue-100 text-blue-700",
            },
            {
              title: "Selesai",
              value: completedOrders,
              subtitle: "Pesanan telah diantar",
              icon: CheckCircle2,
              color: "bg-green-100 text-green-700",
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-[24px] border border-[#EAE3D6] bg-white p-5 shadow-sm"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.color}`}
                >
                  <Icon size={24} />
                </div>

                <p className="mt-5 text-3xl font-black">
                  {stat.value}
                </p>

                <h3 className="mt-2 text-sm font-black">
                  {stat.title}
                </h3>

                <p className="mt-1 text-xs text-[#8C7A65]">
                  {stat.subtitle}
                </p>
              </div>
            );
          })}
        </div>

        {/* ORDER LIST */}
        <section className="rounded-[28px] border border-[#EAE3D6] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-black">
                <ClipboardList
                  size={22}
                  className="text-[#47763A]"
                />
                Pesanan Ditugaskan
              </h2>

              <p className="mt-2 text-sm text-[#8C7A65]">
                Daftar pesanan Marketplace yang
                menjadi tanggung jawabmu.
              </p>
            </div>

            <span className="rounded-full bg-[#E8F2DE] px-4 py-2 text-xs font-black text-[#47763A]">
              {orders.length} Pesanan
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {orders.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#EAE3D6] bg-[#FFFBF1] px-5 py-14 text-center">
                <Package
                  size={44}
                  className="text-[#47763A]"
                />

                <h3 className="mt-4 font-black">
                  Belum Ada Pesanan
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-[#8C7A65]">
                  Pesanan akan muncul setelah Admin
                  menugaskan pengantaran Marketplace
                  kepadamu.
                </p>
              </div>
            ) : (
              orders.map((order) => {
                const status = getOrderStatus(
                  order.status
                );

                return (
                  <article
                    key={order.id}
                    className="rounded-2xl border border-[#EFE8DC] bg-[#FFFEFB] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF0B5] text-[#866500]">
                          <ShoppingBag size={23} />
                        </div>

                        <div>
                          <h3 className="font-black">
                            {order.order_code ??
                              order.id
                                .slice(0, 8)
                                .toUpperCase()}
                          </h3>

                          <p className="mt-1 text-xs text-[#8C7A65]">
                            <CalendarDays
                              size={13}
                              className="mr-1 inline-block"
                            />
                            {formatDate(
                              order.created_at
                            )}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-black ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 border-t border-[#EFE8DC] pt-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2 text-sm">
                          <UserRound
                            size={17}
                            className="mt-0.5 shrink-0 text-[#47763A]"
                          />
                          <span>
                            <strong className="block text-[#332417]">
                              Pelanggan
                            </strong>
                            {order.customer_name ??
                              "Tidak tersedia"}
                          </span>
                        </div>

                        <div className="flex items-start gap-2 text-sm">
                          <Phone
                            size={17}
                            className="mt-0.5 shrink-0 text-[#47763A]"
                          />
                          <span>
                            <strong className="block text-[#332417]">
                              Nomor Telepon
                            </strong>
                            {order.customer_phone ??
                              "Tidak tersedia"}
                          </span>
                        </div>

                        <div className="flex items-start gap-2 text-sm">
                          <MapPin
                            size={17}
                            className="mt-0.5 shrink-0 text-[#47763A]"
                          />
                          <span className="break-words">
                            <strong className="block text-[#332417]">
                              Alamat Pengiriman
                            </strong>
                            {order.shipping_address ??
                              "Alamat belum tersedia"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-2 text-sm">
                          <CreditCard
                            size={17}
                            className="mt-0.5 shrink-0 text-[#47763A]"
                          />
                          <span>
                            <strong className="block text-[#332417]">
                              Status Pembayaran
                            </strong>
                            {order.payment_status ===
                            "paid"
                              ? "Sudah Dibayar"
                              : order.payment_status ===
                                  "refunded"
                                ? "Dikembalikan"
                                : "Belum Dibayar"}
                          </span>
                        </div>

                        <div className="flex items-start gap-2 text-sm">
                          <Package
                            size={17}
                            className="mt-0.5 shrink-0 text-[#47763A]"
                          />
                          <span>
                            <strong className="block text-[#332417]">
                              Nilai Pesanan
                            </strong>
                            {formatCurrency(
                              order.total_amount
                            )}
                          </span>
                        </div>

                        {order.notes && (
                          <div className="rounded-xl bg-[#FFFBF1] p-3 text-sm text-[#776957]">
                            <strong className="block text-[#332417]">
                              Catatan
                            </strong>
                            <p className="mt-1">
                              {order.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {(order.status === "processing" ||
                      order.status === "shipped") && (
                      <div className="mt-5 flex justify-end border-t border-[#EFE8DC] pt-4">
                        <Link
                          href="/courier/operasional"
                          className="inline-flex items-center gap-2 rounded-xl bg-[#47763A] px-5 py-3 text-sm font-black text-white transition hover:bg-[#315F2E]"
                        >
                          <MapPinned size={17} />
                          Kelola Pengiriman
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </section>

        <footer className="border-t border-[#EDE5D6] py-5 text-center text-xs text-[#9A8974]">
          PUTARASA — Pesanan Kurir
        </footer>
      </div>
    </main>
  );
}
