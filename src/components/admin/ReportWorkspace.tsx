
"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  BarChart3,
  Boxes,
  CalendarDays,
  ChartNoAxesCombined,
  CreditCard,
  Factory,
  Leaf,
  Recycle,
  ShoppingCart,
  Truck,
} from "lucide-react";

type Pickup = {
  id: string;
  status: string;
  actual_weight_kg: number;
  created_at: string;
};

type Batch = {
  id: string;
  batch_code: string;
  processing_method: string;
  status: string;
  created_at: string;
  completion_date: string | null;
};

type BatchInput = {
  batch_id: string;
  weight_kg: number;
};

type BatchOutput = {
  batch_id: string;
  output_type: string;
  weight_kg: number;
};

type Order = {
  id: string;
  order_code: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
};

type Payment = {
  id: string;
  order_id: string;
  amount: number;
  status: string;
  verified_at: string | null;
  created_at: string;
};

type Product = {
  id: string;
  name: string;
  sku: string;
  unit: string;
};

type Inventory = {
  product_id: string;
  quantity: number;
};

type Emission = {
  id: string;
  batch_id: string;
  baseline_emissions_kgco2e: number;
  project_emissions_kgco2e: number;
  net_reduction_kgco2e: number;
  methodology: string | null;
  calculated_at: string;
};

type Props = {
  pickups: Pickup[];
  batches: Batch[];
  inputs: BatchInput[];
  outputs: BatchOutput[];
  orders: Order[];
  payments: Payment[];
  products: Product[];
  inventory: Inventory[];
  emissions: Emission[];
};

type Period = "30" | "90" | "365" | "all";

const numberFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 2,
});

const moneyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const number = (value: number) =>
  numberFormatter.format(value);

const money = (value: number) =>
  moneyFormatter.format(value);

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function within(
  value: string | null,
  period: Period,
  now: number
) {
  if (!value) return false;
  if (period === "all") return true;

  const timestamp = new Date(value).getTime();
  return (
    Number.isFinite(timestamp) &&
    timestamp >= now - Number(period) * 86400000 &&
    timestamp <= now
  );
}

function downloadCSV(
  filename: string,
  rows: Array<Array<string | number>>
) {
  const encode = (value: string | number) => {
    const raw = String(value ?? "");
    const safe = /^[\s]*[=+\-@\t\r]/.test(raw)
      ? `'${raw}`
      : raw;
    return `"${safe.replace(/"/g, '""')}"`;
  };

  const csv =
    "\uFEFF" +
    rows.map((row) => row.map(encode).join(";")).join("\r\n");

  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" })
  );

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Card({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: typeof Leaf;
}) {
  return (
    <div className="rounded-3xl border border-[#EFE5D4] bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className="text-sm font-semibold text-[#8C7A65]">
          {title}
        </span>
        <span className="rounded-xl bg-[#FFF0BF] p-3">
          <Icon size={21} className="text-[#47763A]" />
        </span>
      </div>
      <p className="break-words text-2xl font-black xl:text-3xl">
        {value}
      </p>
      <p className="mt-2 text-xs leading-5 text-[#9A8974]">
        {subtitle}
      </p>
    </div>
  );
}

function SectionHeading({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  icon: typeof Leaf;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="rounded-xl bg-[#F0F7E9] p-3">
        <Icon size={21} className="text-[#47763A]" />
      </div>
      <div>
        <h2 className="text-xl font-extrabold">{title}</h2>
        <p className="mt-1 text-sm text-[#8C7A65]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#F2EADF] py-3 last:border-0">
      <span className="text-sm text-[#8C7A65]">
        {label}
      </span>
      <span className="text-right font-extrabold">
        {value}
      </span>
    </div>
  );
}

export default function ReportWorkspace({
  pickups,
  batches,
  inputs,
  outputs,
  orders,
  payments,
  products,
  inventory,
  emissions,
}: Props) {
  const [period, setPeriod] = useState<Period>("30");
  const [now] = useState(() => Date.now());

  const report = useMemo(() => {
    const filteredPickups = pickups.filter((p) =>
      within(p.created_at, period, now)
    );
    const completedPickups = filteredPickups.filter(
      (p) => p.status === "completed"
    );

    const collectedKg = completedPickups.reduce(
      (sum, p) => sum + p.actual_weight_kg,
      0
    );

    const filteredBatches = batches.filter((b) =>
      within(b.created_at, period, now)
    );

    const completedBatches = batches.filter(
      (b) =>
        b.status === "completed" &&
        within(
          b.completion_date ?? b.created_at,
          period,
          now
        )
    );

    const completedIds = new Set(
      completedBatches.map((b) => b.id)
    );

    const processedKg = inputs
      .filter((i) => completedIds.has(i.batch_id))
      .reduce((sum, i) => sum + i.weight_kg, 0);

    const productionKg = outputs
      .filter((o) => completedIds.has(o.batch_id))
      .reduce((sum, o) => sum + o.weight_kg, 0);

    const compostKg = outputs
      .filter(
        (o) =>
          completedIds.has(o.batch_id) &&
          o.output_type === "compost"
      )
      .reduce((sum, o) => sum + o.weight_kg, 0);

    const maggotKg = outputs
      .filter(
        (o) =>
          completedIds.has(o.batch_id) &&
          ["fresh_maggot", "dried_maggot"].includes(
            o.output_type
          )
      )
      .reduce((sum, o) => sum + o.weight_kg, 0);

    const filteredOrders = orders.filter((o) =>
      within(o.created_at, period, now)
    );

    const completedOrders = filteredOrders.filter(
      (o) => o.status === "completed"
    );

    const filteredPayments = payments.filter(
      (p) =>
        p.status === "verified" &&
        within(
          p.verified_at ?? p.created_at,
          period,
          now
        )
    );

    const paidAmount = filteredPayments.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    // Ambil satu perhitungan TERBARU untuk setiap batch.
    // Perhitungan yang lebih lama tidak dijumlahkan lagi.
    const latestByBatch = new Map<string, Emission>();

    for (const emission of [...emissions].sort(
      (a, b) =>
        new Date(b.calculated_at).getTime() -
        new Date(a.calculated_at).getTime() ||
        b.id.localeCompare(a.id)
    )) {
      if (!latestByBatch.has(emission.batch_id)) {
        latestByBatch.set(emission.batch_id, emission);
      }
    }

    // Periode emisi berdasarkan tanggal perhitungan terbaru.
    const filteredEmissions = [...latestByBatch.values()]
      .filter((e) => within(e.calculated_at, period, now))
      .sort(
        (a, b) =>
          new Date(b.calculated_at).getTime() -
          new Date(a.calculated_at).getTime()
      );

    const baseline = filteredEmissions.reduce(
      (sum, e) => sum + e.baseline_emissions_kgco2e,
      0
    );

    const project = filteredEmissions.reduce(
      (sum, e) => sum + e.project_emissions_kgco2e,
      0
    );

    const reduction = filteredEmissions.reduce(
      (sum, e) => sum + e.net_reduction_kgco2e,
      0
    );

    const percentage =
      baseline > 0 ? (reduction / baseline) * 100 : null;

    const batchMap = new Map(
      batches.map((b) => [b.id, b])
    );

    const emissionRows = filteredEmissions.map((e) => ({
      ...e,
      batch_code:
        batchMap.get(e.batch_id)?.batch_code ??
        e.batch_id.slice(0, 8),
    }));

    const stockMap = new Map(
      inventory.map((i) => [i.product_id, i.quantity])
    );

    const stockRows = products.map((p) => ({
      ...p,
      quantity: stockMap.get(p.id) ?? 0,
    }));

    return {
      filteredPickups,
      completedPickups,
      collectedKg,
      filteredBatches,
      completedBatches,
      processedKg,
      productionKg,
      compostKg,
      maggotKg,
      filteredOrders,
      completedOrders,
      filteredPayments,
      paidAmount,
      baseline,
      project,
      reduction,
      percentage,
      emissionRows,
      stockRows,
    };
  }, [
    pickups,
    batches,
    inputs,
    outputs,
    orders,
    payments,
    products,
    inventory,
    emissions,
    period,
    now,
  ]);

  const chartMax = Math.max(
    report.baseline,
    report.project,
    1
  );

  const chartRows = [
    {
      label: "Skenario Awal",
      value: report.baseline,
      color: "bg-[#FFDA57]",
    },
    {
      label: "Skenario PUTARASA",
      value: report.project,
      color: "bg-[#47763A]",
    },
  ];

  const monthly = useMemo(() => {
    const months: {
      key: string;
      label: string;
      collected: number;
      processed: number;
    }[] = [];

    const today = new Date(now);

    for (let i = 5; i >= 0; i--) {
      const d = new Date(
        today.getFullYear(),
        today.getMonth() - i,
        1
      );

      months.push({
        key: `${d.getFullYear()}-${String(
          d.getMonth() + 1
        ).padStart(2, "0")}`,
        label: d.toLocaleDateString("id-ID", {
          month: "short",
        }),
        collected: 0,
        processed: 0,
      });
    }

    for (const p of report.completedPickups) {
      const month = months.find(
        (m) => m.key === p.created_at.slice(0, 7)
      );
      if (month) month.collected += p.actual_weight_kg;
    }

    const batchMonths = new Map(
      report.completedBatches.map((b) => [
        b.id,
        (b.completion_date ?? b.created_at).slice(0, 7),
      ])
    );

    for (const input of inputs) {
      const key = batchMonths.get(input.batch_id);
      const month = months.find((m) => m.key === key);
      if (month) month.processed += input.weight_kg;
    }

    return months;
  }, [report, inputs, now]);

  const monthlyMax = Math.max(
    1,
    ...monthly.flatMap((m) => [m.collected, m.processed])
  );

  function exportReport() {
    const rows: Array<Array<string | number>> = [
      ["PUTARASA - LAPORAN OPERASIONAL DAN EMISI"],
      [
        "Periode",
        period === "all"
          ? "Semua data"
          : `${period} hari terakhir`,
      ],
      ["Diekspor", new Date(now).toLocaleString("id-ID")],
      [],
      ["RINGKASAN OPERASIONAL", "NILAI", "SATUAN"],
      [
        "Penjemputan selesai",
        report.completedPickups.length,
        "penjemputan",
      ],
      ["Sampah terkumpul", report.collectedKg, "kg"],
      ["Batch selesai", report.completedBatches.length, "batch"],
      ["Sampah selesai diolah", report.processedKg, "kg"],
      ["Hasil produksi", report.productionKg, "kg"],
      ["Kompos", report.compostKg, "kg"],
      ["Maggot", report.maggotKg, "kg"],
      ["Pesanan dibuat", report.filteredOrders.length, "pesanan"],
      ["Pesanan selesai", report.completedOrders.length, "pesanan"],
      [
        "Pembayaran terverifikasi",
        report.filteredPayments.length,
        "transaksi",
      ],
      [
        "Nominal pembayaran terverifikasi",
        report.paidAmount,
        "IDR",
      ],
      [],
      ["RINGKASAN EMISI", "NILAI", "SATUAN"],
      ["Batch dengan perhitungan", report.emissionRows.length, "batch"],
      ["Emisi baseline", report.baseline, "kg CO2e"],
      ["Emisi proyek", report.project, "kg CO2e"],
      ["Pengurangan emisi bersih", report.reduction, "kg CO2e"],
      [
        "Persentase pengurangan",
        report.percentage === null
          ? "Tidak tersedia"
          : report.percentage,
        "%",
      ],
      [],
      ["RINCIAN EMISI PER BATCH"],
      [
        "Kode Batch",
        "Tanggal Hitung",
        "Baseline kg CO2e",
        "Proyek kg CO2e",
        "Pengurangan kg CO2e",
        "Metodologi",
      ],
      ...report.emissionRows.map((e) => [
        e.batch_code,
        e.calculated_at,
        e.baseline_emissions_kgco2e,
        e.project_emissions_kgco2e,
        e.net_reduction_kgco2e,
        e.methodology ?? "",
      ]),
      [],
      ["STOK SAAT INI"],
      ["Produk", "SKU", "Stok", "Satuan"],
      ...report.stockRows.map((p) => [
        p.name,
        p.sku,
        p.quantity,
        p.unit,
      ]),
      [],
      ["BATCH SELESAI"],
      ["Kode Batch", "Metode", "Tanggal Selesai"],
      ...report.completedBatches.map((b) => [
        b.batch_code,
        b.processing_method,
        b.completion_date ?? b.created_at,
      ]),
      [],
      ["PESANAN"],
      ["Kode", "Status", "Pembayaran", "Total"],
      ...report.filteredOrders.map((o) => [
        o.order_code,
        o.status,
        o.payment_status,
        o.total_amount,
      ]),
    ];

    downloadCSV(
      `putarasa-laporan-emisi-${period}-${new Date(now)
        .toISOString()
        .slice(0, 10)}.csv`,
      rows
    );
  }

  return (
    <div className="space-y-7">
      {/* FILTER PERIODE */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#EFE5D4] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays size={20} className="text-[#47763A]" />
          <div>
            <p className="text-sm font-extrabold">
              Periode Laporan
            </p>
            <p className="text-xs text-[#8C7A65]">
              Pilih rentang waktu analisis
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["30", "30 Hari"],
              ["90", "90 Hari"],
              ["365", "1 Tahun"],
              ["all", "Semua"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setPeriod(value)}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold ${
                period === value
                  ? "bg-[#47763A] text-white"
                  : "bg-[#F5F1E8] text-[#74695B] hover:bg-[#E9E3D6]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* STATISTIK OPERASIONAL */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card
          title="Sampah Terkumpul"
          value={`${number(report.collectedKg)} kg`}
          subtitle={`${report.completedPickups.length} penjemputan selesai`}
          icon={Truck}
        />
        <Card
          title="Sampah Selesai Diolah"
          value={`${number(report.processedKg)} kg`}
          subtitle={`${report.completedBatches.length} batch selesai`}
          icon={Recycle}
        />
        <Card
          title="Pesanan Selesai"
          value={String(report.completedOrders.length)}
          subtitle={`${report.filteredOrders.length} pesanan dibuat`}
          icon={ShoppingCart}
        />
        <Card
          title="Pembayaran Terverifikasi"
          value={money(report.paidAmount)}
          subtitle={`${report.filteredPayments.length} transaksi disetujui`}
          icon={CreditCard}
        />
      </div>

      {/* PANEL UTAMA */}
      <section className="flex flex-col justify-between gap-5 rounded-3xl bg-[#47763A] p-6 text-white md:flex-row md:items-center">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
            <ChartNoAxesCombined size={19} />
            Analisis PUTARASA
          </p>
          <h2 className="text-2xl font-extrabold">
            Laporan Operasional & Dampak Lingkungan
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
            Gabungan data pengumpulan sampah, pengolahan,
            penjualan, dan estimasi pengurangan emisi karbon.
          </p>
        </div>

        <button
          type="button"
          onClick={exportReport}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#FFDA57] px-5 py-3 font-extrabold text-[#332417] hover:bg-[#FFE586]"
        >
          <ArrowDownToLine size={19} />
          Ekspor CSV
        </button>
      </section>

      {/* LAPORAN EMISI */}
      <section className="space-y-5">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#47763A]">
            Dampak Lingkungan
          </p>
          <h2 className="mt-1 text-2xl font-black">
            Laporan Emisi Karbon
          </h2>
          <p className="mt-1 text-sm text-[#8C7A65]">
            Estimasi emisi berdasarkan perhitungan yang
            tersimpan pada modul Dampak Lingkungan.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card
            title="Emisi Baseline"
            value={`${number(report.baseline)} kg`}
            subtitle="CO₂e · Skenario awal"
            icon={Factory}
          />
          <Card
            title="Emisi PUTARASA"
            value={`${number(report.project)} kg`}
            subtitle="CO₂e · Skenario pengolahan"
            icon={Recycle}
          />
          <Card
            title="Pengurangan Emisi Bersih"
            value={`${number(report.reduction)} kg`}
            subtitle="CO₂e · Dapat bernilai negatif"
            icon={Leaf}
          />
          <Card
            title="Persentase Pengurangan"
            value={
              report.percentage === null
                ? "—"
                : `${number(report.percentage)}%`
            }
            subtitle={`${report.emissionRows.length} batch dihitung`}
            icon={BarChart3}
          />
        </div>

        <div className="grid items-start gap-5 xl:grid-cols-5">
          {/* GRAFIK EMISI */}
          <div className="rounded-3xl border border-[#EFE5D4] bg-white p-6 shadow-sm xl:col-span-3">
            <SectionHeading
              title="Perbandingan Emisi"
              subtitle="Baseline dibandingkan dengan skenario PUTARASA"
              icon={BarChart3}
            />

            {report.emissionRows.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#8C7A65]">
                Belum ada perhitungan emisi dalam periode ini.
              </div>
            ) : (
              <div className="space-y-7 py-4">
                {chartRows.map((item) => (
                  <div key={item.label}>
                    <div className="mb-3 flex items-center justify-between gap-3 text-sm">
                      <span className="font-bold">
                        {item.label}
                      </span>
                      <span className="font-extrabold">
                        {number(item.value)} kg CO₂e
                      </span>
                    </div>
                    <div className="h-5 overflow-hidden rounded-full bg-[#F4F0E8]">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{
                          width: `${
                            (Math.max(0, item.value) /
                              chartMax) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}

                <div className="rounded-2xl bg-[#F0F7E9] p-5">
                  <p className="text-sm font-semibold text-[#47763A]">
                    Estimasi Selisih Emisi
                  </p>
                  <p className="mt-2 text-3xl font-black text-[#332417]">
                    {report.reduction >= 0 ? "−" : "+"}
                    {number(Math.abs(report.reduction))}
                    <span className="ml-2 text-base font-bold">
                      kg CO₂e
                    </span>
                  </p>
                  <p className="mt-2 text-xs text-[#6C785F]">
                    {report.reduction >= 0
                      ? "Estimasi emisi yang dihindari dibandingkan baseline."
                      : "Emisi proyek diperkirakan lebih tinggi daripada baseline."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* INFORMASI EMISI */}
          <div className="rounded-3xl border border-[#EFE5D4] bg-white p-6 shadow-sm xl:col-span-2">
            <SectionHeading
              title="Ringkasan Perhitungan"
              subtitle="Cakupan dan interpretasi data"
              icon={Leaf}
            />

            <DetailRow
              label="Batch dengan Perhitungan"
              value={String(report.emissionRows.length)}
            />
            <DetailRow
              label="Baseline"
              value={`${number(report.baseline)} kg CO₂e`}
            />
            <DetailRow
              label="Emisi Proyek"
              value={`${number(report.project)} kg CO₂e`}
            />
            <DetailRow
              label="Pengurangan Bersih"
              value={`${number(report.reduction)} kg CO₂e`}
            />

            <div className="mt-5 rounded-2xl bg-[#FFFBF1] p-4 text-sm leading-6 text-[#74695B]">
              Setiap batch dihitung satu kali berdasarkan
              perhitungan terbaru. Filter menggunakan
              tanggal perhitungan emisi, bukan tanggal
              pembuatan batch.
            </div>
          </div>
        </div>

        {/* TABEL EMISI */}
        <div className="rounded-3xl border border-[#EFE5D4] bg-white p-5 shadow-sm sm:p-6">
          <SectionHeading
            title="Rincian Emisi per Batch"
            subtitle="Perhitungan emisi terbaru untuk setiap batch"
            icon={Factory}
          />

          {report.emissionRows.length === 0 ? (
            <p className="py-12 text-center text-sm text-[#8C7A65]">
              Belum ada data emisi untuk periode yang dipilih.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#EFE5D4] text-[#8C7A65]">
                    <th className="px-3 py-4">Batch</th>
                    <th className="px-3 py-4">Tanggal</th>
                    <th className="px-3 py-4">Baseline</th>
                    <th className="px-3 py-4">PUTARASA</th>
                    <th className="px-3 py-4">Pengurangan</th>
                    <th className="px-3 py-4">Metodologi</th>
                  </tr>
                </thead>
                <tbody>
                  {report.emissionRows.map((e) => (
                    <tr
                      key={e.id}
                      className="border-b border-[#F4EDE2] last:border-0"
                    >
                      <td className="px-3 py-4 font-extrabold">
                        {e.batch_code}
                      </td>
                      <td className="px-3 py-4 text-[#8C7A65]">
                        {formatDate(e.calculated_at)}
                      </td>
                      <td className="px-3 py-4">
                        {number(e.baseline_emissions_kgco2e)}
                      </td>
                      <td className="px-3 py-4">
                        {number(e.project_emissions_kgco2e)}
                      </td>
                      <td
                        className={`px-3 py-4 font-extrabold ${
                          e.net_reduction_kgco2e >= 0
                            ? "text-[#47763A]"
                            : "text-red-700"
                        }`}
                      >
                        {number(e.net_reduction_kgco2e)}
                      </td>
                      <td className="max-w-[220px] px-3 py-4 text-xs text-[#8C7A65]">
                        {e.methodology || "Tidak dicatat"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-xs text-[#9A8974]">
                Seluruh nilai emisi menggunakan satuan kg CO₂e.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* GRAFIK SAMPAH */}
      <section className="rounded-3xl border border-[#EFE5D4] bg-white p-6 shadow-sm">
        <SectionHeading
          title="Tren Pengelolaan Sampah"
          subtitle="Enam bulan kalender terakhir"
          icon={BarChart3}
        />

        <div className="mb-4 flex flex-wrap gap-5 text-xs font-semibold text-[#8C7A65]">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-[#FFDA57]" />
            Terkumpul
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-[#47763A]" />
            Selesai Diolah
          </span>
        </div>

        <div className="grid h-64 grid-cols-6 items-end gap-3 border-b border-[#EFE5D4] pb-2">
          {monthly.map((m) => (
            <div
              key={m.key}
              className="flex h-full flex-col justify-end gap-2"
            >
              <div className="flex h-[205px] items-end justify-center gap-1.5 sm:gap-3">
                <div
                  title={`${number(m.collected)} kg terkumpul`}
                  className="w-full max-w-8 rounded-t bg-[#FFDA57]"
                  style={{
                    height: `${(m.collected / monthlyMax) * 100}%`,
                  }}
                />
                <div
                  title={`${number(m.processed)} kg selesai diolah`}
                  className="w-full max-w-8 rounded-t bg-[#47763A]"
                  style={{
                    height: `${(m.processed / monthlyMax) * 100}%`,
                  }}
                />
              </div>
              <p className="text-center text-xs font-semibold text-[#8C7A65]">
                {m.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* REKAP OPERASIONAL */}
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <section className="rounded-3xl border border-[#EFE5D4] bg-white p-6 shadow-sm">
          <SectionHeading
            title="Rekap Penjemputan"
            subtitle="Pengumpulan sampah organik"
            icon={Truck}
          />
          <DetailRow
            label="Total Penjemputan"
            value={String(report.filteredPickups.length)}
          />
          <DetailRow
            label="Penjemputan Selesai"
            value={String(report.completedPickups.length)}
          />
          <DetailRow
            label="Sampah Terkumpul"
            value={`${number(report.collectedKg)} kg`}
          />
        </section>

        <section className="rounded-3xl border border-[#EFE5D4] bg-white p-6 shadow-sm">
          <SectionHeading
            title="Rekap Pengolahan"
            subtitle="Hasil pengolahan sampah"
            icon={Factory}
          />
          <DetailRow
            label="Batch Dibuat"
            value={String(report.filteredBatches.length)}
          />
          <DetailRow
            label="Batch Selesai"
            value={String(report.completedBatches.length)}
          />
          <DetailRow
            label="Sampah Diolah"
            value={`${number(report.processedKg)} kg`}
          />
          <DetailRow
            label="Total Produksi"
            value={`${number(report.productionKg)} kg`}
          />
          <DetailRow
            label="Kompos"
            value={`${number(report.compostKg)} kg`}
          />
          <DetailRow
            label="Maggot"
            value={`${number(report.maggotKg)} kg`}
          />
        </section>

        <section className="rounded-3xl border border-[#EFE5D4] bg-white p-6 shadow-sm">
          <SectionHeading
            title="Rekap Penjualan"
            subtitle="Aktivitas pesanan pelanggan"
            icon={ShoppingCart}
          />
          <DetailRow
            label="Pesanan Dibuat"
            value={String(report.filteredOrders.length)}
          />
          <DetailRow
            label="Pesanan Selesai"
            value={String(report.completedOrders.length)}
          />
          <DetailRow
            label="Pesanan Dibatalkan"
            value={String(
              report.filteredOrders.filter(
                (o) => o.status === "cancelled"
              ).length
            )}
          />
        </section>

        <section className="rounded-3xl border border-[#EFE5D4] bg-white p-6 shadow-sm">
          <SectionHeading
            title="Rekap Pembayaran"
            subtitle="Transaksi yang sudah diverifikasi"
            icon={CreditCard}
          />
          <div className="rounded-2xl bg-[#F0F7E9] p-5">
            <p className="text-sm font-semibold text-[#47763A]">
              Total Nominal Terverifikasi
            </p>
            <p className="mt-2 break-words text-2xl font-black">
              {money(report.paidAmount)}
            </p>
          </div>
          <DetailRow
            label="Pembayaran Disetujui"
            value={String(report.filteredPayments.length)}
          />
        </section>
      </div>

      {/* INVENTORI */}
      <section className="rounded-3xl border border-[#EFE5D4] bg-white p-6 shadow-sm">
        <SectionHeading
          title="Posisi Inventori"
          subtitle="Saldo stok terkini, tidak mengikuti filter periode"
          icon={Boxes}
        />

        {report.stockRows.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#8C7A65]">
            Belum ada produk inventori.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#EFE5D4] text-[#8C7A65]">
                  <th className="px-3 py-4">Produk</th>
                  <th className="px-3 py-4">SKU</th>
                  <th className="px-3 py-4">Stok</th>
                  <th className="px-3 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {report.stockRows.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-[#F4EDE2] last:border-0"
                  >
                    <td className="px-3 py-4 font-bold">
                      {p.name}
                    </td>
                    <td className="px-3 py-4 text-[#8C7A65]">
                      {p.sku}
                    </td>
                    <td className="px-3 py-4 font-extrabold">
                      {number(p.quantity)} {p.unit}
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                          p.quantity > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {p.quantity > 0
                          ? "Tersedia"
                          : "Kosong"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* PENJELASAN */}
      <div className="rounded-2xl border border-[#E7EBD9] bg-[#F0F7E9] p-5">
        <div className="flex items-start gap-3">
          <Leaf
            size={22}
            className="mt-0.5 shrink-0 text-[#47763A]"
          />
          <div>
            <h3 className="font-extrabold text-[#47763A]">
              Catatan Metodologi Laporan
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#6C785F]">
              Emisi adalah estimasi berdasarkan faktor dan
              asumsi pada modul Dampak Lingkungan. Angka
              pengurangan bersih mengikuti hasil perhitungan
              yang tersimpan, dan bisa bernilai negatif.
              Hasil ini bukan sertifikasi pengurangan emisi
              atau kredit karbon. Filter emisi menggunakan
              tanggal perhitungan terbaru setiap batch.
              Data inventori selalu menunjukkan stok saat ini.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
