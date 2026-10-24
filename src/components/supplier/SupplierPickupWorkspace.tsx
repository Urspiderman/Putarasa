
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Truck,
  MapPin,
  CalendarDays,
  Scale,
  Plus,
  X,
  CheckCircle2,
  Clock3,
  PackageCheck,
  Loader2,
  Leaf,
} from "lucide-react";

import { createPickupRequest } from "@/app/supplier/penjemputan/actions";

type Pickup = {
  id: string;
  address: string;
  pickup_date: string;
  pickup_time: string | null;
  waste_type: string;
  estimated_weight_kg: number;
  actual_weight_kg: number | null;
  status: string;
  created_at: string;
};

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Menunggu",
    assigned: "Kurir Ditugaskan",
    on_the_way: "Dalam Perjalanan",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };

  return labels[status] || status;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date.slice(0, 10)}T12:00:00Z`));
}

export default function SupplierPickupWorkspace({
  pickups,
}: {
  pickups: Pickup[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const completed = pickups.filter(
    (item) => item.status === "completed"
  ).length;

  const totalWeight = pickups
    .filter((item) => item.status === "completed")
    .reduce(
      (sum, item) => sum + Number(item.actual_weight_kg || 0),
      0
    );

  async function handleSubmit(formData: FormData) {
    setError("");

    startTransition(async () => {
      try {
        const result = await createPickupRequest(
  { success: false, message: "" },
  formData
);

        if (!result.success) {
          setError(result.message);
          return;
        }

        setOpen(false);
        router.refresh();
      } catch {
        setError("Terjadi kesalahan saat mengirim permintaan.");
      }
    });
  }

  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Total Permintaan",
            value: pickups.length,
            icon: Truck,
          },
          {
            title: "Selesai",
            value: completed,
            icon: CheckCircle2,
          },
          {
            title: "Sampah Terkumpul",
            value: `${totalWeight.toLocaleString("id-ID")} kg`,
            icon: Scale,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-[22px] border border-[#EFE5D6] bg-white p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0BF] text-[#9A7200]">
                <Icon size={23} />
              </div>

              <p className="mt-4 text-sm text-[#817361]">
                {item.title}
              </p>

              <p className="mt-2 text-2xl font-black text-[#332417]">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 rounded-[24px] bg-[#47763A] p-7 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[#E4F1D9]">
            <Leaf size={18} />
            <span className="text-xs font-bold">
              KONTRIBUSI LINGKUNGAN
            </span>
          </div>

          <h2 className="text-2xl font-black">
            Punya Sampah Organik?
          </h2>

          <p className="mt-2 max-w-lg text-sm leading-6 text-[#E4F1D9]">
            Ajukan penjemputan agar sampah dapur dapat
            dikelola menjadi produk yang bermanfaat.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError("");
            setOpen(true);
          }}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#FFDA57] px-5 py-3 font-extrabold text-[#332417] hover:bg-[#FFCA2C]"
        >
          <Plus size={19} />
          Ajukan Penjemputan
        </button>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-[#EFE5D6] bg-white">
        <div className="border-b border-[#EFE5D6] p-6">
          <h2 className="text-lg font-black text-[#332417]">
            Riwayat Penjemputan
          </h2>
          <p className="mt-1 text-sm text-[#817361]">
            Pantau status permintaan sampah organikmu.
          </p>
        </div>

        {pickups.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <PackageCheck
              size={44}
              className="mx-auto text-[#D6B76C]"
            />
            <p className="mt-4 font-bold">
              Belum Ada Penjemputan
            </p>
            <p className="mt-2 text-sm text-[#817361]">
              Buat permintaan pertamamu melalui tombol di atas.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F1EADF]">
            {pickups.map((item) => (
              <div
                key={item.id}
                className="p-6 transition hover:bg-[#FFFCF5]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-[#332417]">
                      {item.waste_type}
                    </p>

                    <div className="mt-3 flex items-start gap-2 text-sm text-[#817361]">
                      <MapPin size={16} className="shrink-0" />
                      {item.address}
                    </div>
                  </div>

                  <span className="rounded-full bg-[#FFF0BF] px-3 py-1.5 text-xs font-bold text-[#8A681A]">
                    {statusLabel(item.status)}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-5 text-xs text-[#817361]">
                  <span className="flex items-center gap-2">
                    <CalendarDays size={15} />
                    {formatDate(item.pickup_date)}
                    {item.pickup_time
                      ? ` • ${item.pickup_time}`
                      : ""}
                  </span>

                  <span className="flex items-center gap-2">
                    <Scale size={15} />
                    Estimasi {item.estimated_weight_kg} kg
                  </span>

                  {item.actual_weight_kg !== null && (
                    <span className="flex items-center gap-2 font-bold text-[#47763A]">
                      <CheckCircle2 size={15} />
                      Aktual {item.actual_weight_kg} kg
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="supplier-pickup-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[26px] bg-white p-7"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2
                  id="supplier-pickup-title"
                  className="text-xl font-black"
                >
                  Ajukan Penjemputan
                </h2>

                <p className="mt-1 text-xs text-[#817361]">
                  Lengkapi informasi sampah organik.
                </p>
              </div>

              <button
                type="button"
                disabled={pending}
                onClick={() => setOpen(false)}
                aria-label="Tutup formulir"
                className="rounded-lg p-2 hover:bg-[#F7F3EB]"
              >
                <X size={20} />
              </button>
            </div>

            <form action={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="pickup-address"
                  className="mb-2 block text-sm font-bold"
                >
                  Alamat Penjemputan *
                </label>

                <textarea
                  id="pickup-address"
                  name="address"
                  required
                  rows={3}
                  placeholder="Alamat lengkap lokasi sampah..."
                  className="w-full rounded-xl border border-[#E9E1D6] p-3 text-sm outline-none focus:border-[#E4AB00]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="pickup-date"
                    className="mb-2 block text-sm font-bold"
                  >
                    Tanggal *
                  </label>

                  <input
                    id="pickup-date"
                    type="date"
                    name="pickup_date"
                    required
                    className="w-full rounded-xl border border-[#E9E1D6] p-3 text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="pickup-time"
                    className="mb-2 block text-sm font-bold"
                  >
                    Jam
                  </label>

                  <input
                    id="pickup-time"
                    type="time"
                    name="pickup_time"
                    className="w-full rounded-xl border border-[#E9E1D6] p-3 text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="waste-type"
                  className="mb-2 block text-sm font-bold"
                >
                  Jenis Sampah *
                </label>

                <select
                  id="waste-type"
                  name="waste_type"
                  required
                  className="w-full rounded-xl border border-[#E9E1D6] p-3 text-sm"
                >
                  <option value="Sampah Organik Campuran">
                    Sampah Organik Campuran
                  </option>
                  <option value="Sisa Sayuran">
                    Sisa Sayuran
                  </option>
                  <option value="Sisa Buah">
                    Sisa Buah
                  </option>
                  <option value="Sisa Makanan">
                    Sisa Makanan
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="estimated-weight"
                  className="mb-2 block text-sm font-bold"
                >
                  Estimasi Berat (kg) *
                </label>

                <input
                  id="estimated-weight"
                  type="number"
                  name="estimated_weight_kg"
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="Contoh: 10"
                  className="w-full rounded-xl border border-[#E9E1D6] p-3 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="pickup-notes"
                  className="mb-2 block text-sm font-bold"
                >
                  Catatan Tambahan
                </label>

                <textarea
                  id="pickup-notes"
                  name="notes"
                  rows={2}
                  placeholder="Informasi tambahan (opsional)..."
                  className="w-full rounded-xl border border-[#E9E1D6] p-3 text-sm"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#47763A] px-5 py-3.5 font-bold text-white disabled:opacity-60"
              >
                {pending ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Kirim Permintaan
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
