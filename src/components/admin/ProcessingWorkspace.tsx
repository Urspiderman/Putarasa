
"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Factory,
  Leaf,
  PackageCheck,
  Plus,
  Recycle,
  Search,
  Sprout,
  Trash2,
  Weight,
  X,
  AlertCircle,
} from "lucide-react";

import {
  addProcessingOutput,
  createProcessingBatch,
  updateProcessingBatchStatus,
} from "@/app/admin/pengolahan/actions";

type BatchStatus =
  | "planned"
  | "processing"
  | "completed"
  | "cancelled";

type Method = "compost" | "maggot";

type Batch = {
  id: string;
  batch_code: string;
  processing_method: Method | null;
  status: BatchStatus;
  start_date: string | null;
  completion_date: string | null;
  notes: string | null;
  created_at: string;
};

type BatchInput = {
  id: string;
  batch_id: string;
  pickup_id: string;
  weight_kg: number;
};

type BatchOutput = {
  id: string;
  batch_id: string;
  output_type: string;
  weight_kg: number;
  notes: string | null;
  created_at: string;
};

type AvailableWaste = {
  pickup_id: string;
  pickup_date: string;
  waste_type: string;
  actual_weight_kg: number;
  allocated_weight_kg: number;
  available_weight_kg: number;
};

type Props = {
  batches: Batch[];
  inputs: BatchInput[];
  outputs: BatchOutput[];
  availableWaste: AvailableWaste[];
};

type ActionResult = {
  success: boolean;
  message: string;
};

const statusLabels: Record<BatchStatus, string> = {
  planned: "Direncanakan",
  processing: "Diproses",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const statusClasses: Record<BatchStatus, string> = {
  planned: "bg-amber-100 text-amber-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-700",
};

const outputLabels: Record<string, string> = {
  compost: "Kompos",
  fresh_maggot: "Maggot Segar",
  dried_maggot: "Maggot Kering",
  frass: "Frass",
  residue: "Residu",
  other: "Lainnya",
};

function kg(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 3,
  }).format(Number(value) || 0);
}

function dateLabel(value: string | null) {
  if (!value) return "-";

  const date = new Date(
    `${value.slice(0, 10)}T12:00:00`
  );

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: typeof Recycle;
}) {
  return (
    <div className="rounded-3xl border border-[#EFE5D4] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-[#7B6A55]">
          {title}
        </span>

        <span className="rounded-xl bg-[#FFF0BF] p-2.5">
          <Icon
            size={21}
            className="text-[#47763A]"
          />
        </span>
      </div>

      <div className="text-3xl font-extrabold">
        {value}
      </div>

      <p className="mt-1 text-xs text-[#9A8974]">
        {subtitle}
      </p>
    </div>
  );
}

export default function ProcessingWorkspace({
  batches,
  inputs,
  outputs,
  availableWaste,
}: Props) {
  const router = useRouter();

  const [pending, startTransition] =
    useTransition();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [createOpen, setCreateOpen] =
    useState(false);

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [messageSuccess, setMessageSuccess] =
    useState(true);

  const [method, setMethod] =
    useState<Method>("compost");

  const [pickupId, setPickupId] =
    useState("");

  const [inputWeight, setInputWeight] =
    useState("");

  const [batchNotes, setBatchNotes] =
    useState("");

  const [outputType, setOutputType] =
    useState("compost");

  const [outputWeight, setOutputWeight] =
    useState("");

  const [outputNotes, setOutputNotes] =
    useState("");

  const selectedBatch =
    batches.find((batch) => batch.id === selectedId) ??
    null;

  const selectedWaste =
    availableWaste.find(
      (waste) => waste.pickup_id === pickupId
    );

  const selectableWaste =
    availableWaste.filter(
      (waste) =>
        Number(waste.available_weight_kg) > 0
    );

  const stats = useMemo(() => {
    const active = batches.filter(
      (batch) => batch.status === "processing"
    ).length;

    const completed = batches.filter(
      (batch) => batch.status === "completed"
    ).length;

    // Batch dibatalkan tidak dihitung
    // sebagai alokasi sampah aktif.
    const activeBatchIds = new Set(
      batches
        .filter(
          (batch) => batch.status !== "cancelled"
        )
        .map((batch) => batch.id)
    );

    const allocated = inputs
      .filter((input) =>
        activeBatchIds.has(input.batch_id)
      )
      .reduce(
        (sum, input) =>
          sum + Number(input.weight_kg),
        0
      );

    const available = availableWaste.reduce(
      (sum, waste) =>
        sum + Number(waste.available_weight_kg),
      0
    );

    return {
      active,
      completed,
      allocated,
      available,
    };
  }, [batches, inputs, availableWaste]);

  const filteredBatches = batches.filter(
    (batch) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        (batch.batch_code ?? "")
          .toLowerCase()
          .includes(keyword) ||
        (batch.processing_method ?? "")
          .toLowerCase()
          .includes(keyword);

      const matchesFilter =
        filter === "all" ||
        batch.status === filter;

      return matchesSearch && matchesFilter;
    }
  );

  const batchInputs = selectedBatch
    ? inputs.filter(
        (input) =>
          input.batch_id === selectedBatch.id
      )
    : [];

  const batchOutputs = selectedBatch
    ? outputs.filter(
        (output) =>
          output.batch_id === selectedBatch.id
      )
    : [];

  const totalInput = batchInputs.reduce(
    (sum, item) =>
      sum + Number(item.weight_kg),
    0
  );

  const totalOutput = batchOutputs.reduce(
    (sum, item) =>
      sum + Number(item.weight_kg),
    0
  );

  function showMessage(result: ActionResult) {
    setMessage(result.message);
    setMessageSuccess(result.success);
  }

  function runAction(
    action: () => Promise<ActionResult>,
    options?: {
      closeCreate?: boolean;
    }
  ) {
    setMessage("");

    startTransition(async () => {
      try {
        const result = await action();

        showMessage(result);

        if (result.success) {
          if (options?.closeCreate) {
            setCreateOpen(false);
            setPickupId("");
            setInputWeight("");
            setBatchNotes("");
          }

          router.refresh();
        }
      } catch (error) {
        showMessage({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan.",
        });
      }
    });
  }

  function handleCreate() {
    const weight = Number(inputWeight);

    if (
      !pickupId ||
      !Number.isFinite(weight) ||
      weight <= 0
    ) {
      showMessage({
        success: false,
        message:
          "Pilih penjemputan dan masukkan berat yang valid.",
      });
      return;
    }

    if (
      selectedWaste &&
      weight >
        Number(selectedWaste.available_weight_kg)
    ) {
      showMessage({
        success: false,
        message:
          "Berat melebihi stok sampah yang tersedia.",
      });
      return;
    }

    runAction(
      () =>
        createProcessingBatch(
          method,
          pickupId,
          weight,
          batchNotes
        ),
      { closeCreate: true }
    );
  }

  // Input hanya dikosongkan ketika berhasil.
  function handleOutput() {
    if (!selectedBatch) return;

    const weight = Number(outputWeight);

    if (
      !Number.isFinite(weight) ||
      weight <= 0
    ) {
      showMessage({
        success: false,
        message:
          "Masukkan berat hasil produksi yang valid.",
      });
      return;
    }

    setMessage("");

    startTransition(async () => {
      try {
        const result =
          await addProcessingOutput(
            selectedBatch.id,
            outputType,
            weight,
            outputNotes
          );

        showMessage(result);

        if (result.success) {
          setOutputWeight("");
          setOutputNotes("");
          router.refresh();
        }
      } catch (error) {
        showMessage({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Gagal menyimpan hasil produksi.",
        });
      }
    });
  }

  return (
    <div className="space-y-7">
      {/* NOTIFIKASI */}
      {message && (
        <div
          role="status"
          className={`flex items-center justify-between gap-3 rounded-2xl border px-5 py-3 text-sm font-semibold ${
            messageSuccess
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {messageSuccess ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}

            <span>{message}</span>
          </div>

          <button
            onClick={() => setMessage("")}
            aria-label="Tutup pesan"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* STATISTIK */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Batch"
          value={String(batches.length)}
          subtitle="Seluruh batch pengolahan"
          icon={ClipboardList}
        />

        <StatCard
          title="Sedang Diproses"
          value={String(stats.active)}
          subtitle="Batch pengolahan aktif"
          icon={Factory}
        />

        <StatCard
          title="Batch Selesai"
          value={String(stats.completed)}
          subtitle="Pengolahan telah selesai"
          icon={CheckCircle2}
        />

        <StatCard
          title="Sampah Dialokasikan"
          value={`${kg(stats.allocated)} kg`}
          subtitle="Alokasi selain batch dibatalkan"
          icon={Weight}
        />
      </div>

      {/* BAHAN BAKU */}
      <div className="flex flex-col gap-5 rounded-3xl bg-[#47763A] p-6 text-white shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
            <Leaf size={17} />
            Bahan Baku Tersedia
          </div>

          <div className="text-3xl font-extrabold">
            {kg(stats.available)} kg
          </div>

          <p className="mt-2 max-w-lg text-sm text-white/80">
            Sampah organik dari penjemputan
            yang telah selesai dan belum
            dialokasikan ke batch aktif.
          </p>
        </div>

        <button
          disabled={pending}
          onClick={() => {
            setMessage("");
            setCreateOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FFDA57] px-5 py-3 text-sm font-extrabold text-[#332417] transition hover:bg-[#FFE586] disabled:opacity-50"
        >
          <Plus size={19} />
          Buat Batch Baru
        </button>
      </div>

      {/* TABEL BATCH */}
      <section className="rounded-3xl border border-[#EFE5D4] bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-extrabold">
              Daftar Batch Pengolahan
            </h2>

            <p className="mt-1 text-sm text-[#8C7A65]">
              Pantau dan kelola proses produksi
              kompos maupun maggot.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-3 text-[#9A8974]"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Cari kode batch..."
                className="w-full rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#47763A]"
              />
            </div>

            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value)
              }
              className="rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] px-3 py-2.5 text-sm outline-none"
            >
              <option value="all">
                Semua Status
              </option>
              <option value="planned">
                Direncanakan
              </option>
              <option value="processing">
                Diproses
              </option>
              <option value="completed">
                Selesai
              </option>
              <option value="cancelled">
                Dibatalkan
              </option>
            </select>
          </div>
        </div>

        {filteredBatches.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Recycle
              size={43}
              className="mb-4 text-[#9DBB90]"
            />

            <h3 className="font-bold">
              Belum ada batch pengolahan
            </h3>

            <p className="mt-2 text-sm text-[#8C7A65]">
              Buat batch baru dari sampah
              yang sudah dijemput.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#F0E7DA] text-[#8C7A65]">
                  <th className="px-3 py-4 font-semibold">
                    Batch
                  </th>
                  <th className="px-3 py-4 font-semibold">
                    Metode
                  </th>
                  <th className="px-3 py-4 font-semibold">
                    Berat Input
                  </th>
                  <th className="px-3 py-4 font-semibold">
                    Tanggal
                  </th>
                  <th className="px-3 py-4 font-semibold">
                    Status
                  </th>
                  <th className="px-3 py-4 text-right font-semibold">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredBatches.map((batch) => {
                  const batchWeight = inputs
                    .filter(
                      (input) =>
                        input.batch_id === batch.id
                    )
                    .reduce(
                      (sum, input) =>
                        sum + Number(input.weight_kg),
                      0
                    );

                  return (
                    <tr
                      key={batch.id}
                      className="border-b border-[#F5EEE4] last:border-0"
                    >
                      <td className="px-3 py-4 font-bold">
                        {batch.batch_code}
                      </td>

                      <td className="px-3 py-4">
                        <span className="inline-flex items-center gap-2">
                          {batch.processing_method ===
                          "compost" ? (
                            <Sprout
                              size={17}
                              className="text-[#47763A]"
                            />
                          ) : (
                            <Recycle
                              size={17}
                              className="text-[#B88620]"
                            />
                          )}

                          {batch.processing_method ===
                          "compost"
                            ? "Kompos"
                            : batch.processing_method ===
                                "maggot"
                              ? "Maggot BSF"
                              : "Belum ditentukan"}
                        </span>
                      </td>

                      <td className="px-3 py-4 font-semibold">
                        {kg(batchWeight)} kg
                      </td>

                      <td className="px-3 py-4 text-[#7B6A55]">
                        {dateLabel(batch.created_at)}
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                            statusClasses[batch.status] ??
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {statusLabels[batch.status] ??
                            batch.status}
                        </span>
                      </td>

                      <td className="px-3 py-4 text-right">
                        <button
                          onClick={() => {
                            setMessage("");
                            setSelectedId(batch.id);
                            setOutputType(
                              batch.processing_method ===
                                "maggot"
                                ? "fresh_maggot"
                                : "compost"
                            );
                          }}
                          className="inline-flex items-center gap-1 font-bold text-[#47763A] hover:underline"
                        >
                          Detail
                          <ArrowRight size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* MODAL BUAT BATCH */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-extrabold">
                  Buat Batch Baru
                </h2>

                <p className="mt-1 text-sm text-[#8C7A65]">
                  Alokasikan sampah yang sudah
                  selesai dijemput.
                </p>
              </div>

              <button
                disabled={pending}
                onClick={() => setCreateOpen(false)}
                aria-label="Tutup"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold">
                  Metode Pengolahan
                </label>

                <div className="grid grid-cols-2 gap-3">
                  {(["compost", "maggot"] as const).map(
                    (value) => (
                      <button
                        key={value}
                        disabled={pending}
                        onClick={() => setMethod(value)}
                        className={`rounded-2xl border-2 p-4 text-left font-bold ${
                          method === value
                            ? "border-[#47763A] bg-[#F0F8EB]"
                            : "border-[#EFE5D4]"
                        }`}
                      >
                        {value === "compost" ? (
                          <Sprout className="mb-2 text-[#47763A]" />
                        ) : (
                          <Recycle className="mb-2 text-[#47763A]" />
                        )}

                        {value === "compost"
                          ? "Kompos"
                          : "Maggot BSF"}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Sumber Sampah
                </label>

                <select
                  disabled={pending}
                  value={pickupId}
                  onChange={(event) => {
                    setPickupId(event.target.value);
                    setInputWeight("");
                  }}
                  className="w-full rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] p-3 text-sm outline-none"
                >
                  <option value="">
                    Pilih penjemputan selesai
                  </option>

                  {selectableWaste.map((waste) => (
                    <option
                      key={waste.pickup_id}
                      value={waste.pickup_id}
                    >
                      {dateLabel(waste.pickup_date)}
                      {" — "}
                      {waste.waste_type}
                      {" ("}
                      {kg(waste.available_weight_kg)}
                      {" kg tersedia)"}
                    </option>
                  ))}
                </select>

                {selectableWaste.length === 0 && (
                  <p className="mt-2 text-xs text-amber-700">
                    Belum ada sampah tersedia.
                    Selesaikan penjemputan terlebih dahulu.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Berat Dialokasikan (kg)
                </label>

                <input
                  type="number"
                  min="0.001"
                  step="0.001"
                  max={
                    selectedWaste?.available_weight_kg
                  }
                  disabled={pending}
                  value={inputWeight}
                  onChange={(event) =>
                    setInputWeight(event.target.value)
                  }
                  placeholder="Contoh: 25"
                  className="w-full rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] p-3 outline-none"
                />

                {selectedWaste && (
                  <p className="mt-2 text-xs text-[#7B6A55]">
                    Maksimal tersedia:{" "}
                    {kg(
                      selectedWaste.available_weight_kg
                    )}{" "}
                    kg
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Catatan (opsional)
                </label>

                <textarea
                  rows={3}
                  disabled={pending}
                  value={batchNotes}
                  onChange={(event) =>
                    setBatchNotes(event.target.value)
                  }
                  placeholder="Catatan kondisi sampah..."
                  className="w-full resize-none rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] p-3 outline-none"
                />
              </div>

              <button
                disabled={
                  pending ||
                  selectableWaste.length === 0
                }
                onClick={handleCreate}
                className="w-full rounded-2xl bg-[#FFDA57] px-5 py-3.5 font-extrabold text-[#332417] disabled:opacity-50"
              >
                {pending
                  ? "Menyimpan..."
                  : "Buat Batch Pengolahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL BATCH */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#47763A]">
                  Detail Pengolahan
                </p>

                <h2 className="mt-1 text-xl font-extrabold">
                  {selectedBatch.batch_code}
                </h2>
              </div>

              <button
                disabled={pending}
                onClick={() => setSelectedId(null)}
                aria-label="Tutup"
              >
                <X size={22} />
              </button>
            </div>

            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                  statusClasses[selectedBatch.status] ??
                  "bg-gray-100 text-gray-700"
                }`}
              >
                {statusLabels[selectedBatch.status] ??
                  selectedBatch.status}
              </span>

              <span className="text-sm text-[#7B6A55]">
                {selectedBatch.processing_method ===
                "compost"
                  ? "Pengolahan Kompos"
                  : "Biokonversi Maggot BSF"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#FFFBF1] p-4">
                <Weight
                  size={19}
                  className="mb-2 text-[#47763A]"
                />

                <div className="text-2xl font-extrabold">
                  {kg(totalInput)} kg
                </div>

                <p className="text-xs text-[#8C7A65]">
                  Berat bahan baku
                </p>
              </div>

              <div className="rounded-2xl bg-[#FFFBF1] p-4">
                <PackageCheck
                  size={19}
                  className="mb-2 text-[#47763A]"
                />

                <div className="text-2xl font-extrabold">
                  {kg(totalOutput)} kg
                </div>

                <p className="text-xs text-[#8C7A65]">
                  Hasil tercatat
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-[#7B6A55]">
                <CalendarDays size={17} />
                Mulai:{" "}
                {dateLabel(selectedBatch.start_date)}
              </div>

              <div className="flex items-center gap-2 text-[#7B6A55]">
                <Clock3 size={17} />
                Selesai:{" "}
                {dateLabel(
                  selectedBatch.completion_date
                )}
              </div>
            </div>

            <div className="mt-6 border-t border-[#EFE5D4] pt-5">
              <h3 className="font-extrabold">
                Bahan Baku
              </h3>

              {batchInputs.length ? (
                <div className="mt-3 space-y-2">
                  {batchInputs.map((input) => (
                    <div
                      key={input.id}
                      className="flex justify-between rounded-xl bg-[#FFFBF1] p-3 text-sm"
                    >
                      <span>
                        Penjemputan #
                        {input.pickup_id.slice(0, 8)}
                      </span>

                      <strong>
                        {kg(input.weight_kg)} kg
                      </strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-[#8C7A65]">
                  Belum ada bahan baku tercatat.
                </p>
              )}
            </div>

            <div className="mt-6 border-t border-[#EFE5D4] pt-5">
              <h3 className="font-extrabold">
                Hasil Produksi
              </h3>

              <div className="mt-3 space-y-2">
                {batchOutputs.length ? (
                  batchOutputs.map((output) => (
                    <div
                      key={output.id}
                      className="flex items-center justify-between rounded-xl bg-[#FFFBF1] p-3 text-sm"
                    >
                      <span>
                        {outputLabels[
                          output.output_type
                        ] ?? output.output_type}
                      </span>

                      <strong>
                        {kg(output.weight_kg)} kg
                      </strong>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#8C7A65]">
                    Belum ada hasil produksi.
                  </p>
                )}
              </div>

              {selectedBatch.status ===
                "processing" && (
                <div className="mt-4 space-y-3 rounded-2xl border border-[#EFE5D4] p-4">
                  <h4 className="font-bold">
                    Catat Hasil Produksi
                  </h4>

                  <select
                    disabled={pending}
                    value={outputType}
                    onChange={(event) =>
                      setOutputType(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] p-3 text-sm"
                  >
                    {Object.entries(
                      outputLabels
                    ).map(([value, label]) => (
                      <option
                        key={value}
                        value={value}
                      >
                        {label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="0.001"
                    step="0.001"
                    disabled={pending}
                    placeholder="Berat hasil (kg)"
                    value={outputWeight}
                    onChange={(event) =>
                      setOutputWeight(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] p-3 text-sm"
                  />

                  <textarea
                    rows={2}
                    disabled={pending}
                    placeholder="Catatan hasil (opsional)"
                    value={outputNotes}
                    onChange={(event) =>
                      setOutputNotes(
                        event.target.value
                      )
                    }
                    className="w-full resize-none rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] p-3 text-sm"
                  />

                  <button
                    disabled={pending}
                    onClick={handleOutput}
                    className="w-full rounded-xl bg-[#47763A] p-3 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {pending
                      ? "Menyimpan..."
                      : "Simpan Hasil Produksi"}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3 border-t border-[#EFE5D4] pt-5">
              {selectedBatch.status ===
                "planned" && (
                <button
                  disabled={pending}
                  onClick={() =>
                    runAction(() =>
                      updateProcessingBatchStatus(
                        selectedBatch.id,
                        "processing"
                      )
                    )
                  }
                  className="flex-1 rounded-xl bg-[#47763A] px-4 py-3 font-bold text-white disabled:opacity-50"
                >
                  Mulai Pengolahan
                </button>
              )}

              {selectedBatch.status ===
                "processing" && (
                <button
                  disabled={
                    pending ||
                    batchOutputs.length === 0
                  }
                  onClick={() =>
                    runAction(() =>
                      updateProcessingBatchStatus(
                        selectedBatch.id,
                        "completed"
                      )
                    )
                  }
                  className="flex-1 rounded-xl bg-[#47763A] px-4 py-3 font-bold text-white disabled:opacity-50"
                >
                  Selesaikan Batch
                </button>
              )}

              {(
                ["planned", "processing"] as string[]
              ).includes(selectedBatch.status) && (
                <button
                  disabled={pending}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Yakin ingin membatalkan batch ini?"
                      )
                    ) {
                      runAction(() =>
                        updateProcessingBatchStatus(
                          selectedBatch.id,
                          "cancelled"
                        )
                      );
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 font-bold text-red-700 disabled:opacity-50"
                >
                  <Trash2 size={17} />
                  Batalkan
                </button>
              )}

              {selectedBatch.status ===
                "completed" && (
                <div className="flex w-full items-center gap-2 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-700">
                  <CheckCircle2 size={19} />
                  Batch selesai dan siap untuk
                  perhitungan dampak lingkungan.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
