
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SupplierProfileForm from "./SupplierProfileForm";

type PointTransaction = {
  id: string;
  amount: number;
  transaction_type: string;
  created_at: string;
};

export default async function SupplierPointsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "supplier")
    .maybeSingle();

  if (!role) redirect("/dashboard");

  const { data: profile, error: profileError } =
    await supabase
      .from("supplier_profiles")
      .select("supplier_type, institution_name")
      .eq("user_id", user.id)
      .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#FFFBF1] px-4 py-10 text-[#332417]">
        <SupplierProfileForm />
      </main>
    );
  }

  if (profile.supplier_type === "institution") {
    return (
      <main className="min-h-screen bg-[#FFFBF1] px-4 py-10 text-[#332417]">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#EAE1CF] bg-white p-8">
          <h1 className="text-2xl font-black">
            Supplier Institusi
          </h1>
          <p className="mt-3 text-[#817665]">
            Program PUTARASA Poin saat ini
            diperuntukkan bagi Supplier individu.
            Akun institusi tetap dapat menggunakan
            layanan penjemputan sampah.
          </p>
          <Link
            href="/supplier"
            className="mt-6 inline-block font-bold text-[#47763A]"
          >
            ← Kembali ke Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const [balanceResult, transactionResult, depositResult] =
    await Promise.all([
      supabase.rpc("putarasa_point_balance", {
        p_supplier_id: user.id,
      }),

      supabase
        .from("point_transactions")
        .select(
          "id, amount, transaction_type, created_at"
        )
        .eq("supplier_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30),

      supabase
        .from("waste_deposits")
        .select("id, status, points_awarded")
        .eq("supplier_id", user.id),
    ]);

  if (balanceResult.error) {
    throw new Error(balanceResult.error.message);
  }

  if (transactionResult.error) {
    throw new Error(transactionResult.error.message);
  }

  if (depositResult.error) {
    throw new Error(depositResult.error.message);
  }

  const balance = Number(balanceResult.data ?? 0);

  const transactions =
    (transactionResult.data ?? []) as PointTransaction[];

  const deposits = depositResult.data ?? [];

  const verified = deposits.filter(
    (item) => item.status === "verified"
  ).length;

  const pending = deposits.filter(
    (item) => item.status === "pending"
  ).length;

  return (
    <main className="min-h-screen bg-[#FFFBF1] px-4 py-8 text-[#332417] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-7">
        <header>
          <Link
            href="/supplier"
            className="text-sm font-bold text-[#47763A]"
          >
            ← Kembali ke Dashboard
          </Link>

          <div className="mt-5 inline-flex rounded-full bg-[#E7F0DC] px-4 py-2 text-xs font-bold text-[#47763A]">
            PUTARASA POIN
          </div>

          <h1 className="mt-4 text-3xl font-black sm:text-4xl">
            Dompet Poin Saya
          </h1>

          <p className="mt-3 text-sm leading-7 text-[#817665]">
            Kumpulkan poin dari sampah organik yang
            sudah diverifikasi oleh Admin outlet.
          </p>
        </header>

        <section className="rounded-[30px] bg-[#47763A] p-7 text-white sm:p-9">
          <p className="text-sm font-semibold text-white/80">
            Total Saldo Poin
          </p>

          <p className="mt-3 text-5xl font-black">
            {balance.toLocaleString("id-ID")}
            <span className="ml-2 text-lg font-semibold">
              Poin
            </span>
          </p>

          <p className="mt-5 text-sm text-white/80">
            Poin diperoleh setelah setoran sampah
            diverifikasi. Nilai poin bukan saldo uang.
          </p>

          <Link
            href="/supplier/points/rewards"
            className="mt-6 inline-flex rounded-xl bg-[#FFDA57] px-5 py-3 text-sm font-black text-[#332417]"
          >
            Lihat Katalog Hadiah →
          </Link>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#EAE1CF] bg-white p-6">
            <p className="text-sm text-[#817665]">
              Setoran Terverifikasi
            </p>
            <p className="mt-3 text-3xl font-black">
              {verified}
            </p>
          </div>

          <div className="rounded-2xl border border-[#EAE1CF] bg-white p-6">
            <p className="text-sm text-[#817665]">
              Menunggu Verifikasi
            </p>
            <p className="mt-3 text-3xl font-black">
              {pending}
            </p>
          </div>
        </section>

        <section className="rounded-[26px] border border-[#EAE1CF] bg-white p-6">
          <h2 className="text-xl font-black">
            Riwayat Poin
          </h2>

          {transactions.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#817665]">
              Belum ada transaksi poin.
              Setorkan sampah ke outlet untuk mulai
              mengumpulkan poin.
            </div>
          ) : (
            <div className="mt-5 divide-y divide-[#EAE1CF]">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div>
                    <p className="font-bold">
                      {transaction.transaction_type ===
                      "deposit"
                        ? "Poin dari Setoran"
                        : transaction.transaction_type ===
                            "redemption"
                          ? "Penukaran Hadiah"
                          : "Pengembalian Poin"}
                    </p>

                    <p className="mt-1 text-xs text-[#817665]">
                      {new Date(
                        transaction.created_at
                      ).toLocaleString("id-ID")}
                    </p>
                  </div>

                  <p
                    className={`text-lg font-black ${
                      transaction.amount > 0
                        ? "text-[#47763A]"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.amount > 0 ? "+" : ""}
                    {transaction.amount.toLocaleString(
                      "id-ID"
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
