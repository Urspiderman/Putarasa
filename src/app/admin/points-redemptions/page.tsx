
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RedemptionActions from "./RedemptionActions";

export default async function AdminRedemptionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!role) redirect("/dashboard");

  const [
    redemptionsResult,
    rewardsResult,
    storesResult,
    profilesResult,
  ] = await Promise.all([
    supabase
      .from("reward_redemptions")
      .select(
        "id, supplier_id, reward_id, store_id, redemption_code, points_spent, status, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(100),

    supabase
      .from("reward_catalog")
      .select("id, name"),

    supabase
      .from("partner_stores")
      .select("id, name"),

    supabase
      .from("profiles")
      .select("id, full_name"),
  ]);

  for (const result of [
    redemptionsResult,
    rewardsResult,
    storesResult,
    profilesResult,
  ]) {
    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  const rewardMap = new Map(
    (rewardsResult.data ?? []).map((item) => [
      item.id,
      item.name,
    ])
  );

  const storeMap = new Map(
    (storesResult.data ?? []).map((item) => [
      item.id,
      item.name,
    ])
  );

  const profileMap = new Map(
    (profilesResult.data ?? []).map((item) => [
      item.id,
      item.full_name,
    ])
  );

  const redemptions = redemptionsResult.data ?? [];

  const pending = redemptions.filter(
    (item) =>
      item.status === "pending" ||
      item.status === "ready"
  ).length;

  return (
    <main className="min-h-screen bg-[#FFFBF1] px-4 py-8 text-[#332417] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-7">
        <header>
          <Link
            href="/admin"
            className="text-sm font-bold text-[#47763A]"
          >
            ← Kembali ke Admin
          </Link>

          <div className="mt-5 inline-block rounded-full bg-[#E7F0DC] px-4 py-2 text-xs font-bold text-[#47763A]">
            PUTARASA POIN
          </div>

          <h1 className="mt-4 text-3xl font-black sm:text-4xl">
            Penukaran Hadiah
          </h1>

          <p className="mt-3 text-sm leading-7 text-[#817665]">
            Kelola permintaan penukaran sembako.
            Pastikan identitas, kode, dan penyerahan
            hadiah sudah sesuai sebelum menyelesaikan
            transaksi.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            ["Total Ditampilkan", redemptions.length],
            ["Perlu Diproses", pending],
            [
              "Selesai",
              redemptions.filter(
                (item) => item.status === "redeemed"
              ).length,
            ],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-2xl border border-[#EAE1CF] bg-white p-6"
            >
              <p className="text-sm text-[#817665]">
                {label}
              </p>
              <p className="mt-3 text-3xl font-black">
                {value}
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-[26px] border border-[#EAE1CF] bg-white p-6">
          <h2 className="text-xl font-black">
            Daftar Permintaan Penukaran
          </h2>

          {redemptions.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-bold">
                Belum Ada Penukaran
              </p>

              <p className="mt-2 text-sm text-[#817665]">
                Permintaan penukaran akan muncul
                setelah program dibuka dan Supplier
                mengajukan hadiah.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {redemptions.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[#EAE1CF] bg-[#FFFCF7] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black">
                        {rewardMap.get(item.reward_id) ||
                          "Hadiah"}
                      </h3>

                      <p className="mt-2 text-sm text-[#817665]">
                        Supplier:{" "}
                        {profileMap.get(item.supplier_id) ||
                          "Tidak diketahui"}
                      </p>

                      <p className="mt-1 text-sm text-[#817665]">
                        Warung:{" "}
                        {storeMap.get(item.store_id) ||
                          "Tidak diketahui"}
                      </p>
                    </div>

                    <span className="rounded-full bg-[#FFF0B5] px-3 py-1.5 text-xs font-bold">
                      {item.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 rounded-xl bg-white p-4 text-sm">
                    <p>
                      <span className="text-[#817665]">
                        Poin:
                      </span>{" "}
                      <strong>
                        {item.points_spent.toLocaleString(
                          "id-ID"
                        )}
                      </strong>
                    </p>

                    <p>
                      <span className="text-[#817665]">
                        Dibuat:
                      </span>{" "}
                      {new Date(
                        item.created_at
                      ).toLocaleString("id-ID")}
                    </p>

                    <p className="text-xs text-[#817665]">
                      Kode pengambilan diverifikasi
                      dari Supplier saat penyerahan.
                    </p>
                  </div>

                  {(item.status === "pending" ||
                    item.status === "ready") && (
                    <RedemptionActions
                      redemptionId={item.id}
                    />
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
