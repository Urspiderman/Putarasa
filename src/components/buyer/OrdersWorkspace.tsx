
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  Leaf,
  Package,
  Search,
  ShoppingBag,
  Truck,
  X,
  XCircle,
} from "lucide-react";

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

type PaymentStatus =
  | "unpaid"
  | "paid"
  | "refunded";

type OrderItem = {
  id: string;
  product_name: string;
  quantity: number;
  subtotal: number;
};

type Order = {
  id: string;
  order_code: string;
  customer_name: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  items: OrderItem[];
};

type Props = {
  orders: Order[];
};

type StatusFilter = "all" | OrderStatus;

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));

function getOrderStatus(status: string) {
  switch (status) {
    case "pending":
      return {
        label: "Menunggu",
        className: "bg-amber-100 text-amber-800",
        icon: Clock3,
      };
    case "processing":
      return {
        label: "Diproses",
        className: "bg-blue-100 text-blue-800",
        icon: Package,
      };
    case "shipped":
      return {
        label: "Dikirim",
        className: "bg-violet-100 text-violet-800",
        icon: Truck,
      };
    case "completed":
      return {
        label: "Selesai",
        className: "bg-green-100 text-green-800",
        icon: CheckCircle2,
      };
    case "cancelled":
      return {
        label: "Dibatalkan",
        className: "bg-red-100 text-red-700",
        icon: XCircle,
      };
    default:
      return {
        label: status,
        className: "bg-gray-100 text-gray-700",
        icon: Package,
      };
  }
}

function getPaymentStatus(status: string) {
  switch (status) {
    case "paid":
      return {
        label: "Sudah Dibayar",
        className: "bg-green-100 text-green-800",
      };
    case "refunded":
      return {
        label: "Dikembalikan",
        className: "bg-blue-100 text-blue-800",
      };
    default:
      return {
        label: "Belum Dibayar",
        className: "bg-amber-100 text-amber-800",
      };
  }
}

const filters: {
  value: StatusFilter;
  label: string;
}[] = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Menunggu" },
  { value: "processing", label: "Diproses" },
  { value: "shipped", label: "Dikirim" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

export default function OrdersWorkspace({
  orders,
}: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");
  const [paymentFilter, setPaymentFilter] =
    useState("all");

  const stats = useMemo(() => {
    return {
      total: orders.length,
      active: orders.filter((order) =>
        ["pending", "processing", "shipped"].includes(
          order.status
        )
      ).length,
      completed: orders.filter(
        (order) => order.status === "completed"
      ).length,
      unpaid: orders.filter(
        (order) => order.payment_status === "unpaid"
      ).length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !keyword ||
        order.order_code.toLowerCase().includes(keyword) ||
        order.items.some((item) =>
          item.product_name.toLowerCase().includes(keyword)
        );

      const matchesStatus =
        statusFilter === "all" ||
        order.status === statusFilter;

      const matchesPayment =
        paymentFilter === "all" ||
        order.payment_status === paymentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment
      );
    });
  }, [
    orders,
    search,
    statusFilter,
    paymentFilter,
  ]);

  const hasFilters =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    paymentFilter !== "all";

  function resetFilters() {
    setSearch("");
    setStatusFilter("all");
    setPaymentFilter("all");
  }

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-7 px-4 pb-16 pt-6 text-[#332417] sm:px-6 lg:px-8">
      {/* HEADER */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF0BF] px-4 py-2 text-xs font-black text-[#47763A]">
            <Package size={15} />
            PESANAN PUTARASA
          </span>

          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Pesanan{" "}
            <span className="text-[#47763A]">
              Saya
            </span>
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#8C7A65]">
            Pantau status pesanan, pembayaran, dan
            riwayat belanjamu di PUTARASA.
          </p>
        </div>

        <Link
          href="/buyer/marketplace"
          className="inline-flex items-center gap-2 rounded-xl bg-[#47763A] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#315F2E]"
        >
          <ShoppingBag size={18} />
          Belanja Lagi
          <ArrowRight size={17} />
        </Link>
      </section>

      {/* STATISTIK */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Pesanan",
            value: stats.total,
            icon: ShoppingBag,
            bg: "bg-[#FFF0BF]",
            color: "text-[#47763A]",
          },
          {
            label: "Dalam Proses",
            value: stats.active,
            icon: Truck,
            bg: "bg-[#EAF3DF]",
            color: "text-[#47763A]",
          },
          {
            label: "Selesai",
            value: stats.completed,
            icon: CheckCircle2,
            bg: "bg-[#E8F4E9]",
            color: "text-[#47763A]",
          },
          {
            label: "Belum Dibayar",
            value: stats.unpaid,
            icon: CreditCard,
            bg: "bg-[#FFF3DC]",
            color: "text-[#B7791F]",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="flex items-center justify-between gap-4 rounded-[24px] border border-[#EFE5D4] bg-white p-5 shadow-sm"
            >
              <div>
                <p className="text-xs font-bold text-[#8C7A65]">
                  {stat.label}
                </p>

                <p className="mt-2 text-3xl font-black">
                  {stat.value}
                </p>
              </div>

              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.bg}`}
              >
                <Icon
                  size={25}
                  className={stat.color}
                />
              </div>
            </div>
          );
        })}
      </section>

      {/* FILTER */}
      <section className="space-y-4 rounded-[26px] border border-[#EFE5D4] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">
              Riwayat Pesanan
            </h2>

            <p className="mt-1 text-xs text-[#8C7A65]">
              {filteredOrders.length} dari{" "}
              {orders.length} pesanan
            </p>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-[#8C7A65] hover:bg-[#F5F1E8]"
            >
              <X size={17} />
              Reset Filter
            </button>
          )}
        </div>

        {/* SEARCH DAN PEMBAYARAN */}
        <div className="grid gap-3 md:grid-cols-[1fr_230px]">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#47763A]"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Cari nomor pesanan atau nama produk..."
              className="w-full rounded-xl border border-[#E8DFD0] bg-[#FFFBF1] py-3.5 pl-11 pr-4 text-sm outline-none focus:border-[#47763A]"
            />
          </div>

          <div className="relative">
            <select
              value={paymentFilter}
              onChange={(event) =>
                setPaymentFilter(event.target.value)
              }
              aria-label="Filter pembayaran"
              className="w-full appearance-none rounded-xl border border-[#E8DFD0] bg-[#FFFBF1] px-4 py-3.5 pr-10 text-sm font-semibold outline-none focus:border-[#47763A]"
            >
              <option value="all">
                Semua Pembayaran
              </option>
              <option value="unpaid">
                Belum Dibayar
              </option>
              <option value="paid">
                Sudah Dibayar
              </option>
              <option value="refunded">
                Dikembalikan
              </option>
            </select>

            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8C7A65]"
            />
          </div>
        </div>

        {/* FILTER STATUS */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() =>
                setStatusFilter(filter.value)
              }
              className={`rounded-full px-4 py-2 text-xs font-extrabold transition ${
                statusFilter === filter.value
                  ? "bg-[#47763A] text-white"
                  : "bg-[#F5F1E8] text-[#74695B] hover:bg-[#EAF3DF]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      {/* DAFTAR PESANAN */}
      {filteredOrders.length === 0 ? (
        <section className="rounded-[30px] border border-[#EFE5D4] bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#EAF3DF]">
            <Package
              size={44}
              className="text-[#47763A]"
            />
          </div>

          <h2 className="mt-6 text-2xl font-black">
            {orders.length === 0
              ? "Belum Ada Pesanan"
              : "Pesanan Tidak Ditemukan"}
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#8C7A65]">
            {orders.length === 0
              ? "Kamu belum melakukan pembelian. Yuk, temukan produk yang kamu butuhkan di Marketplace PUTARASA."
              : "Tidak ada pesanan yang sesuai dengan pencarian atau filter yang dipilih."}
          </p>

          {orders.length === 0 ? (
            <Link
              href="/buyer/marketplace"
              className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-[#47763A] px-7 py-4 text-sm font-black text-white"
            >
              <ShoppingBag size={19} />
              Mulai Belanja
              <ArrowRight size={18} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-[#47763A] px-7 py-4 text-sm font-black text-white"
            >
              <X size={18} />
              Hapus Filter
            </button>
          )}
        </section>
      ) : (
        <section className="space-y-4">
          {filteredOrders.map((order) => {
            const status = getOrderStatus(
              order.status
            );

            const payment = getPaymentStatus(
              order.payment_status
            );

            const StatusIcon = status.icon;

            const totalQuantity = order.items.reduce(
              (total, item) =>
                total + item.quantity,
              0
            );

            return (
              <article
                key={order.id}
                className="overflow-hidden rounded-[26px] border border-[#EFE5D4] bg-white shadow-sm transition hover:shadow-md"
              >
                {/* HEADER PESANAN */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F2EADF] px-5 py-4 sm:px-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF0BF]">
                      <ShoppingBag
                        size={21}
                        className="text-[#47763A]"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-black">
                        {order.order_code}
                      </p>
                      <p className="mt-1 text-xs text-[#8C7A65]">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-extrabold ${status.className}`}
                    >
                      <StatusIcon size={14} />
                      {status.label}
                    </span>

                    <span
                      className={`inline-flex items-center rounded-full px-3 py-2 text-xs font-extrabold ${payment.className}`}
                    >
                      {payment.label}
                    </span>
                  </div>
                </div>

                {/* BODY PESANAN */}
                <div className="px-5 py-5 sm:px-6">
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wide text-[#8C7A65]">
                        Produk Dipesan
                      </p>

                      <div className="mt-3 space-y-2">
                        {order.items.slice(0, 2).map(
                          (item) => (
                            <div
                              key={item.id}
                              className="flex items-start gap-2"
                            >
                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#47763A]" />
                              <p className="text-sm font-semibold leading-6">
                                {item.product_name}
                                <span className="ml-2 text-[#8C7A65]">
                                  × {item.quantity}
                                </span>
                              </p>
                            </div>
                          )
                        )}

                        {order.items.length > 2 && (
                          <p className="pl-4 text-xs font-bold text-[#47763A]">
                            + {order.items.length - 2} produk lainnya
                          </p>
                        )}
                      </div>

                      <p className="mt-4 text-xs text-[#8C7A65]">
                        {order.items.length} jenis produk
                        {" · "}
                        {totalQuantity} total item
                      </p>
                    </div>

                    <div className="md:min-w-[210px] md:border-l md:border-[#F2EADF] md:pl-6">
                      <p className="text-xs font-bold text-[#8C7A65]">
                        Total Pesanan
                      </p>

                      <p className="mt-2 text-2xl font-black text-[#47763A]">
                        {rupiah(order.total_amount)}
                      </p>

                      <p className="mt-1 text-xs text-[#9A8974]">
                        Total tercatat
                      </p>
                    </div>
                  </div>
                </div>

                {/* FOOTER PESANAN */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#F2EADF] bg-[#FFFEFA] px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-2 text-xs text-[#8C7A65]">
                    <Leaf
                      size={17}
                      className="text-[#47763A]"
                    />
                    PUTARASA — Dari Dapur, Untuk Bumi
                  </div>

                  <Link
                    href={`/buyer/pesanan/${order.id}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#47763A] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#315F2E]"
                  >
                    Lihat Detail Pesanan
                    <ArrowRight size={17} />
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* CTA */}
      <section className="flex flex-col items-start justify-between gap-5 rounded-[26px] bg-[#FFF0BF] p-7 sm:flex-row sm:items-center sm:p-9">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-extrabold text-[#47763A]">
            <Leaf size={18} />
            Marketplace PUTARASA
          </p>

          <h2 className="text-2xl font-black">
            Siap untuk Belanja Lagi?
          </h2>

          <p className="mt-2 text-sm text-[#74695B]">
            Jelajahi produk yang bermanfaat dari
            pengolahan sampah organik.
          </p>
        </div>

        <Link
          href="/buyer/marketplace"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#47763A] px-6 py-3.5 text-sm font-extrabold text-white hover:bg-[#315F2E]"
        >
          <ShoppingBag size={18} />
          Buka Marketplace
          <ArrowRight size={17} />
        </Link>
      </section>

      <footer className="border-t border-[#EDE5D6] pt-6 text-center text-xs text-[#9A8974]">
        PUTARASA — Dari Dapur, Untuk Bumi
      </footer>
    </main>
  );
}
