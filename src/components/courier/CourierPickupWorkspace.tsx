
"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  Truck,
  Search,
  MapPin,
  CalendarDays,
  Scale,
  CheckCircle2,
  Navigation,
  Loader2,
  ClipboardList,
  Clock3,
  PackageCheck,
  ArrowRight,
  Leaf,
  X,
  Info,
} from "lucide-react";

import {
  updateCourierPickup,
  type CourierPickupAction,
} from "@/app/courier/tugas/actions";

export type CourierPickup = {
  id: string;
  address: string;
  pickup_date: string;
  pickup_time: string | null;
  waste_type: string;
  estimated_weight_kg: number;
  actual_weight_kg: number | null;
  notes: string | null;
  status: string;
  created_at: string;
};

const filters = [
  { value: "all", label: "Semua Tugas" },
  { value: "assigned", label: "Ditugaskan" },
  { value: "on_the_way", label: "Dalam Perjalanan" },
  { value: "completed", label: "Selesai" },
];

function formatDate(value: string) {
  if (!value) return "-";

  const date = new Date(
    `${value.slice(0, 10)}T12:00:00Z`
  );

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatWeight(value: number) {
  return Number(value).toLocaleString("id-ID", {
    maximumFractionDigits: 2,
  });
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<
    string,
    { label: string; className: string }
  > = {
    assigned: {
      label: "Ditugaskan",
      className: "bg-blue-50 text-blue-700",
    },
    on_the_way: {
      label: "Dalam Perjalanan",
      className: "bg-violet-50 text-violet-700",
    },
    completed: {
      label: "Selesai",
      className: "bg-green-50 text-green-700",
    },
    cancelled: {
      label: "Dibatalkan",
      className: "bg-red-50 text-red-700",
    },
  };

  const config = configs[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export default function CourierPickupWorkspace({
  pickups,
}: {
  pickups: CourierPickup[];
}) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [selected, setSelected] =
    useState<CourierPickup | null>(null);

  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");

  const [pending, startTransition] = useTransition();

  const activeCount = pickups.filter((item) =>
    ["assigned", "on_the_way"].includes(item.status)
  ).length;

  const completedCount = pickups.filter(
    (item) => item.status === "completed"
  ).length;

  const totalWeight = pickups
    .filter((item) => item.status === "completed")
    .reduce(
      (total, item) =>
        total + Number(item.actual_weight_kg || 0),
      0
    );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return pickups.filter((item) => {
      const matchSearch =
        !query ||
        item.address.toLowerCase().includes(query) ||
        item.waste_type.toLowerCase().includes(query);

      const matchFilter =
        filter === "all" || item.status === filter;

      return matchSearch && matchFilter;
    });
  }, [pickups, search, filter]);

  function openDetail(item: CourierPickup) {
    setSelected(item);
    setWeight(
      item.actual_weight_kg?.toString() ?? ""
    );
    setError("");
  }

  function closeDetail() {
    if (pending) return;
    setSelected(null);
    setError("");
  }

  function handleAction(action: CourierPickupAction) {
    if (!selected || pending) return;

    if (action === "complete") {
      const parsedWeight = Number(weight);

      if (
        !weight.trim() ||
        !Number.isFinite(parsedWeight) ||
        parsedWeight <= 0
      ) {
        setError("Masukkan berat aktual yang valid.");
        return;
      }
    }

    const pickupId = selected.id;
    const actualWeight =
      action === "complete"
        ? Number(weight)
        : undefined;

    setError("");

    startTransition(async () => {
      try {
        const result = await updateCourierPickup(
          pickupId,
          action,
          actualWeight
        );

        if (!result.success) {
          setError(result.message);
          return;
        }

        setSelected(null);
        router.refresh();
      } catch {
        setError(
          "Terjadi kesalahan saat memperbarui tugas."
        );
      }
    });
  }

  const statCards = [
    {
      label: "Total Tugas",
      value: pickups.length,
      icon: ClipboardList,
      bg: "bg-[#FFF0BF]",
      color: "text-[#9A7200]",
    },
    {
      label: "Tugas Aktif",
      value: activeCount,
      icon: Clock3,
      bg: "bg-blue-50",
      color: "text-blue-700",
    },
    {
      label: "Tugas Selesai",
      value: completedCount,
      icon: CheckCircle2,
      bg: "bg-green-50",
      color: "text-green-700",
    },
  ];

  return (
    <div className="space-y-7">
      {/* STATISTIK */}
      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-[22px] border border-[#EFE5D6] bg-white p-6 shadow-sm"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.bg} ${card.color}`}
              >
                <Icon size={23} />
              </div>

              <p className="mt-5 text-sm text-[#817361]">
                {card.label}
              </p>

              <p className="mt-2 text-3xl font-black text-[#332417]">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* RINGKASAN BERAT */}
      <div className="flex flex-col gap-4 rounded-[24px] bg-[#47763A] p-7 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[#E6F2DC]">
            <Leaf size={18} />
            <span className="text-xs font-bold tracking-wide">
              KONTRIBUSI PENGUMPULAN
            </span>
          </div>

          <h2 className="text-3xl font-black">
            {formatWeight(totalWeight)} kg
          </h2>

          <p className="mt-2 text-sm text-[#E6F2DC]">
            Total sampah organik yang berhasil kamu jemput.
          </p>
        </div>

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
          <Scale size={32} />
        </div>
      </div>

      {/* DAFTAR TUGAS */}
      <div className="rounded-[24px] border border-[#EFE5D6] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-black text-[#332417]">
              Daftar Tugas Penjemputan
            </h2>

            <p className="mt-2 text-sm text-[#817361]">
              Kelola tugas penjemputan yang diberikan Admin.
            </p>
          </div>

          <div className="relative w-full lg:max-w-xs">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A09483]"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Cari alamat atau jenis sampah..."
              className="w-full rounded-xl border border-[#E9E1D6] bg-[#FFFCF7] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#E4AB00]"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              aria-pressed={filter === item.value}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                filter === item.value
                  ? "bg-[#FFDA57] text-[#332417]"
                  : "bg-[#F7F3EB] text-[#817361] hover:bg-[#FFF0BF]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <PackageCheck
              size={44}
              className="mx-auto text-[#D6B76C]"
            />

            <p className="mt-4 font-bold text-[#332417]">
              Tidak Ada Tugas Ditemukan
            </p>

            <p className="mt-2 text-sm text-[#817361]">
              Tugas dari Admin akan muncul di halaman ini.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="rounded-[20px] border border-[#EFE5D6] bg-[#FFFEFB] p-5 transition hover:border-[#E6C56E]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0BF] text-[#9A7200]">
                    <Truck size={22} />
                  </div>

                  <StatusBadge status={item.status} />
                </div>

                <h3 className="mt-5 text-lg font-black text-[#332417]">
                  {item.waste_type}
                </h3>

                <div className="mt-4 space-y-3 text-sm text-[#817361]">
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={17}
                      className="mt-0.5 shrink-0 text-[#B68A19]"
                    />
                    <span>{item.address}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <CalendarDays
                      size={17}
                      className="text-[#B68A19]"
                    />
                    <span>
                      {formatDate(item.pickup_date)}
                      {item.pickup_time
                        ? ` • ${item.pickup_time}`
                        : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Scale
                      size={17}
                      className="text-[#B68A19]"
                    />
                    <span>
                      Estimasi{" "}
                      <strong>
                        {formatWeight(
                          item.estimated_weight_kg
                        )}{" "}
                        kg
                      </strong>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openDetail(item)}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFF0BF] px-4 py-3 text-sm font-bold text-[#8D6800] transition hover:bg-[#FFE39A]"
                >
                  Lihat Detail Tugas
                  <ArrowRight size={17} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DETAIL */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDetail();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="courier-task-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[26px] bg-white p-7 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="courier-task-title"
                  className="text-xl font-black text-[#332417]"
                >
                  Detail Tugas
                </h2>

                <p className="mt-1 text-xs text-[#817361]">
                  Informasi lengkap penjemputan sampah
                </p>
              </div>

              <button
                type="button"
                onClick={closeDetail}
                disabled={pending}
                aria-label="Tutup detail"
                className="rounded-lg p-2 hover:bg-[#F7F3EB] disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#FFFAED] p-5">
              <div>
                <p className="text-xs text-[#817361]">
                  Status Tugas
                </p>

                <div className="mt-2">
                  <StatusBadge status={selected.status} />
                </div>
              </div>

              <Truck
                size={30}
                className="text-[#B68A19]"
              />
            </div>

            <div className="mt-6 space-y-5">
              <div className="flex gap-3">
                <MapPin
                  size={19}
                  className="shrink-0 text-[#B68A19]"
                />

                <div>
                  <p className="text-xs text-[#817361]">
                    Alamat Penjemputan
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#332417]">
                    {selected.address}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CalendarDays
                  size={19}
                  className="text-[#B68A19]"
                />

                <div>
                  <p className="text-xs text-[#817361]">
                    Jadwal
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#332417]">
                    {formatDate(selected.pickup_date)}
                    {selected.pickup_time
                      ? ` • ${selected.pickup_time}`
                      : ""}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Scale
                  size={19}
                  className="text-[#B68A19]"
                />

                <div>
                  <p className="text-xs text-[#817361]">
                    Jenis dan Estimasi Sampah
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#332417]">
                    {selected.waste_type} •{" "}
                    {formatWeight(
                      selected.estimated_weight_kg
                    )}{" "}
                    kg
                  </p>
                </div>
              </div>

              {selected.notes && (
                <div className="rounded-xl bg-[#F7F3EB] p-4">
                  <div className="flex items-center gap-2 text-[#817361]">
                    <Info size={16} />
                    <span className="text-xs font-bold">
                      Catatan Supplier
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-[#332417]">
                    {selected.notes}
                  </p>
                </div>
              )}
            </div>

            {selected.status === "assigned" && (
              <button
                type="button"
                disabled={pending}
                onClick={() => handleAction("on_the_way")}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFDA57] px-5 py-3.5 font-extrabold text-[#332417] transition hover:bg-[#FFCA2C] disabled:opacity-60"
              >
                {pending ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Navigation size={18} />
                )}
                Mulai Perjalanan
              </button>
            )}

            {selected.status === "on_the_way" && (
              <div className="mt-7 border-t border-[#EFE5D6] pt-6">
                <h3 className="font-black text-[#332417]">
                  Konfirmasi Penjemputan
                </h3>

                <p className="mt-2 text-xs text-[#817361]">
                  Timbang sampah yang berhasil dikumpulkan,
                  lalu masukkan berat aktual.
                </p>

                <label
                  htmlFor="courier-actual-weight"
                  className="mb-2 mt-5 block text-sm font-bold"
                >
                  Berat Aktual (kg)
                </label>

                <input
                  id="courier-actual-weight"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={weight}
                  onChange={(event) =>
                    setWeight(event.target.value)
                  }
                  placeholder="Contoh: 12.5"
                  className="w-full rounded-xl border border-[#E9E1D6] px-4 py-3 text-sm outline-none focus:border-[#E4AB00]"
                />

                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleAction("complete")}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#47763A] px-5 py-3.5 font-bold text-white transition hover:bg-[#365D2B] disabled:opacity-60"
                >
                  {pending ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <CheckCircle2 size={18} />
                  )}
                  Selesaikan Penjemputan
                </button>
              </div>
            )}

            {selected.status === "completed" && (
              <div className="mt-7 rounded-xl bg-green-50 p-5">
                <div className="flex items-center gap-2 font-bold text-green-700">
                  <CheckCircle2 size={20} />
                  Penjemputan Selesai
                </div>

                <p className="mt-2 text-sm text-green-700">
                  Berat sampah terkumpul:{" "}
                  <strong>
                    {formatWeight(
                      selected.actual_weight_kg || 0
                    )}{" "}
                    kg
                  </strong>
                </p>
              </div>
            )}

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={closeDetail}
              disabled={pending}
              className="mt-5 w-full rounded-xl bg-[#F7F3EB] py-3 text-sm font-bold text-[#6E604F] disabled:opacity-50"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
