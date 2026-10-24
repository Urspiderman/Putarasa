
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Landmark,
  Wallet,
  LockKeyhole,
  CheckCircle2,
  History,
  AlertTriangle,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import FundingForm from "./FundingForm";

export const dynamic = "force-dynamic";

function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

type Funding = {
  id: string;
  source_name: string;
  amount_idr: number;
  notes: string | null;
  created_at: string;
};

type Allocation = {
  amount_idr: number;
  status: string;
};

export default async function PointsBudgetPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: role, error: roleError } =
    await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

  if (roleError || !role) {
    redirect("/admin/dashboard");
  }

  const [
    fundingResult,
    allocationResult,
    settingsResult,
  ] = await Promise.all([
    supabase
      .from("reward_funding")
      .select(
        "id, source_name, amount_idr, notes, created_at"
      )
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("reward_budget_allocations")
      .select("amount_idr, status"),

    supabase
      .from("point_settings")
      .select("redemption_enabled")
      .eq("id", 1)
      .maybeSingle(),
  ]);

  if (
    fundingResult.error ||
    allocationResult.error ||
    settingsResult.error
  ) {
    return (
      <main className="min-h-screen bg-[#FFFBF1] p-6">
        <div className="mx-auto max-w-5xl rounded-2xl border border-red-200 bg-white p-6">
          <h1 className="text-xl font-black text-red-700">
            Gagal memuat anggaran
          </h1>

          <p className="mt-2 text-sm text-[#817665]">
            Periksa izin RLS dan struktur tabel
            reward_funding, reward_budget_allocations,
            serta point_settings.
          </p>

          <pre className="mt-4 whitespace-pre-wrap text-xs text-red-600">
            {fundingResult.error?.message ??
              allocationResult.error?.message ??
              settingsResult.error?.message}
          </pre>
        </div>
      </main>
    );
  }

  const fundings =
    (fundingResult.data ?? []) as Funding[];

  const allocations =
    (allocationResult.data ?? []) as Allocation[];

  const totalFunding = fundings.reduce(
    (sum, item) => sum + Number(item.amount_idr),
    0
  );

  const reserved = allocations
    .filter((item) => item.status === "reserved")
    .reduce(
      (sum, item) => sum + Number(item.amount_idr),
      0
    );

  const spent = allocations
    .filter((item) => item.status === "spent")
    .reduce(
      (sum, item) => sum + Number(item.amount_idr),
      0
    );

  const available =
    totalFunding - reserved - spent;

  const redemptionEnabled =
    settingsResult.data?.redemption_enabled === true;

  const cards = [
    {
      title: "Total Dana Masuk",
      value: rupiah(totalFunding),
      icon: Landmark,
      bg: "bg-[#FFF0B5]",
      color: "text-[#8A681A]",
    },
    {
      title: "Dana Tersedia",
      value: rupiah(available),
      icon: Wallet,
      bg: "bg-[#EAF3DF]",
      color: "text-[#47763A]",
    },
    {
      title: "Dana Direservasi",
      value: rupiah(reserved),
      icon: LockKeyhole,
      bg: "bg-[#F0E9FF]",
      color: "text-[#7553A6]",
    },
    {
      title: "Dana Digunakan",
      value: rupiah(spent),
      icon: CheckCircle2,
      bg: "bg-[#E6F1FA]",
      color: "text-[#3276A6]",
    },
  ];

  return (
    <main className="min-h-screen bg-[#FFFBF1] px-4 py-8 text-[#332417] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header>
          <Link
            href="/admin/points"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#47763A] hover:underline"
          >
            <ArrowLeft size={17} />
            Kembali ke PUTARASA Poin
          </Link>

          <div className="mt-5 inline-flex rounded-full bg-[#EAF3DF] px-4 py-2 text-xs font-black text-[#47763A]">
            PENGELOLAAN ANGGARAN
          </div>

          <h1 className="mt-4 text-3xl font-black sm:text-4xl">
            Anggaran PUTARASA Poin
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#817665]">
            Pantau pendanaan sponsor, alokasi hadiah,
            dan ketersediaan anggaran program.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-[24px] border border-[#EAE1CF] bg-white p-5 shadow-sm"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${card.bg} ${card.color}`}
                >
                  <Icon size={23} />
                </div>

                <p className="text-sm font-semibold text-[#817665]">
                  {card.title}
                </p>

                <p className="mt-2 break-words text-2xl font-black text-[#332417]">
                  {card.value}
                </p>
              </div>
            );
          })}
        </section>

        <div
          className={`flex items-start gap-3 rounded-2xl border p-5 ${
            redemptionEnabled
              ? "border-amber-200 bg-amber-50"
              : "border-[#D5E5CA] bg-[#F0F7EA]"
          }`}
        >
          {redemptionEnabled ? (
            <AlertTriangle
              size={22}
              className="shrink-0 text-amber-700"
            />
          ) : (
            <LockKeyhole
              size={22}
              className="shrink-0 text-[#47763A]"
            />
          )}

          <div>
            <h2 className="font-black">
              Penukaran Hadiah:{" "}
              {redemptionEnabled
                ? "AKTIF"
                : "NONAKTIF"}
            </h2>

            <p className="mt-1 text-sm leading-6 text-[#817665]">
              {redemptionEnabled
                ? "Pastikan seluruh pengujian transaksi, stok, dan anggaran telah selesai."
                : "Penukaran hadiah belum dibuka. Pencatatan dana sponsor tidak otomatis mengaktifkan penukaran."}
            </p>
          </div>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <FundingForm />

          <section className="rounded-[26px] border border-[#EAE1CF] bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0B5] text-[#8A681A]">
                <History size={23} />
              </div>

              <div>
                <h2 className="text-xl font-black">
                  Riwayat Pendanaan
                </h2>

                <p className="mt-1 text-xs text-[#8C7A65]">
                  {fundings.length} catatan pendanaan
                </p>
              </div>
            </div>

            {fundings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#EAE1CF] bg-[#FFFBF1] px-5 py-12 text-center">
                <Landmark
                  size={34}
                  className="mx-auto text-[#A69A86]"
                />

                <p className="mt-4 font-bold">
                  Belum Ada Pendanaan
                </p>

                <p className="mt-2 text-sm leading-6 text-[#817665]">
                  Catatan sponsor akan muncul
                  setelah dana diterima dan dicatat.
                </p>
              </div>
            ) : (
              <div className="max-h-[650px] space-y-3 overflow-y-auto pr-1">
                {fundings.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[#EAE1CF] bg-[#FFFBF1] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-black">
                          {item.source_name}
                        </p>

                        <p className="mt-1 text-xs text-[#817665]">
                          {formatDate(item.created_at)}
                        </p>
                      </div>

                      <span className="rounded-xl bg-[#EAF3DF] px-3 py-2 text-sm font-black text-[#47763A]">
                        {rupiah(
                          Number(item.amount_idr)
                        )}
                      </span>
                    </div>

                    {item.notes && (
                      <p className="mt-3 text-sm leading-6 text-[#817665]">
                        {item.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <p className="text-xs leading-6 text-[#817665]">
          Dana tersedia dihitung dari total pendanaan
          dikurangi alokasi berstatus reserved dan spent.
          Seluruh nominal mengikuti catatan yang
          tersimpan dalam database.
        </p>
      </div>
    </main>
  );
}
