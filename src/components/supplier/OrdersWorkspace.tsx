
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Clock3,
  Package,
  Search,
  ShoppingBag,
  Wallet,
} from "lucide-react";

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

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Menunggu",
    confirmed: "Dikonfirmasi",
    processing: "Diproses",
    packed: "Dikemas",
    shipped: "Dikirim",
    delivered: "Selesai Dikirim",
    completed: "Selesai",
    cancelled: "Dibatalkan",
    canceled: "Dibatalkan",
  };

  return (
    labels[status] ??
    status.replace(/_/g, " ")
  );
}

function paymentLabel(status: string) {
  const labels: Record<string, string> = {
    unpaid: "Belum Dibayar",
    pending: "Menunggu Pembayaran",
    paid: "Sudah Dibayar",
    failed: "Pembayaran Gagal",
    refunded: "Dikembalikan",
  };

  return (
    labels[status] ??
    status.replace(/_/g, " ")
  );
}

function statusClass(status: string) {
  if (
    status === "completed" ||
    status === "delivered"
  ) {
    return "bg-[#EAF3DF] text-[#47763A]";
  }

  if (
    status === "cancelled" ||
    status === "canceled"
  ) {
    return "bg-red-50 text-red-700";
  }

  if (
    status === "shipped" ||
    status === "processing" ||
    status === "packed"
  ) {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-[#FFF0BF] text-[#775B15]";
}

export default function OrdersWorkspace({
  orders,
}: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !keyword ||
        order.order_code
          .toLowerCase()
          .includes(keyword) ||
        order.customer_name
          .toLowerCase()
          .includes(keyword) ||
        order.items.some((item) =>
          item.product_name
            .toLowerCase()
            .includes(keyword)
        );

      const matchesFilter =
        filter === "all" ||
        (filter === "pending" &&
          ["pending", "confirmed", "processing", "packed"].includes(
            order.status
          )) ||
        (filter === "shipped" &&
          order.status === "shipped") ||
        (filter === "completed" &&
          ["completed", "delivered"].includes(
            order.status
          )) ||
        (filter === "cancelled" &&
          ["cancelled", "canceled"].includes(
            order.status
          ));

      return matchesSearch && matchesFilter;
    });
  }, [orders, search, filter]);

  const totalSpent = orders
    .filter(
      (order) =>
        !["cancelled", "canceled"].includes(
          order.status
        )
    )
    .reduce(
      (total, order) =>
        total + order.total_amount,
      0
    );

  const pendingCount = orders.filter(
    (order) =>
      ["pending", "confirmed", "processing", "packed"].includes(
        order.status
      )
  ).length;

  const completedCount = orders.filter(
    (order) =>
      ["completed", "delivered"].includes(
        order.status
      )
  ).length;

  const filters = [
    { value: "all", label: "Semua" },
    { value: "pending", label: "Diproses" },
    { value: "shipped", label: "Dikirim" },
    { value: "completed", label: "Selesai" },
    { value: "cancelled", label: "Dibatalkan" },
  ];

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-7 px-4 pb-16 pt-6 text-[#332417] sm:px-6 lg:px-8">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/supplier/dashboard"
          className="font-bold text-[#47763A] hover:underline"
        >
          Dashboard
        </Link>

        <ChevronRight
          size={16}
          className="text-[#B7A995]"
        />

        <span className="font-bold">
          Pesanan Saya
        </span>
      </div>

      {/* HEADER */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF0BF] px-4 py-2 text-xs font-black text-[#47763A]">
            <ClipboardList size={15} />
            PESANAN PUTARASA
          </span>

          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Pesanan{" "}
            <span className="text-[#47763A]">
              Saya
            </span>
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#8C7A65]">
            Pantau status, pembayaran, dan detail
            seluruh pesananmu.
          </p>
        </div>

        <Link
          href="/supplier/marketplace"
          className="inline-flex items-center gap-2 rounded-xl bg-[#47763A] px-5 py-3 text-sm font-black text-white transition hover:bg-[#315F2E]"
        >
          <ShoppingBag size={18} />
          Belanja Lagi
          <ArrowRight size={17} />
        </Link>
      </section>

      {/* STATISTIK */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[24px] border border-[#EFE5D4] bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF0BF]">
            <Package
              size={22}
              className="text-[#47763A]"
            />
          </div>

          <p className="mt-4 text-xs font-bold text-[#8C7A65]">
            Total Pesanan
          </p>

          <p className="mt-1 text-3xl font-black">
            {orders.length}
          </p>
        </div>

        <div className="rounded-[24px] border border-[#EFE5D4] bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF3DF]">
            <Clock3
              size={22}
              className="text-[#47763A]"
            />
          </div>

          <p className="mt-4 text-xs font-bold text-[#8C7A65]">
            Sedang Diproses
          </p>

          <p className="mt-1 text-3xl font-black">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-[24px] border border-[#EFE5D4] bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF3DF]">
            <Wallet
              size={22}
              className="text-[#47763A]"
            />
          </div>

          <p className="mt-4 text-xs font-bold text-[#8C7A65]">
            Nilai Pesanan Aktif
          </p>

          <p className="mt-1 text-2xl font-black text-[#47763A]">
            {rupiah(totalSpent)}
          </p>

          <p className="mt-2 text-xs text-[#8C7A65]">
            {completedCount} pesanan selesai
          </p>
        </div>
      </div>

      {/* FILTER */}
      <section className="rounded-[24px] border border-[#EFE5D4] bg-white p-5 shadow-sm">
        <div className="relative">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C7A65]"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Cari nomor pesanan atau nama produk..."
            className="w-full rounded-xl border border-[#E8DFD0] bg-[#FFFBF1] py-3.5 pl-12 pr-4 text-sm outline-none focus:border-[#47763A]"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() =>
                setFilter(item.value)
              }
              className={`rounded-xl px-4 py-2.5 text-xs font-black transition ${
                filter === item.value
                  ? "bg-[#47763A] text-white"
                  : "bg-[#F7F3EA] text-[#74695B] hover:bg-[#EAF3DF]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* DAFTAR PESANAN */}
      {filteredOrders.length === 0 ? (
        <section className="rounded-[28px] border border-[#EFE5D4] bg-white px-6 py-14 text-center">
          <Package
            size={50}
            className="mx-auto text-[#47763A]"
          />

          <h2 className="mt-5 text-xl font-black">
            {orders.length === 0
              ? "Belum Ada Pesanan"
              : "Pesanan Tidak Ditemukan"}
          </h2>

          <p className="mt-3 text-sm text-[#8C7A65]">
            {orders.length === 0
              ? "Pesanan yang kamu buat akan muncul di sini."
              : "Coba gunakan kata kunci atau filter lain."}
          </p>

          {orders.length === 0 && (
            <Link
              href="/supplier/marketplace"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#47763A] px-6 py-3 text-sm font-black text-white"
            >
              Mulai Belanja
              <ArrowRight size={18} />
            </Link>
          )}
        </section>
      ) : (
        <section className="space-y-4">
          {filteredOrders.map((order) => (
            <article
              key={order.id}
              className="overflow-hidden rounded-[26px] border border-[#EFE5D4] bg-white shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F2EADF] bg-[#FFFCF6] p-5 sm:px-6">
                <div>
                  <p className="text-xs font-bold text-[#8C7A65]">
                    Nomor Pesanan
                  </p>

                  <p className="mt-1 font-black text-[#47763A]">
                    {order.order_code}
                  </p>

                  <p className="mt-2 flex items-center gap-2 text-xs text-[#8C7A65]">
                    <CalendarDays size={14} />
                    {formatDate(order.created_at)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-2 text-xs font-black ${statusClass(
                      order.status
                    )}`}
                  >
                    {statusLabel(order.status)}
                  </span>

                  <span
                    className={`rounded-full px-3 py-2 text-xs font-black ${
                      order.payment_status === "paid"
                        ? "bg-[#EAF3DF] text-[#47763A]"
                        : "bg-[#FFF0BF] text-[#775B15]"
                    }`}
                  >
                    {paymentLabel(
                      order.payment_status
                    )}
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <p className="text-xs font-bold text-[#8C7A65]">
                  Penerima
                </p>

                <p className="mt-1 font-black">
                  {order.customer_name}
                </p>

                <div className="mt-4 space-y-2">
                  {order.items.slice(0, 3).map(
                    (item) => (
                      <div
                        key={item.id}
                        className="flex justify-between gap-4 text-sm"
                      >
                        <span className="text-[#74695B]">
                          {item.product_name} ×{" "}
                          {item.quantity}
                        </span>

                        <span className="font-bold">
                          {rupiah(item.subtotal)}
                        </span>
                      </div>
                    )
                  )}

                  {order.items.length > 3 && (
                    <p className="text-xs font-bold text-[#47763A]">
                      +{order.items.length - 3} produk lainnya
                    </p>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[#F2EADF] pt-5">
                  <div>
                    <p className="text-xs text-[#8C7A65]">
                      Total Pesanan
                    </p>

                    <p className="mt-1 text-xl font-black text-[#47763A]">
                      {rupiah(order.total_amount)}
                    </p>
                  </div>

                  <Link
                    href={`/supplier/pesanan/${order.id}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#47763A] px-5 py-3 text-sm font-black text-white transition hover:bg-[#315F2E]"
                  >
                    Lihat Detail
                    <ArrowRight size={17} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <footer className="border-t border-[#EDE5D6] pt-6 text-center text-xs text-[#9A8974]">
        PUTARASA — Dari Dapur, Untuk Bumi
      </footer>
    </main>
  );
}
