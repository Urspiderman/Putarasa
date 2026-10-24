
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  History,
  Leaf,
  MapPin,
  PackageCheck,
  Search,
  Truck,
  Weight,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

export type CourierHistoryItem = {
  id: string;
  type: "pickup" | "delivery";
  title: string;
  reference: string;
  person: string;
  address: string;
  date: string | null;
  status: string;
  weightKg: number | null;
  amount: number | null;
};

type Props = {
  history: CourierHistoryItem[];
  errorMessage: string | null;
};

type FilterType = "all" | "pickup" | "delivery";

function formatDate(value: string | null) {
  if (!value) return "Tanggal belum tersedia";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tanggal tidak tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function formatWeight(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusLabel(status: string) {
  if (status === "completed") return "Selesai";
  if (status === "picked_up") return "Sudah Dijemput";

  return status.replace(/_/g, " ");
}

export default function CourierHistoryWorkspace({
  history,
  errorMessage,
}: Props) {
  const [filter, setFilter] =
    useState<FilterType>("all");

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const pageSize = 6;

  const pickupCount = history.filter(
    (item) => item.type === "pickup"
  ).length;

  const deliveryCount = history.filter(
    (item) => item.type === "delivery"
  ).length;

  const totalWeight = history
    .filter((item) => item.type === "pickup")
    .reduce(
      (total, item) => total + (item.weightKg ?? 0),
      0
    );

  const filteredHistory = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return history.filter((item) => {
      const matchesType =
        filter === "all" || item.type === filter;

      const matchesSearch =
        !keyword ||
        [
          item.title,
          item.reference,
          item.person,
          item.address,
          getStatusLabel(item.status),
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      return matchesType && matchesSearch;
    });
  }, [history, filter, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredHistory.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const visibleHistory = filteredHistory.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function changeFilter(value: FilterType) {
    setFilter(value);
    setPage(1);
  }

  function changeSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function resetFilters() {
    setFilter("all");
    setSearch("");
    setPage(1);
  }

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
            Riwayat
          </span>
        </div>

        {/* HEADER */}
        <section className="relative overflow-hidden rounded-[30px] bg-[#FFDA57] p-7 sm:p-9">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/20" />
          <div className="absolute -bottom-28 right-36 h-56 w-56 rounded-full bg-white/15" />

          <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/65 px-4 py-2 text-xs font-black text-[#47763A]">
                <History size={15} />
                RIWAYAT OPERASIONAL
              </span>

              <h1 className="mt-5 text-3xl font-black sm:text-4xl">
                Riwayat Pekerjaan
                <span className="block text-[#47763A]">
                  Kurir PUTARASA
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[#655221] sm:text-base">
                Lihat kembali penjemputan sampah
                organik dan pengantaran produk
                Marketplace yang telah berhasil
                diselesaikan.
              </p>

              <Link
                href="/courier/tugas"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#47763A] px-6 py-3.5 text-sm font-black text-white transition hover:bg-[#315F2E]"
              >
                Lihat Tugas Aktif
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="hidden shrink-0 lg:flex">
              <div className="flex h-44 w-44 items-center justify-center rounded-[42px] bg-[#47763A] text-white shadow-xl">
                <ClipboardList
                  size={90}
                  strokeWidth={1.3}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ERROR */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5"
          >
            <AlertCircle
              size={21}
              className="shrink-0 text-red-600"
            />

            <div>
              <p className="font-black text-red-700">
                Gagal Memuat Sebagian Riwayat
              </p>

              <p className="mt-1 text-sm leading-6 text-red-600">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        {/* STATS */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Total Selesai",
              value: history.length.toString(),
              subtitle: "Seluruh pekerjaan selesai",
              icon: CheckCircle2,
              color: "bg-[#E8F2DE] text-[#47763A]",
            },
            {
              title: "Penjemputan",
              value: pickupCount.toString(),
              subtitle: "Sampah organik dijemput",
              icon: Leaf,
              color: "bg-[#FFF0B5] text-[#866500]",
            },
            {
              title: "Pengantaran",
              value: deliveryCount.toString(),
              subtitle: "Pesanan telah diantar",
              icon: Truck,
              color: "bg-blue-100 text-blue-700",
            },
            {
              title: "Total Sampah",
              value: `${formatWeight(totalWeight)} kg`,
              subtitle: "Berat sampah tercatat",
              icon: Weight,
              color: "bg-green-100 text-green-700",
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-[24px] border border-[#EAE3D6] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.color}`}
                >
                  <Icon size={24} />
                </div>

                <p className="mt-5 text-2xl font-black sm:text-3xl">
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

        {/* HISTORY SECTION */}
        <section className="rounded-[28px] border border-[#EAE3D6] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-black">
                <History
                  size={22}
                  className="text-[#47763A]"
                />
                Daftar Riwayat
              </h2>

              <p className="mt-1 text-sm text-[#8C7A65]">
                Telusuri seluruh pekerjaan yang
                telah selesai.
              </p>
            </div>

            <span className="rounded-full bg-[#E8F2DE] px-4 py-2 text-xs font-black text-[#47763A]">
              {filteredHistory.length} Riwayat
            </span>
          </div>

          {/* FILTERS */}
          <div className="mt-6 flex flex-col gap-4 border-b border-[#EFE8DC] pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                {
                  label: "Semua",
                  value: "all" as const,
                  count: history.length,
                },
                {
                  label: "Penjemputan",
                  value: "pickup" as const,
                  count: pickupCount,
                },
                {
                  label: "Pengantaran",
                  value: "delivery" as const,
                  count: deliveryCount,
                },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() =>
                    changeFilter(item.value)
                  }
                  className={`rounded-xl px-4 py-2.5 text-xs font-black transition ${
                    filter === item.value
                      ? "bg-[#47763A] text-white"
                      : "bg-[#F7F3EA] text-[#776957] hover:bg-[#E8F2DE]"
                  }`}
                >
                  {item.label} ({item.count})
                </button>
              ))}
            </div>

            <div className="relative w-full lg:max-w-xs">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A8974]"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  changeSearch(event.target.value)
                }
                placeholder="Cari kode, nama, lokasi..."
                aria-label="Cari riwayat pekerjaan"
                className="w-full rounded-xl border border-[#EAE3D6] bg-[#FFFBF1] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#47763A] focus:ring-2 focus:ring-[#47763A]/10"
              />
            </div>
          </div>

          {/* LIST */}
          <div className="mt-6 space-y-3">
            {visibleHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#EAE3D6] bg-[#FFFBF1] px-5 py-14 text-center">
                <PackageCheck
                  size={44}
                  className="text-[#47763A]"
                />

                <h3 className="mt-4 text-base font-black">
                  Belum Ada Riwayat
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-[#8C7A65]">
                  {history.length === 0
                    ? "Riwayat akan muncul setelah kamu menyelesaikan tugas penjemputan atau pengantaran."
                    : "Tidak ada riwayat yang cocok dengan filter atau pencarian."}
                </p>

                {(filter !== "all" || search) && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#47763A] px-4 py-2.5 text-sm font-black text-white"
                  >
                    <RotateCcw size={16} />
                    Reset Filter
                  </button>
                )}
              </div>
            ) : (
              visibleHistory.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[#EFE8DC] bg-[#FFFEFB] p-4 transition hover:border-[#B9CEAD] sm:p-5"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                          item.type === "pickup"
                            ? "bg-[#E8F2DE] text-[#47763A]"
                            : "bg-[#FFF0B5] text-[#866500]"
                        }`}
                      >
                        {item.type === "pickup" ? (
                          <Leaf size={24} />
                        ) : (
                          <Truck size={24} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-black sm:text-base">
                            {item.title}
                          </h3>

                          <span className="rounded-full bg-[#E8F4E5] px-3 py-1 text-[11px] font-black text-[#47763A]">
                            {getStatusLabel(
                              item.status
                            )}
                          </span>
                        </div>

                        <p className="mt-1 text-xs font-bold text-[#8C7A65]">
                          Kode: {item.reference}
                        </p>

                        <p className="mt-2 text-sm text-[#776957]">
                          {item.person}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 rounded-xl bg-[#F7F3EA] px-4 py-2 text-xs font-bold text-[#776957]">
                      <CalendarDays
                        size={14}
                        className="mr-1.5 inline-block"
                      />
                      {formatDate(item.date)}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 border-t border-[#EFE8DC] pt-4 sm:grid-cols-2">
                    <div className="flex items-start gap-2 text-sm text-[#776957]">
                      <MapPin
                        size={17}
                        className="mt-0.5 shrink-0 text-[#47763A]"
                      />

                      <span className="break-words">
                        {item.address}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-[#776957]">
                      {item.type === "pickup" ? (
                        <>
                          <Weight
                            size={17}
                            className="text-[#47763A]"
                          />

                          <span>
                            Berat tercatat:{" "}
                            <strong className="text-[#332417]">
                              {item.weightKg !== null
                                ? `${formatWeight(item.weightKg)} kg`
                                : "-"}
                            </strong>
                          </span>
                        </>
                      ) : (
                        <>
                          <PackageCheck
                            size={17}
                            className="text-[#47763A]"
                          />

                          <span>
                            Nilai pesanan:{" "}
                            <strong className="text-[#332417]">
                              {item.amount !== null
                                ? formatCurrency(item.amount)
                                : "-"}
                            </strong>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* PAGINATION */}
          {filteredHistory.length > pageSize && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#EFE8DC] pt-5">
              <p className="text-xs text-[#8C7A65]">
                Menampilkan{" "}
                {(currentPage - 1) * pageSize + 1}–
                {Math.min(
                  currentPage * pageSize,
                  filteredHistory.length
                )}{" "}
                dari {filteredHistory.length} riwayat
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() =>
                    setPage((value) =>
                      Math.max(1, value - 1)
                    )
                  }
                  className="rounded-xl border border-[#EAE3D6] px-4 py-2 text-xs font-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Sebelumnya
                </button>

                <span className="px-2 text-xs font-black">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setPage((value) =>
                      Math.min(
                        totalPages,
                        value + 1
                      )
                    )
                  }
                  className="rounded-xl border border-[#EAE3D6] px-4 py-2 text-xs font-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          )}
        </section>

        {/* BOTTOM */}
        <section className="flex flex-col justify-between gap-5 rounded-[28px] bg-[#47763A] p-6 text-white sm:flex-row sm:items-center sm:p-7">
          <div>
            <h2 className="text-lg font-black">
              Masih Ada Tugas Berikutnya?
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">
              Buka halaman Operasional untuk
              melihat lokasi penjemputan dan
              pengantaran yang sedang berjalan.
            </p>
          </div>

          <Link
            href="/courier/operasional"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#FFDA57] px-5 py-3.5 text-sm font-black text-[#332417] transition hover:bg-[#FFE487]"
          >
            Buka Operasional
            <ArrowRight size={17} />
          </Link>
        </section>

        <footer className="border-t border-[#EDE5D6] py-5 text-center text-xs text-[#9A8974]">
          PUTARASA — Riwayat Kurir
        </footer>
      </div>
    </main>
  );
}
