
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RewardForm from "./RewardForm";
import { toggleReward } from "./actions";

export default async function AdminRewardsPage() {
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

  const { data, error } = await supabase
    .from("reward_catalog")
    .select(
      "id, name, description, points_cost, cost_idr, stock, is_active"
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const rewards = data ?? [];

  const active = rewards.filter(
    (item) => item.is_active
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
            Katalog Hadiah
          </h1>

          <p className="mt-3 text-sm leading-7 text-[#817665]">
            Kelola hadiah sembako, kebutuhan poin,
            stok, dan biaya program PUTARASA.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            ["Total Hadiah", rewards.length],
            ["Hadiah Aktif", active],
            ["Draft / Nonaktif", rewards.length - active],
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

        <div className="grid items-start gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          <RewardForm />

          <section className="rounded-[26px] border border-[#EAE1CF] bg-white p-6">
            <h2 className="text-xl font-black">
              Daftar Hadiah
            </h2>

            {rewards.length === 0 ? (
              <div className="py-16 text-center text-sm text-[#817665]">
                Belum ada hadiah. Tambahkan hadiah
                pertama melalui formulir.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {rewards.map((reward) => (
                  <article
                    key={reward.id}
                    className="rounded-2xl border border-[#EAE1CF] bg-[#FFFCF7] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black">
                          {reward.name}
                        </h3>

                        <p className="mt-2 text-sm text-[#817665]">
                          {reward.description ||
                            "Tidak ada deskripsi."}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                          reward.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-stone-200 text-stone-700"
                        }`}
                      >
                        {reward.is_active
                          ? "Aktif"
                          : "Draft"}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-xs text-[#817665]">
                          Poin
                        </p>
                        <p className="mt-1 font-black">
                          {reward.points_cost.toLocaleString(
                            "id-ID"
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-3">
                        <p className="text-xs text-[#817665]">
                          Biaya
                        </p>
                        <p className="mt-1 font-black">
                          Rp{" "}
                          {Number(
                            reward.cost_idr ?? 0
                          ).toLocaleString("id-ID")}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-3">
                        <p className="text-xs text-[#817665]">
                          Stok
                        </p>
                        <p className="mt-1 font-black">
                          {reward.stock}
                        </p>
                      </div>
                    </div>

                    <form
                      action={async () => {
                        "use server";
                        await toggleReward(
                          reward.id,
                          !reward.is_active
                        );
                      }}
                      className="mt-5 border-t border-[#EAE1CF] pt-4"
                    >
                      <button
                        type="submit"
                        className="rounded-xl bg-[#47763A] px-4 py-2.5 text-xs font-bold text-white"
                      >
                        {reward.is_active
                          ? "Nonaktifkan Hadiah"
                          : "Aktifkan Hadiah"}
                      </button>
                    </form>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
