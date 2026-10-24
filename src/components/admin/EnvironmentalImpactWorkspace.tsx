
"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Calculator,
  CheckCircle2,
  Factory,
  Leaf,
  Recycle,
  Save,
  Scale,
  Sprout,
  Settings2,
  BookOpen,
  X,
} from "lucide-react";

import {
  calculateEmission,
  saveEmissionFactor,
} from "@/app/admin/dampak-lingkungan/actions";

type Batch = {
  id: string;
  batch_code: string | null;
  processing_method: string | null;
  status: string;
  created_at: string;
};

type BatchInput = {
  batch_id: string;
  weight_kg: number;
};

type Emission = {
  id: string;
  batch_id: string;
  baseline_emissions_kgco2e: number;
  project_emissions_kgco2e: number;
  net_reduction_kgco2e: number;
  methodology: string | null;
  assumptions: unknown;
  factor_snapshot: unknown;
  calculated_at: string;
};

type EmissionFactor = {
  id: string;
  name: string;
  waste_type: string;
  factor_kg_co2e_per_kg: number;
  methodology: string;
  source_reference: string;
  effective_from: string;
  is_active: boolean;
  created_at: string;
};

type Props = {
  batches: Batch[];
  inputs: BatchInput[];
  emissions: Emission[];
  factors: EmissionFactor[];
};

type FactorType = "baseline" | "project";

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 3,
  }).format(Number.isFinite(value) ? value : 0);
}

function asObject(value: unknown): Record<string, unknown> {
  if (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<string, unknown>;
  }

  return {};
}

function getSnapshotNumber(
  value: unknown,
  key: string
): number | null {
  const raw = asObject(value)[key];

  if (raw === null || raw === undefined) return null;

  const number = Number(raw);

  return Number.isFinite(number) ? number : null;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof Leaf;
}) {
  return (
    <div className="rounded-3xl border border-[#EEE5D6] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-[#81715D]">
          {title}
        </p>

        <div className="rounded-xl bg-[#F0F7E9] p-2.5">
          <Icon size={21} className="text-[#47763A]" />
        </div>
      </div>

      <h3 className="text-2xl font-extrabold text-[#332417]">
        {value}
      </h3>

      <p className="mt-2 text-xs leading-5 text-[#93836F]">
        {description}
      </p>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] p-3 text-sm text-[#332417] outline-none transition focus:border-[#47763A] focus:ring-2 focus:ring-[#47763A]/10";

export default function EnvironmentalImpactWorkspace({
  batches,
  inputs,
  emissions,
  factors,
}: Props) {
  const router = useRouter();

  const [pending, startTransition] = useTransition();
  const [factorPending, startFactorTransition] = useTransition();

  const [selectedId, setSelectedId] = useState("");
  const [baseline, setBaseline] = useState("");
  const [project, setProject] = useState("");
  const [notes, setNotes] = useState("");

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(true);

  const [factorType, setFactorType] =
    useState<FactorType>("baseline");
  const [factorName, setFactorName] = useState("");
  const [factorValue, setFactorValue] = useState("");
  const [factorMethodology, setFactorMethodology] =
    useState("");
  const [factorSource, setFactorSource] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState(
    () => new Date().toLocaleDateString("en-CA")
  );

  const completedBatches = useMemo(
    () => batches.filter((batch) => batch.status === "completed"),
    [batches]
  );

  const inputWeights = useMemo(() => {
    const result = new Map<string, number>();

    for (const item of inputs) {
      result.set(
        item.batch_id,
        (result.get(item.batch_id) ?? 0) +
          Number(item.weight_kg ?? 0)
      );
    }

    return result;
  }, [inputs]);

  const selectedBatch = completedBatches.find(
    (batch) => batch.id === selectedId
  );

  const selectedWeight = inputWeights.get(selectedId) ?? 0;

  const activeBaseline = factors.find(
    (factor) =>
      factor.waste_type === "baseline" && factor.is_active
  );

  const activeProject = factors.find(
    (factor) =>
      factor.waste_type === "project" && factor.is_active
  );

  const latestEmissions = useMemo(() => {
    const latest = new Map<string, Emission>();

    const sorted = [...emissions].sort(
      (a, b) =>
        new Date(b.calculated_at).getTime() -
        new Date(a.calculated_at).getTime()
    );

    for (const item of sorted) {
      if (!latest.has(item.batch_id)) {
        latest.set(item.batch_id, item);
      }
    }

    return [...latest.values()];
  }, [emissions]);

  const summary = useMemo(() => {
    const processed = completedBatches.reduce(
      (sum, batch) =>
        sum + (inputWeights.get(batch.id) ?? 0),
      0
    );

    const baselineTotal = latestEmissions.reduce(
      (sum, item) =>
        sum + Number(item.baseline_emissions_kgco2e ?? 0),
      0
    );

    const projectTotal = latestEmissions.reduce(
      (sum, item) =>
        sum + Number(item.project_emissions_kgco2e ?? 0),
      0
    );

    const avoidedTotal = latestEmissions.reduce(
      (sum, item) =>
        sum + Number(item.net_reduction_kgco2e ?? 0),
      0
    );

    return {
      processed,
      baselineTotal,
      projectTotal,
      avoidedTotal,
    };
  }, [completedBatches, inputWeights, latestEmissions]);

  const baselineValid =
    baseline.trim() !== "" &&
    Number.isFinite(Number(baseline)) &&
    Number(baseline) >= 0;

  const projectValid =
    project.trim() !== "" &&
    Number.isFinite(Number(project)) &&
    Number(project) >= 0;

  const previewBaseline =
    selectedWeight * (baselineValid ? Number(baseline) : 0);

  const previewProject =
    selectedWeight * (projectValid ? Number(project) : 0);

  const previewAvoided = previewBaseline - previewProject;

  const chartMax = Math.max(
    summary.baselineTotal,
    summary.projectTotal,
    0
  );

  function notify(ok: boolean, text: string) {
    setSuccess(ok);
    setMessage(text);
  }

  function applyActiveFactors() {
    if (!activeBaseline || !activeProject) {
      notify(
        false,
        "Aktifkan faktor baseline dan faktor proyek terlebih dahulu."
      );
      return;
    }

    setBaseline(
      String(activeBaseline.factor_kg_co2e_per_kg)
    );
    setProject(
      String(activeProject.factor_kg_co2e_per_kg)
    );

    setNotes(
      [
        `BASELINE: ${activeBaseline.name}`,
        `Metodologi: ${activeBaseline.methodology}`,
        `Sumber: ${activeBaseline.source_reference}`,
        "",
        `PROYEK: ${activeProject.name}`,
        `Metodologi: ${activeProject.methodology}`,
        `Sumber: ${activeProject.source_reference}`,
      ].join("\n")
    );

    notify(true, "Faktor aktif berhasil diterapkan.");
  }

  function handleBatchChange(id: string) {
    setSelectedId(id);
    setMessage("");

    const existing = latestEmissions.find(
      (item) => item.batch_id === id
    );

    if (existing) {
      const savedBaseline = getSnapshotNumber(
        existing.factor_snapshot,
        "baseline_factor"
      );

      const savedProject = getSnapshotNumber(
        existing.factor_snapshot,
        "project_factor"
      );

      setBaseline(
        savedBaseline === null ? "" : String(savedBaseline)
      );

      setProject(
        savedProject === null ? "" : String(savedProject)
      );

      setNotes(existing.methodology ?? "");
    } else {
      setBaseline(
        activeBaseline
          ? String(activeBaseline.factor_kg_co2e_per_kg)
          : ""
      );

      setProject(
        activeProject
          ? String(activeProject.factor_kg_co2e_per_kg)
          : ""
      );

      setNotes("");
    }
  }

  function handleCalculate() {
    if (!selectedBatch) {
      notify(false, "Pilih batch selesai terlebih dahulu.");
      return;
    }

    if (selectedWeight <= 0) {
      notify(false, "Berat input batch harus lebih dari nol.");
      return;
    }

    if (!baselineValid || !projectValid) {
      notify(false, "Masukkan kedua faktor emisi yang valid.");
      return;
    }

    if (!notes.trim()) {
      notify(
        false,
        "Tuliskan sumber, metodologi, dan asumsi perhitungan."
      );
      return;
    }

    startTransition(async () => {
      try {
        const result = await calculateEmission(
          selectedId,
          Number(baseline),
          Number(project),
          notes
        );

        notify(result.success, result.message);

        if (result.success) router.refresh();
      } catch (error) {
        notify(
          false,
          error instanceof Error
            ? error.message
            : "Perhitungan gagal."
        );
      }
    });
  }

  function handleSaveFactor() {
    if (
      !factorName.trim() ||
      factorValue.trim() === "" ||
      !Number.isFinite(Number(factorValue)) ||
      Number(factorValue) < 0 ||
      !factorMethodology.trim() ||
      !factorSource.trim() ||
      !effectiveFrom
    ) {
      notify(false, "Lengkapi seluruh informasi faktor emisi.");
      return;
    }

    startFactorTransition(async () => {
      try {
        const result = await saveEmissionFactor({
          name: factorName,
          wasteType: factorType,
          factor: Number(factorValue),
          methodology: factorMethodology,
          sourceReference: factorSource,
          effectiveFrom,
        });

        notify(result.success, result.message);

        if (result.success) {
          setFactorName("");
          setFactorValue("");
          setFactorMethodology("");
          setFactorSource("");
          router.refresh();
        }
      } catch (error) {
        notify(
          false,
          error instanceof Error
            ? error.message
            : "Gagal menyimpan faktor."
        );
      }
    });
  }

  return (
    <div className="space-y-7 text-[#332417]">
      {message && (
        <div
          role="status"
          className={`flex items-center justify-between gap-4 rounded-2xl border p-4 text-sm font-semibold ${
            success
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <span>{message}</span>
          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Tutup pesan"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* STATISTIK */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Sampah Terolah"
          value={`${formatNumber(summary.processed)} kg`}
          description="Total input batch yang telah selesai"
          icon={Recycle}
        />
        <StatCard
          title="Batch Selesai"
          value={String(completedBatches.length)}
          description="Batch yang telah menyelesaikan pengolahan"
          icon={Factory}
        />
        <StatCard
          title="Estimasi Emisi Baseline"
          value={`${formatNumber(summary.baselineTotal)} kg`}
          description="kg CO₂e dari skenario pembanding"
          icon={Activity}
        />
        <StatCard
          title="Selisih Emisi"
          value={`${formatNumber(summary.avoidedTotal)} kg`}
          description="kg CO₂e; positif berarti estimasi pengurangan"
          icon={Leaf}
        />
      </div>

      {/* GRAFIK DAN INFORMASI DAMPAK */}
      <div className="grid items-start gap-5 xl:grid-cols-5">
        <section className="rounded-3xl border border-[#EEE5D6] bg-white p-6 shadow-sm xl:col-span-3">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[#F0F7E9] p-3">
              <Scale size={22} className="text-[#47763A]" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold">
                Perbandingan Emisi
              </h2>
              <p className="text-sm text-[#8C7A65]">
                Total estimasi dari batch yang telah dihitung
              </p>
            </div>
          </div>

          {latestEmissions.length === 0 ? (
            <div className="rounded-2xl bg-[#FFFBF1] px-5 py-12 text-center">
              <Leaf
                size={38}
                className="mx-auto mb-3 text-[#9DBB90]"
              />
              <p className="font-bold">
                Belum ada perhitungan emisi
              </p>
              <p className="mt-2 text-sm text-[#8C7A65]">
                Hitung emisi dari batch yang telah selesai.
              </p>
            </div>
          ) : (
            <div className="space-y-7">
              {[
                {
                  label: "Skenario Baseline",
                  value: summary.baselineTotal,
                  color: "bg-[#E9BC57]",
                },
                {
                  label: "Kegiatan PUTARASA",
                  value: summary.projectTotal,
                  color: "bg-[#47763A]",
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-3 flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold">
                      {item.label}
                    </span>
                    <span className="font-extrabold">
                      {formatNumber(item.value)} kg CO₂e
                    </span>
                  </div>

                  <div className="h-4 overflow-hidden rounded-full bg-[#F2EBDD]">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{
                        width:
                          chartMax > 0
                            ? `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  (item.value / chartMax) * 100
                                )
                              )}%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>
              ))}

              <div className="rounded-2xl bg-[#F0F7E9] p-5">
                <p className="text-sm font-semibold text-[#47763A]">
                  Estimasi selisih emisi
                </p>
                <p className="mt-2 text-3xl font-extrabold">
                  {formatNumber(summary.avoidedTotal)} kg CO₂e
                </p>
                <p className="mt-2 text-xs leading-5 text-[#687B60]">
                  Nilai positif menunjukkan estimasi emisi yang
                  dihindari. Nilai negatif menunjukkan emisi
                  proyek lebih besar daripada baseline.
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-[#47763A] p-6 text-white xl:col-span-2">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <Sprout size={25} />
          </div>

          <h2 className="text-xl font-extrabold">
            Dari Sampah Menjadi Dampak
          </h2>

          <p className="mt-3 text-sm leading-7 text-white/80">
            PUTARASA mengolah sampah organik menjadi produk
            bermanfaat melalui pengomposan dan biokonversi
            maggot BSF.
          </p>

          <div className="mt-7 space-y-4">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-sm text-white/70">
                Sampah yang selesai diolah
              </p>
              <p className="mt-1 text-2xl font-extrabold">
                {formatNumber(summary.processed)} kg
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-sm text-white/70">
                Batch dengan estimasi emisi
              </p>
              <p className="mt-1 text-2xl font-extrabold">
                {latestEmissions.length}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* PENGATURAN FAKTOR EMISI */}
      <section className="rounded-3xl border border-[#EEE5D6] bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-[#FFF0BF] p-3">
            <Settings2 size={23} className="text-[#47763A]" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold">
              Pengaturan Faktor Emisi
            </h2>
            <p className="text-sm text-[#8C7A65]">
              Kelola faktor baseline dan kegiatan PUTARASA
              beserta sumber ilmiahnya.
            </p>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          {[
            {
              label: "Faktor Baseline Aktif",
              item: activeBaseline,
            },
            {
              label: "Faktor Proyek Aktif",
              item: activeProject,
            },
          ].map(({ label, item }) => (
            <div
              key={label}
              className="rounded-2xl border border-[#E8DDCC] bg-[#FFFBF1] p-5"
            >
              <p className="text-sm font-bold text-[#81715D]">
                {label}
              </p>

              {item ? (
                <>
                  <p className="mt-3 text-2xl font-extrabold text-[#47763A]">
                    {formatNumber(
                      item.factor_kg_co2e_per_kg
                    )}
                    <span className="ml-2 text-xs font-medium">
                      kg CO₂e/kg
                    </span>
                  </p>
                  <p className="mt-2 text-sm font-semibold">
                    {item.name}
                  </p>
                  <p className="mt-1 text-xs text-[#8C7A65]">
                    {item.source_reference}
                  </p>
                </>
              ) : (
                <p className="mt-3 text-sm text-amber-700">
                  Belum ada faktor aktif.
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h3 className="font-extrabold">
              Tambah dan Aktifkan Faktor
            </h3>

            <div>
              <label className="mb-2 block text-sm font-bold">
                Jenis Faktor
              </label>
              <select
                value={factorType}
                onChange={(event) =>
                  setFactorType(
                    event.target.value as FactorType
                  )
                }
                className={inputClass}
              >
                <option value="baseline">
                  Faktor Emisi Baseline
                </option>
                <option value="project">
                  Faktor Emisi Kegiatan PUTARASA
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
                Nama Faktor
              </label>
              <input
                value={factorName}
                onChange={(event) =>
                  setFactorName(event.target.value)
                }
                placeholder="Contoh: Baseline pengelolaan sampah organik"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
                Nilai Faktor (kg CO₂e/kg)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={factorValue}
                onChange={(event) =>
                  setFactorValue(event.target.value)
                }
                placeholder="Masukkan nilai dari referensi"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
                Tanggal Berlaku
              </label>
              <input
                type="date"
                value={effectiveFrom}
                onChange={(event) =>
                  setEffectiveFrom(event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
                Metodologi
              </label>
              <textarea
                rows={3}
                value={factorMethodology}
                onChange={(event) =>
                  setFactorMethodology(event.target.value)
                }
                placeholder="Jelaskan skenario, batasan sistem, dan dasar perhitungan..."
                className={`${inputClass} resize-none`}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
                Sumber Referensi
              </label>
              <textarea
                rows={3}
                value={factorSource}
                onChange={(event) =>
                  setFactorSource(event.target.value)
                }
                placeholder="Nama publikasi, tahun, halaman atau URL sumber..."
                className={`${inputClass} resize-none`}
              />
            </div>

            <button
              type="button"
              onClick={handleSaveFactor}
              disabled={factorPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#47763A] px-5 py-3.5 font-bold text-white transition hover:bg-[#365D2D] disabled:opacity-50"
            >
              <Save size={18} />
              {factorPending
                ? "Menyimpan..."
                : "Simpan dan Aktifkan Faktor"}
            </button>
          </div>

          <div className="rounded-2xl bg-[#FFFBF1] p-5">
            <div className="mb-5 flex items-center gap-2">
              <BookOpen size={20} className="text-[#47763A]" />
              <h3 className="font-extrabold">
                Riwayat Faktor Emisi
              </h3>
            </div>

            {factors.length === 0 ? (
              <p className="py-10 text-center text-sm text-[#8C7A65]">
                Belum ada faktor emisi tersimpan.
              </p>
            ) : (
              <div className="max-h-[540px] space-y-3 overflow-y-auto">
                {factors.map((factor) => (
                  <div
                    key={factor.id}
                    className="rounded-xl border border-[#EEE5D6] bg-white p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-bold">
                          {factor.name}
                        </p>
                        <p className="mt-1 text-xs text-[#8C7A65]">
                          {factor.waste_type === "baseline"
                            ? "Baseline"
                            : factor.waste_type === "project"
                            ? "Kegiatan PUTARASA"
                            : factor.waste_type}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          factor.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-[#F4EFE6] text-[#8C7A65]"
                        }`}
                      >
                        {factor.is_active
                          ? "Aktif"
                          : "Tidak aktif"}
                      </span>
                    </div>

                    <p className="mt-3 text-xl font-extrabold text-[#47763A]">
                      {formatNumber(
                        factor.factor_kg_co2e_per_kg
                      )}
                      <span className="ml-2 text-xs font-medium">
                        kg CO₂e/kg
                      </span>
                    </p>

                    <p className="mt-2 text-xs leading-5 text-[#8C7A65]">
                      {factor.source_reference}
                    </p>

                    <p className="mt-2 text-xs text-[#93836F]">
                      Berlaku: {formatDate(factor.effective_from)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 rounded-xl bg-[#F0F7E9] p-4">
              <p className="text-xs leading-6 text-[#47763A]">
                Faktor yang disimpan merupakan parameter
                estimasi. Pastikan nilainya sesuai dengan
                sumber, metode pengolahan, dan batasan sistem
                yang digunakan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* KALKULATOR */}
      <section className="rounded-3xl border border-[#EEE5D6] bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-[#FFF0BF] p-3">
            <Calculator size={23} className="text-[#47763A]" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold">
              Kalkulator Emisi GRK
            </h2>
            <p className="text-sm text-[#8C7A65]">
              Hitung estimasi berdasarkan berat input batch
              dan faktor emisi.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold">
                Batch Pengolahan Selesai
              </label>

              <select
                value={selectedId}
                onChange={(event) =>
                  handleBatchChange(event.target.value)
                }
                className={inputClass}
              >
                <option value="">
                  Pilih batch pengolahan
                </option>

                {completedBatches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.batch_code ??
                      batch.id.slice(0, 8)}
                    {" — "}
                    {batch.processing_method === "compost"
                      ? "Kompos"
                      : batch.processing_method === "bsf"
                      ? "Maggot BSF"
                      : batch.processing_method ?? "Pengolahan"}
                  </option>
                ))}
              </select>

              {completedBatches.length === 0 && (
                <p className="mt-2 text-xs text-amber-700">
                  Belum ada batch selesai.
                </p>
              )}
            </div>

            <div className="rounded-xl bg-[#F0F7E9] p-4">
              <p className="text-xs font-semibold text-[#47763A]">
                Berat Input Batch
              </p>
              <p className="mt-1 text-2xl font-extrabold">
                {formatNumber(selectedWeight)} kg
              </p>
            </div>

            <button
              type="button"
              onClick={applyActiveFactors}
              disabled={!selectedId}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#47763A] px-4 py-3 text-sm font-bold text-[#47763A] transition hover:bg-[#F0F7E9] disabled:opacity-50"
            >
              <Settings2 size={17} />
              Gunakan Faktor Emisi Aktif
            </button>

            <div>
              <label className="mb-2 block text-sm font-bold">
                Faktor Emisi Baseline
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={baseline}
                onChange={(event) =>
                  setBaseline(event.target.value)
                }
                placeholder="kg CO₂e/kg"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
                Faktor Emisi Kegiatan PUTARASA
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={project}
                onChange={(event) =>
                  setProject(event.target.value)
                }
                placeholder="kg CO₂e/kg"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
                Sumber dan Asumsi Perhitungan
              </label>
              <textarea
                rows={5}
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                placeholder="Tuliskan sumber, tahun, skenario baseline, asumsi pengolahan, dan batasan perhitungan..."
                className={`${inputClass} resize-none`}
              />
            </div>

            <button
              type="button"
              disabled={
                pending ||
                !selectedId ||
                selectedWeight <= 0
              }
              onClick={handleCalculate}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#47763A] px-5 py-3.5 font-bold text-white transition hover:bg-[#365D2D] disabled:opacity-50"
            >
              <Save size={18} />
              {pending
                ? "Menghitung..."
                : "Hitung dan Simpan Estimasi"}
            </button>
          </div>

          {/* PRATINJAU */}
          <div className="rounded-2xl bg-[#FFFBF1] p-5">
            <h3 className="mb-5 font-extrabold">
              Pratinjau Perhitungan
            </h3>

            <div className="space-y-4">
              <div className="rounded-xl bg-white p-4">
                <p className="text-xs text-[#8C7A65]">
                  Emisi Baseline
                </p>
                <p className="mt-2 text-2xl font-extrabold">
                  {formatNumber(previewBaseline)}
                  <span className="ml-2 text-sm font-medium">
                    kg CO₂e
                  </span>
                </p>
              </div>

              <div className="rounded-xl bg-white p-4">
                <p className="text-xs text-[#8C7A65]">
                  Emisi Kegiatan
                </p>
                <p className="mt-2 text-2xl font-extrabold">
                  {formatNumber(previewProject)}
                  <span className="ml-2 text-sm font-medium">
                    kg CO₂e
                  </span>
                </p>
              </div>

              <div className="rounded-xl bg-[#F0F7E9] p-4">
                <p className="text-xs font-semibold text-[#47763A]">
                  Selisih Emisi
                </p>
                <p className="mt-2 text-3xl font-extrabold">
                  {formatNumber(previewAvoided)}
                  <span className="ml-2 text-sm font-medium">
                    kg CO₂e
                  </span>
                </p>
              </div>

              <div className="border-t border-[#E8DDCC] pt-4">
                <p className="text-sm font-bold">Rumus:</p>
                <p className="mt-2 text-sm leading-7 text-[#8C7A65]">
                  Emisi baseline = berat input × faktor baseline.
                  Emisi kegiatan = berat input × faktor kegiatan.
                  Selisih = emisi baseline − emisi kegiatan.
                </p>
              </div>

              <p className="text-xs leading-6 text-[#8C7A65]">
                Hasil ini merupakan estimasi, bukan verifikasi
                pengurangan emisi atau kredit karbon.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RIWAYAT */}
      <section className="rounded-3xl border border-[#EEE5D6] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-extrabold">
          Riwayat Perhitungan Emisi
        </h2>
        <p className="mt-1 text-sm text-[#8C7A65]">
          Hasil estimasi terbaru untuk setiap batch pengolahan.
        </p>

        {latestEmissions.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#8C7A65]">
            Belum ada riwayat perhitungan.
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#EEE5D6] text-[#8C7A65]">
                  <th className="p-3">Batch</th>
                  <th className="p-3">Berat Input</th>
                  <th className="p-3">Baseline</th>
                  <th className="p-3">Kegiatan</th>
                  <th className="p-3">Selisih</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {latestEmissions.map((item) => {
                  const batch = batches.find(
                    (b) => b.id === item.batch_id
                  );

                  const savedWeight = getSnapshotNumber(
                    item.assumptions,
                    "input_weight_kg"
                  );

                  const weight =
                    savedWeight ??
                    inputWeights.get(item.batch_id) ??
                    0;

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-[#F4EDE2]"
                    >
                      <td className="p-3 font-bold">
                        {batch?.batch_code ??
                          item.batch_id.slice(0, 8)}
                      </td>

                      <td className="p-3">
                        {formatNumber(weight)} kg
                      </td>

                      <td className="p-3">
                        {formatNumber(
                          item.baseline_emissions_kgco2e
                        )}
                      </td>

                      <td className="p-3">
                        {formatNumber(
                          item.project_emissions_kgco2e
                        )}
                      </td>

                      <td className="p-3 font-extrabold">
                        {formatNumber(
                          item.net_reduction_kgco2e
                        )}
                      </td>

                      <td className="p-3">
                        {formatDate(item.calculated_at)}
                      </td>

                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                          <CheckCircle2 size={14} />
                          Tersimpan
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
