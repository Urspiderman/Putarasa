
"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  History,
  MapPin,
  Package,
  Search,
  Scale,
  SlidersHorizontal,
  Truck,
  X,
} from "lucide-react";

export type SupplierHistoryItem = {
  id: string;
  waste_type: string;
  estimated_weight_kg: number;
  actual_weight_kg: number | null;
  pickup_date: string;
  pickup_time: string | null;
  address: string;
  notes: string | null;
  status: string;
  courier_id: string | null;
  created_at: string;
};

type Props = {
  requests: SupplierHistoryItem[];
};

const completedStatuses = ["completed", "picked_up"];
const cancelledStatuses = ["cancelled", "rejected"];

const formatWeight = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value);

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

function getStatusInfo(status: string) {
  const normalized = status.toLowerCase();

  if (completedStatuses.includes(normalized)) {
    return {
      label: "Selesai",
      className: "bg-[#EAF3DF] text-[#47763A]",
    };
  }

  if (cancelledStatuses.includes(normalized)) {
    return {
      label: "Dibatalkan / Ditolak",
      className: "bg-red-50 text-red-700",
    };
  }

  if (
    ["scheduled", "approved", "assigned", "accepted"].includes(
      normalized
    )
  ) {
    return {
      label: "Dijadwalkan",
      className: "bg-blue-50 text-blue-700",
    };
  }

  if (["on_the_way", "in_progress"].includes(normalized)) {
    return {
      label: "Dalam Proses",
      className: "bg-purple-50 text-purple-700",
    };
  }

  if (["pending", "requested"].includes(normalized)) {
    return {
      label: "Menunggu",
      className: "bg-[#FFF0B0] text-[#80621C]",
    };
  }

  return {
    label: status,
    className: "bg-gray-100 text-gray-700",
  };
}

function getStatusGroup(status: string) {
  const normalized = status.toLowerCase();

  if (completedStatuses.includes(normalized)) return "completed";
  if (cancelledStatuses.includes(normalized)) return "cancelled";
  return "active";
}

export default function SupplierHistoryWorkspace({
  requests,
}: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(
    null
  );

  const stats = useMemo(() => {
    const completed = requests.filter(
      (item) => getStatusGroup(item.status) === "completed"
    );

    const active = requests.filter(
      (item) => getStatusGroup(item.status) === "active"
    );

    const totalWeight = completed.reduce(
      (sum, item) =>
        sum + Number(item.actual_weight_kg ?? 0),
      0
    );

    return {
      total: requests.length,
      completed: completed.length,
      active: active.length,
      totalWeight,
    };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return requests.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.waste_type.toLowerCase().includes(keyword) ||
        item.address.toLowerCase().includes(keyword) ||
        item.status.toLowerCase().includes(keyword);

      const matchesFilter =
        filter === "all" ||
        getStatusGroup(item.status) === filter;

      return matchesSearch && matchesFilter;
    });
  }, [requests, search, filter]);

  const statCards = [
    {
      label: "Total Permintaan",
      value: formatWeight(stats.total),
      icon: History,
      bg: "bg-[#FFF0B0]",
    },
    {
      label: "Masih Aktif",
      value: formatWeight(stats.active),
      icon: Clock3,
      bg: "bg-[#E7F2F1]",
    },
    {
      label: "Selesai",
      value: formatWeight(stats.completed),
      icon: CheckCircle2,
      bg: "bg-[#EAF3DF]",
    },
    {
      label: "Sampah Terkumpul",
      value: `${formatWeight(stats.totalWeight)} kg`,
      icon: Scale,
      bg: "bg-[#F5EAF2]",
    },
  ];

  return (
    <div className="space-y-7">
      {/* STATISTICS */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-[24px] border border-[#EFE5D4] bg-white p-5 shadow-sm"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg}`}
              >
                <Icon size={24} className="text-[#47763A]" />
              </div>

              <p className="mt-5 text-sm font-bold text-[#8C7A65]">
                {stat.label}
              </p>

              <p className="mt-2 text-3xl font-black text-[#332417]">
                {stat.value}
              </p>
            </div>
          );
        })}
      </section>

      {/* SEARCH AND FILTER */}
      <section className="rounded-[26px] border border-[#EFE5D4] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-black text-[#332417]">
              Daftar Riwayat
            </h2>

            <p className="mt-1 text-sm text-[#8C7A65]">
              Telusuri seluruh permintaan penjemputanmu.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C7A65]"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari jenis sampah atau alamat..."
                aria-label="Cari riwayat"
                className="w-full rounded-2xl border border-[#E8DFD0] bg-[#FFFBF1] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#47763A] sm:w-72"
              />
            </div>

            <div className="relative">
              <SlidersHorizontal
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#47763A]"
              />

              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                aria-label="Filter status riwayat"
                className="w-full appearance-none rounded-2xl border border-[#E8DFD0] bg-[#FFFBF1] py-3 pl-11 pr-10 text-sm font-bold outline-none focus:border-[#47763A] sm:w-48"
              >
                <option value="all">Semua Status</option>
                <option value="active">Masih Aktif</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">
                  Dibatalkan / Ditolak
                </option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8C7A65]"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#F0E8DC] pt-4">
          <p className="text-sm text-[#8C7A65]">
            Menampilkan{" "}
            <strong className="text-[#332417]">
              {filteredRequests.length}
            </strong>{" "}
            dari {requests.length} permintaan
          </p>

          {(search || filter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
              className="inline-flex items-center gap-2 text-xs font-black text-[#47763A] hover:underline"
            >
              <X size={15} />
              Reset Filter
            </button>
          )}
        </div>

        {/* HISTORY LIST */}
        {filteredRequests.length === 0 ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-[#DCD2C2] bg-[#FFFBF1] px-6 py-14 text-center">
            <History
              size={40}
              className="mx-auto text-[#47763A]"
            />

            <h3 className="mt-4 text-lg font-black">
              {requests.length === 0
                ? "Belum Ada Riwayat"
                : "Riwayat Tidak Ditemukan"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8C7A65]">
              {requests.length === 0
                ? "Permintaan penjemputan yang kamu buat akan muncul di sini."
                : "Coba gunakan kata kunci atau filter status yang berbeda."}
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filteredRequests.map((item) => {
              const status = getStatusInfo(item.status);
              const expanded = expandedId === item.id;

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-[22px] border border-[#EEE5D7] bg-[#FFFBF1]"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3DF]">
                          <Package
                            size={23}
                            className="text-[#47763A]"
                          />
                        </div>

                        <div>
                          <h3 className="text-base font-black text-[#332417]">
                            {item.waste_type}
                          </h3>

                          <p className="mt-1 text-xs text-[#8C7A65]">
                            Diajukan:{" "}
                            {formatCreatedAt(item.created_at)}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-3 py-2 text-xs font-black ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-3">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarDays
                          size={18}
                          className="shrink-0 text-[#47763A]"
                        />

                        <div>
                          <p className="text-xs text-[#8C7A65]">
                            Tanggal
                          </p>
                          <p className="mt-1 font-bold">
                            {formatDate(item.pickup_date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Scale
                          size={18}
                          className="shrink-0 text-[#47763A]"
                        />

                        <div>
                          <p className="text-xs text-[#8C7A65]">
                            Estimasi Berat
                          </p>
                          <p className="mt-1 font-bold">
                            {formatWeight(
                              Number(item.estimated_weight_kg)
                            )}{" "}
                            kg
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Truck
                          size={18}
                          className="shrink-0 text-[#47763A]"
                        />

                        <div>
                          <p className="text-xs text-[#8C7A65]">
                            Kurir
                          </p>
                          <p className="mt-1 font-bold">
                            {item.courier_id
                              ? "Sudah Ditugaskan"
                              : "Belum Ditugaskan"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(expanded ? null : item.id)
                      }
                      aria-expanded={expanded}
                      className="mt-5 flex w-full items-center justify-between border-t border-[#EDE5D6] pt-4 text-sm font-black text-[#47763A]"
                    >
                      {expanded
                        ? "Tutup Detail"
                        : "Lihat Detail Penjemputan"}

                      {expanded ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>
                  </div>

                  {expanded && (
                    <div className="space-y-4 border-t border-[#EDE5D6] bg-white p-5 sm:p-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs text-[#8C7A65]">
                            Tanggal Penjemputan
                          </p>
                          <p className="mt-1 text-sm font-bold">
                            {formatDate(item.pickup_date)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#8C7A65]">
                            Waktu Penjemputan
                          </p>
                          <p className="mt-1 text-sm font-bold">
                            {item.pickup_time
                              ? `${item.pickup_time} WIB`
                              : "Belum ditentukan"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#8C7A65]">
                            Berat Estimasi
                          </p>
                          <p className="mt-1 text-sm font-bold">
                            {formatWeight(
                              Number(item.estimated_weight_kg)
                            )}{" "}
                            kg
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#8C7A65]">
                            Berat Aktual
                          </p>
                          <p className="mt-1 text-sm font-bold">
                            {item.actual_weight_kg == null
                              ? "Belum ditimbang"
                              : `${formatWeight(
                                  Number(item.actual_weight_kg)
                                )} kg`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-2xl bg-[#FFFBF1] p-4">
                        <MapPin
                          size={19}
                          className="mt-0.5 shrink-0 text-[#47763A]"
                        />

                        <div>
                          <p className="text-xs font-bold text-[#8C7A65]">
                            Alamat Penjemputan
                          </p>
                          <p className="mt-1 text-sm leading-6">
                            {item.address}
                          </p>
                        </div>
                      </div>

                      {item.notes && (
                        <div className="rounded-2xl bg-[#FFFBF1] p-4">
                          <p className="text-xs font-bold text-[#8C7A65]">
                            Catatan Tambahan
                          </p>
                          <p className="mt-2 text-sm leading-6">
                            {item.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
