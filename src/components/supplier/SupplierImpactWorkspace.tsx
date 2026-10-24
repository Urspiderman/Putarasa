
"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Factory,
  Leaf,
  Recycle,
  Scale,
  Sprout,
  TrendingUp,
} from "lucide-react";

export type SupplierImpactItem = {
  id: string;
  waste_type: string;
  actual_weight_kg: number | null;
  estimated_weight_kg: number;
  pickup_date: string;
  status: string;
};

export type SupplierProcessedImpact = {
  pickup_id: string;
  processed_weight_kg: number;
  allocated_emission_kgco2e: number;
  has_emission_calculation: boolean;
};

type Props = {
  requests: SupplierImpactItem[];
  processedImpacts: SupplierProcessedImpact[];
};

const completedStatuses = ["completed", "picked_up"];

const numberFormat = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 2,
});

function formatNumber(value: number) {
  return numberFormat.format(
    Number.isFinite(value) ? value : 0
  );
}

function getMonthKey(value: string) {
  return value.slice(0, 7);
}

function getMonthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month, 1)));
}

export default function SupplierImpactWorkspace({
  requests,
  processedImpacts,
}: Props) {
  const [period, setPeriod] = useState<"6" | "12">("6");

  const completed = useMemo(
    () =>
      requests.filter((item) =>
        completedStatuses.includes(
          item.status.toLowerCase()
        )
      ),
    [requests]
  );

  const weighedPickups = useMemo(
    () =>
      completed.filter(
        (item) =>
          item.actual_weight_kg !== null &&
          Number(item.actual_weight_kg) > 0
      ),
    [completed]
  );

  const totalWeight = useMemo(
    () =>
      weighedPickups.reduce(
        (sum, item) =>
          sum + Number(item.actual_weight_kg ?? 0),
        0
      ),
    [weighedPickups]
  );

  const averageWeight =
    weighedPickups.length > 0
      ? totalWeight / weighedPickups.length
      : 0;

  const totalProcessed = processedImpacts.reduce(
    (sum, item) =>
      sum + Number(item.processed_weight_kg ?? 0),
    0
  );

  const calculatedImpacts = processedImpacts.filter(
    (item) => item.has_emission_calculation
  );

  const totalEmission = calculatedImpacts.reduce(
    (sum, item) =>
      sum + Number(item.allocated_emission_kgco2e ?? 0),
    0
  );

  const wasteComposition = useMemo(() => {
    const grouped = new Map<string, number>();

    for (const item of weighedPickups) {
      const weight = Number(
        item.actual_weight_kg ?? 0
      );

      grouped.set(
        item.waste_type,
        (grouped.get(item.waste_type) ?? 0) + weight
      );
    }

    return [...grouped.entries()]
      .map(([name, weight]) => ({
        name,
        weight,
        percentage:
          totalWeight > 0
            ? (weight / totalWeight) * 100
            : 0,
      }))
      .sort((a, b) => b.weight - a.weight);
  }, [weighedPickups, totalWeight]);

  const monthlyData = useMemo(() => {
    const count = Number(period);
    const now = new Date();

    const parts = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "numeric",
      timeZone: "Asia/Jakarta",
    }).formatToParts(now);

    const currentYear = Number(
      parts.find((part) => part.type === "year")
        ?.value ?? now.getUTCFullYear()
    );

    const currentMonth =
      Number(
        parts.find((part) => part.type === "month")
          ?.value ?? now.getUTCMonth() + 1
      ) - 1;

    const months = Array.from(
      { length: count },
      (_, index) => {
        const date = new Date(
          Date.UTC(
            currentYear,
            currentMonth - (count - 1 - index),
            1
          )
        );

        return {
          key: `${date.getUTCFullYear()}-${String(
            date.getUTCMonth() + 1
          ).padStart(2, "0")}`,
          label: getMonthLabel(
            date.getUTCFullYear(),
            date.getUTCMonth()
          ),
          weight: 0,
        };
      }
    );

    const totals = new Map(
      months.map((month) => [month.key, 0])
    );

    for (const item of weighedPickups) {
      const key = getMonthKey(item.pickup_date);

      if (totals.has(key)) {
        totals.set(
          key,
          (totals.get(key) ?? 0) +
            Number(item.actual_weight_kg ?? 0)
        );
      }
    }

    return months.map((month) => ({
      ...month,
      weight: totals.get(month.key) ?? 0,
    }));
  }, [period, weighedPickups]);

  const maxMonthlyWeight = Math.max(
    ...monthlyData.map((item) => item.weight),
    1
  );

  const currentMonthWeight =
    monthlyData[monthlyData.length - 1]?.weight ?? 0;

  const stats = [
    {
      label: "Sampah Terkumpul",
      value: `${formatNumber(totalWeight)} kg`,
      description: "Berat aktual penjemputan selesai",
      icon: Recycle,
      background: "bg-[#EAF3DF]",
    },
    {
      label: "Penjemputan Selesai",
      value: formatNumber(completed.length),
      description: "Permintaan berstatus selesai",
      icon: CheckCircle2,
      background: "bg-[#FFF0B0]",
    },
    {
      label: "Sampah Telah Diolah",
      value: `${formatNumber(totalProcessed)} kg`,
      description: "Input pada batch pengolahan selesai",
      icon: Factory,
      background: "bg-[#E7F2F1]",
    },
    {
      label: "Estimasi Selisih Emisi",
      value: `${formatNumber(totalEmission)} kg`,
      description: "kg CO₂e dari hasil perhitungan Admin",
      icon: Leaf,
      background: "bg-[#F5EAF2]",
    },
  ];

  return (
    <div className="space-y-7">
      {/* STATISTIK */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-[24px] border border-[#EFE5D4] bg-white p-5 shadow-sm"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.background}`}
              >
                <Icon
                  size={24}
                  className="text-[#47763A]"
                />
              </div>

              <p className="mt-5 text-sm font-bold text-[#8C7A65]">
                {stat.label}
              </p>

              <p className="mt-2 text-3xl font-black text-[#332417]">
                {stat.value}
              </p>

              <p className="mt-2 text-xs leading-5 text-[#9A8974]">
                {stat.description}
              </p>
            </div>
          );
        })}
      </section>

      {/* GRAFIK BULANAN */}
      <section className="rounded-[28px] border border-[#EFE5D4] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#47763A]">
              Statistik Kontribusi
            </p>

            <h2 className="mt-2 text-xl font-black sm:text-2xl">
              Perkembangan Sampah Terkumpul
            </h2>

            <p className="mt-2 text-sm text-[#8C7A65]">
              Berat aktual sampah dari penjemputan
              yang telah selesai.
            </p>
          </div>

          <div className="relative">
            <select
              value={period}
              onChange={(event) =>
                setPeriod(
                  event.target.value === "12" ? "12" : "6"
                )
              }
              aria-label="Periode grafik"
              className="appearance-none rounded-2xl border border-[#E8DFD0] bg-[#FFFBF1] py-3 pl-4 pr-10 text-sm font-black outline-none focus:border-[#47763A]"
            >
              <option value="6">6 Bulan Terakhir</option>
              <option value="12">12 Bulan Terakhir</option>
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#47763A]"
            />
          </div>
        </div>

        <div className="mt-8 rounded-[24px] bg-[#FFFBF1] p-5 sm:p-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#8C7A65]">
                Total pada periode terpilih
              </p>

              <p className="mt-2 text-3xl font-black text-[#47763A]">
                {formatNumber(
                  monthlyData.reduce(
                    (sum, item) => sum + item.weight,
                    0
                  )
                )}{" "}
                <span className="text-lg">kg</span>
              </p>
            </div>

            <TrendingUp
              size={29}
              className="text-[#47763A]"
            />
          </div>

          <div
            className="mt-8 grid h-64 items-end gap-2 border-b border-[#DCD8CC] pb-2 sm:gap-4"
            style={{
              gridTemplateColumns: `repeat(${monthlyData.length}, minmax(0, 1fr))`,
            }}
          >
            {monthlyData.map((item) => {
              const percentage =
                (item.weight / maxMonthlyWeight) * 100;

              return (
                <div
                  key={item.key}
                  className="flex h-full min-w-0 flex-col items-center justify-end gap-2"
                >
                  <span className="text-[10px] font-black text-[#47763A] sm:text-xs">
                    {formatNumber(item.weight)}
                  </span>

                  <div className="flex h-[190px] w-full max-w-16 items-end overflow-hidden rounded-t-xl bg-[#EAF3DF]">
                    <div
                      className="w-full rounded-t-xl bg-[#47763A] transition-all duration-300"
                      style={{
                        height: `${percentage}%`,
                      }}
                      title={`${item.label}: ${formatNumber(
                        item.weight
                      )} kg`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="mt-3 grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${monthlyData.length}, minmax(0, 1fr))`,
            }}
          >
            {monthlyData.map((item) => (
              <p
                key={item.key}
                className="min-w-0 text-center text-[10px] font-bold text-[#8C7A65] sm:text-xs"
              >
                {item.label}
              </p>
            ))}
          </div>

          <p className="mt-6 text-xs leading-5 text-[#9A8974]">
            Grafik berdasarkan tanggal penjemputan,
            bukan tanggal pengolahan.
          </p>
        </div>
      </section>

      {/* KOMPOSISI DAN KONTRIBUSI */}
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-[#EFE5D4] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF3DF]">
              <Leaf size={24} className="text-[#47763A]" />
            </div>

            <div>
              <h2 className="text-xl font-black">
                Komposisi Sampah
              </h2>
              <p className="mt-1 text-xs text-[#8C7A65]">
                Berdasarkan jenis dan berat aktual.
              </p>
            </div>
          </div>

          {wasteComposition.length === 0 ? (
            <div className="mt-7 rounded-2xl bg-[#FFFBF1] px-5 py-12 text-center">
              <Recycle
                size={34}
                className="mx-auto text-[#47763A]"
              />
              <h3 className="mt-4 font-black">
                Belum Ada Data Komposisi
              </h3>
              <p className="mt-2 text-sm text-[#8C7A65]">
                Data akan muncul setelah ada penjemputan
                selesai dengan berat aktual.
              </p>
            </div>
          ) : (
            <div className="mt-7 space-y-6">
              {wasteComposition.map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black">
                      {item.name}
                    </p>
                    <p className="text-sm font-black text-[#47763A]">
                      {formatNumber(item.weight)} kg
                    </p>
                  </div>

                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#EAF3DF]">
                    <div
                      className="h-full rounded-full bg-[#47763A]"
                      style={{
                        width: `${Math.min(
                          item.percentage,
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  <p className="mt-2 text-right text-xs text-[#8C7A65]">
                    {formatNumber(item.percentage)}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between rounded-[28px] bg-[#47763A] p-7 text-white sm:p-8">
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <Sprout size={30} />
            </div>

            <p className="mt-7 text-xs font-black uppercase tracking-[0.16em] text-white/75">
              Kontribusi Supplier
            </p>

            <h2 className="mt-3 text-3xl font-black leading-tight">
              Dari Dapur,
              <br />
              Untuk Bumi.
            </h2>

            <p className="mt-5 text-sm leading-7 text-white/80">
              Sampah organik yang disetorkan menjadi
              bagian dari kegiatan pengolahan PUTARASA.
              Dampak emisi dihitung berdasarkan
              hasil batch yang telah diselesaikan.
            </p>

            <div className="mt-7 space-y-3">
              <div className="rounded-2xl bg-white/10 p-5">
                <p className="text-sm text-white/75">
                  Total sampah tercatat
                </p>
                <p className="mt-2 text-3xl font-black">
                  {formatNumber(totalWeight)} kg
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-5">
                <p className="text-sm text-white/75">
                  Telah masuk pengolahan selesai
                </p>
                <p className="mt-2 text-3xl font-black">
                  {formatNumber(totalProcessed)} kg
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-5">
                <p className="text-sm text-white/75">
                  Estimasi selisih emisi
                </p>
                <p className="mt-2 text-3xl font-black">
                  {formatNumber(totalEmission)}
                  <span className="ml-2 text-base">
                    kg CO₂e
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-white/75">
            <ArrowUpRight size={17} />
            Berdasarkan data pengolahan dan perhitungan Admin.
          </div>
        </div>
      </section>

      {/* RINGKASAN PENJEMPUTAN */}
      <section className="rounded-[28px] border border-[#EFE5D4] bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-black">
          Riwayat Kontribusi Pengolahan
        </h2>

        <p className="mt-2 text-sm text-[#8C7A65]">
          Setoran yang telah masuk ke batch pengolahan selesai.
        </p>

        {processedImpacts.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-[#FFFBF1] px-5 py-10 text-center">
            <Factory
              size={34}
              className="mx-auto text-[#47763A]"
            />
            <p className="mt-3 font-bold">
              Belum Ada Kontribusi Pengolahan
            </p>
            <p className="mt-2 text-sm text-[#8C7A65]">
              Data akan muncul setelah setoran masuk
              ke batch yang selesai diolah.
            </p>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#EEE5D6] text-[#8C7A65]">
                  <th className="p-3">Setoran</th>
                  <th className="p-3">Berat Terolah</th>
                  <th className="p-3">Estimasi Emisi</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {processedImpacts.map((item) => (
                  <tr
                    key={item.pickup_id}
                    className="border-b border-[#F4EDE2]"
                  >
                    <td className="p-3 font-bold">
                      {item.pickup_id.slice(0, 8)}
                    </td>

                    <td className="p-3">
                      {formatNumber(
                        item.processed_weight_kg
                      )} kg
                    </td>

                    <td className="p-3 font-bold text-[#47763A]">
                      {item.has_emission_calculation
                        ? `${formatNumber(
                            item.allocated_emission_kgco2e
                          )} kg CO₂e`
                        : "Belum dihitung"}
                    </td>

                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                        <CheckCircle2 size={14} />
                        Selesai diolah
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* METODOLOGI */}
      <section className="rounded-[26px] border border-[#E8DFD0] bg-[#FFF4C8] p-6 sm:p-7">
        <div className="flex items-start gap-4">
          <CalendarDays
            size={25}
            className="shrink-0 text-[#80621C]"
          />

          <div>
            <h3 className="font-black text-[#80621C]">
              Tentang Perhitungan Dampak
            </h3>

            <p className="mt-2 text-sm leading-7 text-[#80621C]">
              Sampah terkumpul dihitung dari berat aktual
              penjemputan selesai. Sampah terolah dihitung
              dari kontribusi setoran pada batch pengolahan
              yang sudah selesai.
            </p>

            <p className="mt-3 text-sm leading-7 text-[#80621C]">
              Estimasi selisih emisi berasal dari hasil
              perhitungan Admin. Untuk batch dengan beberapa
              Supplier, hasilnya dialokasikan berdasarkan
              proporsi berat input masing-masing Supplier.
              Nilai negatif berarti estimasi emisi kegiatan
              lebih besar daripada skenario baseline.
            </p>

            <p className="mt-3 text-sm leading-7 text-[#80621C]">
              Hasil ini merupakan estimasi operasional,
              bukan verifikasi pengurangan emisi ataupun
              kredit karbon.
            </p>

            {calculatedImpacts.length === 0 && (
              <p className="mt-3 rounded-xl bg-white/60 p-3 text-sm font-bold text-[#80621C]">
                Belum ada kontribusi dengan perhitungan
                emisi Admin yang tersedia.
              </p>
            )}

            <p className="mt-3 text-xs text-[#80621C]/80">
              Rata-rata penimbangan:{" "}
              {formatNumber(averageWeight)} kg.
              Terkumpul bulan ini:{" "}
              {formatNumber(currentMonthWeight)} kg.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
