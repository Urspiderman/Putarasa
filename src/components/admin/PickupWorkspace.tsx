
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Truck,
  Search,
  Clock3,
  CheckCircle2,
  PackageCheck,
  Eye,
  X,
  MapPin,
  CalendarDays,
  Scale,
  UserRound,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

import {
  managePickupAction,
  type PickupAction,
} from "@/app/admin/penjemputan/actions";

export type PickupRecord = {
  id: string;
  supplier_id: string;
  supplier_name: string;
  courier_id: string | null;
  courier_name: string | null;
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

export type CourierRecord = {
  id: string;
  full_name: string;
  email: string | null;
};

const statusOptions = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Menunggu" },
  { value: "assigned", label: "Ditugaskan" },
  { value: "on_the_way", label: "Dalam Perjalanan" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

function statusLabel(status: string) {
  return (
    statusOptions.find((item) => item.value === status)?.label ??
    status
  );
}

function formatDate(date: string) {
  if (!date) return "-";

  const parsed = new Date(`${date.slice(0, 10)}T12:00:00Z`);

  if (Number.isNaN(parsed.getTime())) return date;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    assigned: "bg-blue-50 text-blue-700",
    on_the_way: "bg-violet-50 text-violet-700",
    completed: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${
        styles[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {statusLabel(status)}
    </span>
  );
}

export default function PickupWorkspace({
  pickups,
  couriers,
}: {
  pickups: PickupRecord[];
  couriers: CourierRecord[];
}) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] =
    useState<PickupRecord | null>(null);

  const [courierId, setCourierId] = useState("");
  const [actualWeight, setActualWeight] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const stats = {
    total: pickups.length,
    pending: pickups.filter(
      (item) => item.status === "pending"
    ).length,
    active: pickups.filter((item) =>
      ["assigned", "on_the_way"].includes(item.status)
    ).length,
    completed: pickups.filter(
      (item) => item.status === "completed"
    ).length,
  };

  const totalCollected = pickups
    .filter((item) => item.status === "completed")
    .reduce(
      (sum, item) => sum + Number(item.actual_weight_kg || 0),
      0
    );

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return pickups.filter((item) => {
      const matchSearch =
        !query ||
        item.supplier_name.toLowerCase().includes(query) ||
        item.address.toLowerCase().includes(query) ||
        (item.courier_name || "").toLowerCase().includes(query);

      const matchStatus =
        status === "all" || item.status === status;

      return matchSearch && matchStatus;
    });
  }, [pickups, search, status]);

  function openDetail(item: PickupRecord) {
    setSelected(item);
    setCourierId(item.courier_id || "");
    setActualWeight(
      item.actual_weight_kg?.toString() || ""
    );
    setMessage("");
    setError(false);
  }

  function closeDetail() {
    if (loading) return;
    setSelected(null);
    setMessage("");
    setError(false);
  }

  async function handleAction(action: PickupAction) {
    if (!selected || loading) return;

    setLoading(true);
    setMessage("");
    setError(false);

    try {
      const result = await managePickupAction(
        selected.id,
        action,
        action === "assign" ? courierId : undefined,
        action === "complete"
          ? Number(actualWeight)
          : undefined
      );

      setMessage(result.message);
      setError(!result.success);

      if (result.success) {
        setSelected(null);
        router.refresh();
      }
    } catch {
      setMessage("Terjadi kesalahan saat memperbarui data.");
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const cards = [
    {
      title: "Total Permintaan",
      value: stats.total,
      icon: PackageCheck,
      bg: "bg-[#FFF0C5]",
      color: "text-[#9A7200]",
    },
    {
      title: "Menunggu",
      value: stats.pending,
      icon: Clock3,
      bg: "bg-amber-50",
      color: "text-amber-700",
    },
    {
      title: "Sedang Diproses",
      value: stats.active,
      icon: Truck,
      bg: "bg-blue-50",
      color: "text-blue-700",
    },
    {
      title: "Selesai",
      value: stats.completed,
      icon: CheckCircle2,
      bg: "bg-green-50",
      color: "text-green-700",
    },
  ];

  return (
    <div className="space-y-7">
      {/* STATS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-[22px] border border-[#EFE5D6] bg-white p-6 shadow-sm"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.bg} ${card.color}`}
              >
                <Icon size={23} />
              </div>

              <p className="mt-5 text-sm text-[#817361]">
                {card.title}
              </p>

              <p className="mt-2 text-3xl font-black">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* COLLECTION SUMMARY */}
      <div className="flex flex-col gap-4 rounded-[22px] bg-[#47763A] p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[#E6F2DC]">
            Total Sampah Berhasil Dikumpulkan
          </p>

          <p className="mt-2 text-3xl font-black">
            {totalCollected.toLocaleString("id-ID", {
              maximumFractionDigits: 2,
            })}{" "}
            kg
          </p>

          <p className="mt-2 text-xs text-[#E6F2DC]">
            Berdasarkan penjemputan yang sudah selesai.
          </p>
        </div>

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
          <Scale size={32} />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-[24px] border border-[#EFE5D6] bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[#F0E9DD] p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-black">
              Daftar Penjemputan
            </h2>
            <p className="mt-1 text-sm text-[#8A7B67]">
              Pantau dan kelola seluruh permintaan Supplier.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
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
                placeholder="Cari supplier atau alamat..."
                className="w-full rounded-xl border border-[#E9E1D6] bg-[#FFFCF7] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#E4AB00]"
              />
            </div>

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              className="rounded-xl border border-[#E9E1D6] bg-[#FFFCF7] px-4 py-3 text-sm font-semibold outline-none"
            >
              {statusOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-[#FFFAED] text-xs uppercase tracking-wide text-[#806E54]">
              <tr>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Jadwal</th>
                <th className="px-6 py-4">Estimasi</th>
                <th className="px-6 py-4">Courier</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tindakan</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F1EADF]">
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#FFFCF5]"
                >
                  <td className="px-6 py-5">
                    <p className="font-bold">
                      {item.supplier_name}
                    </p>

                    <p className="mt-1 max-w-[210px] truncate text-xs text-[#8A7B67]">
                      {item.address}
                    </p>
                  </td>

                  <td className="px-6 py-5 text-xs">
                    {formatDate(item.pickup_date)}
                    <p className="mt-1 text-[#8A7B67]">
                      {item.pickup_time || "-"}
                    </p>
                  </td>

                  <td className="px-6 py-5 font-bold">
                    {Number(
                      item.estimated_weight_kg
                    ).toLocaleString("id-ID")}{" "}
                    kg
                  </td>

                  <td className="px-6 py-5 text-xs">
                    {item.courier_name || "Belum ditugaskan"}
                  </td>

                  <td className="px-6 py-5">
                    <StatusBadge status={item.status} />
                  </td>

                  <td className="px-6 py-5">
                    <button
                      type="button"
                      onClick={() => openDetail(item)}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#FFF0C5] px-3 py-2 text-xs font-bold text-[#916B00] hover:bg-[#FFE39A]"
                    >
                      <Eye size={16} />
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="px-6 py-16 text-center">
              <Truck
                size={42}
                className="mx-auto text-[#D6B76C]"
              />

              <p className="mt-4 font-bold">
                Belum Ada Penjemputan
              </p>

              <p className="mt-2 text-sm text-[#8A7B67]">
                Permintaan Supplier akan muncul di sini.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-[#F0E9DD] px-6 py-4 text-xs text-[#8A7B67]">
          Menampilkan {filtered.length} dari {pickups.length} permintaan.
        </div>
      </div>

      {/* DETAIL MODAL */}
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
            aria-labelledby="pickup-detail-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[26px] bg-white p-7 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2
                  id="pickup-detail-title"
                  className="text-xl font-black"
                >
                  Detail Penjemputan
                </h2>

                <p className="mt-1 text-xs text-[#8A7B67]">
                  Informasi dan pengelolaan permintaan
                </p>
              </div>

              <button
                type="button"
                onClick={closeDetail}
                disabled={loading}
                aria-label="Tutup detail"
                className="rounded-lg p-2 hover:bg-[#F7F3EB]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#FFFAED] p-4">
              <div>
                <p className="text-xs text-[#8A7B67]">
                  Status Penjemputan
                </p>

                <div className="mt-2">
                  <StatusBadge status={selected.status} />
                </div>
              </div>

              <Truck
                size={30}
                className="text-[#C79B2B]"
              />
            </div>

            <div className="mt-6 space-y-5">
              <div className="flex gap-3">
                <UserRound
                  size={18}
                  className="text-[#A77A00]"
                />
                <div>
                  <p className="text-xs text-[#8A7B67]">
                    Supplier
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {selected.supplier_name}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <MapPin
                  size={18}
                  className="shrink-0 text-[#A77A00]"
                />
                <div>
                  <p className="text-xs text-[#8A7B67]">
                    Alamat Penjemputan
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {selected.address}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CalendarDays
                  size={18}
                  className="text-[#A77A00]"
                />
                <div>
                  <p className="text-xs text-[#8A7B67]">
                    Jadwal
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {formatDate(selected.pickup_date)}
                    {selected.pickup_time
                      ? ` • ${selected.pickup_time}`
                      : ""}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Scale
                  size={18}
                  className="text-[#A77A00]"
                />
                <div>
                  <p className="text-xs text-[#8A7B67]">
                    Jenis dan Estimasi Sampah
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {selected.waste_type} •{" "}
                    {selected.estimated_weight_kg} kg
                  </p>
                </div>
              </div>

              {selected.notes && (
                <div className="rounded-xl bg-[#F7F3EB] p-4">
                  <p className="text-xs font-bold text-[#817361]">
                    Catatan Supplier
                  </p>
                  <p className="mt-2 text-sm">
                    {selected.notes}
                  </p>
                </div>
              )}
            </div>

            {["pending", "assigned"].includes(
              selected.status
            ) && (
              <div className="mt-6 border-t border-[#EFE5D6] pt-5">
                <label
                  htmlFor="pickup-courier"
                  className="mb-2 block text-sm font-bold"
                >
                  Pilih Courier
                </label>

                <select
                  id="pickup-courier"
                  value={courierId}
                  onChange={(event) =>
                    setCourierId(event.target.value)
                  }
                  className="w-full rounded-xl border border-[#E9E1D6] bg-white px-4 py-3 text-sm outline-none focus:border-[#E4AB00]"
                >
                  <option value="">
                    Pilih Courier yang tersedia
                  </option>

                  {couriers.map((courier) => (
                    <option
                      key={courier.id}
                      value={courier.id}
                    >
                      {courier.full_name}
                      {courier.email
                        ? ` (${courier.email})`
                        : ""}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  disabled={loading || !courierId}
                  onClick={() => handleAction("assign")}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#47763A] px-4 py-3 text-sm font-bold text-white hover:bg-[#365D2B] disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Truck size={17} />
                  )}
                  Simpan Penugasan Courier
                </button>
              </div>
            )}

            {selected.status === "assigned" && (
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  handleAction("on_the_way")
                }
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6A60A9] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                <ArrowRight size={17} />
                Tandai Dalam Perjalanan
              </button>
            )}

            {selected.status === "on_the_way" && (
              <div className="mt-6 border-t border-[#EFE5D6] pt-5">
                <label
                  htmlFor="pickup-weight"
                  className="mb-2 block text-sm font-bold"
                >
                  Berat Aktual (kg)
                </label>

                <input
                  id="pickup-weight"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={actualWeight}
                  onChange={(event) =>
                    setActualWeight(event.target.value)
                  }
                  placeholder="Contoh: 12.5"
                  className="w-full rounded-xl border border-[#E9E1D6] px-4 py-3 text-sm outline-none focus:border-[#E4AB00]"
                />

                <button
                  type="button"
                  disabled={
                    loading ||
                    !Number.isFinite(Number(actualWeight)) ||
                    Number(actualWeight) <= 0
                  }
                  onClick={() => handleAction("complete")}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#47763A] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
                >
                  <CheckCircle2 size={18} />
                  Selesaikan Penjemputan
                </button>
              </div>
            )}

            {["pending", "assigned"].includes(
              selected.status
            ) && (
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  if (
                    window.confirm(
                      "Yakin ingin membatalkan penjemputan ini?"
                    )
                  ) {
                    handleAction("cancel");
                  }
                }}
                className="mt-3 w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Batalkan Penjemputan
              </button>
            )}

            {selected.status === "completed" && (
              <div className="mt-6 rounded-xl bg-green-50 p-4 text-sm text-green-700">
                Penjemputan selesai. Berat aktual:{" "}
                <strong>
                  {selected.actual_weight_kg} kg
                </strong>
              </div>
            )}

            {message && (
              <div
                role="alert"
                className={`mt-4 flex items-start gap-2 rounded-xl p-3 text-sm ${
                  error
                    ? "bg-red-50 text-red-700"
                    : "bg-green-50 text-green-700"
                }`}
              >
                <AlertCircle size={18} />
                {message}
              </div>
            )}

            <button
              type="button"
              onClick={closeDetail}
              disabled={loading}
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
