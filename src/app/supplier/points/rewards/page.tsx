
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RewardsWorkspace from "./RewardsWorkspace";

export const dynamic = "force-dynamic";

export default async function SupplierRewardsPage() {
  const supabase = await createClient();

  // ==============================
  // 1. AUTENTIKASI
  // ==============================
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // ==============================
  // 2. VALIDASI ROLE SUPPLIER
  // ==============================
  const { data: role, error: roleError } =
    await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "supplier")
      .maybeSingle();

  if (roleError || !role) {
    redirect("/dashboard");
  }

  // ==============================
  // 3. VALIDASI SUPPLIER INDIVIDU
  // ==============================
  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("supplier_profiles")
    .select("supplier_type")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (
    !profile ||
    profile.supplier_type !== "individual"
  ) {
    redirect("/supplier/points");
  }

  // ==============================
  // 4. AMBIL DATA UTAMA
  // ==============================
  const [
    settingsResult,
    balanceResult,
    rewardsResult,
    storesResult,
    redemptionsResult,
  ] = await Promise.all([
    supabase
      .from("point_settings")
      .select("redemption_enabled")
      .eq("id", 1)
      .single(),

    supabase.rpc("putarasa_point_balance", {
      p_supplier_id: user.id,
    }),

    supabase
      .from("reward_catalog")
      .select(
        "id, name, description, points_cost, stock"
      )
      .eq("is_active", true)
      .order("points_cost", {
        ascending: true,
      }),

    supabase
      .from("partner_stores")
      .select("id, name, address")
      .eq("is_active", true)
      .order("name", {
        ascending: true,
      }),

    supabase
      .from("reward_redemptions")
      .select(
        "id, reward_id, store_id, redemption_code, points_spent, status, created_at"
      )
      .eq("supplier_id", user.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(30),
  ]);

  // ==============================
  // 5. VALIDASI ERROR DATABASE
  // ==============================
  const results = [
    settingsResult,
    balanceResult,
    rewardsResult,
    storesResult,
    redemptionsResult,
  ];

  for (const result of results) {
    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  const rewards = rewardsResult.data ?? [];
  const stores = storesResult.data ?? [];
  const rawRedemptions =
    redemptionsResult.data ?? [];

  // ==============================
  // 6. AMBIL NAMA HADIAH & WARUNG
  // TERMASUK YANG SUDAH NONAKTIF
  // ==============================
  const rewardIds = [
    ...new Set(
      rawRedemptions.map(
        (item) => item.reward_id
      )
    ),
  ];

  const storeIds = [
    ...new Set(
      rawRedemptions.map(
        (item) => item.store_id
      )
    ),
  ];

  const [historyRewards, historyStores] =
    await Promise.all([
      rewardIds.length > 0
        ? supabase
            .from("reward_catalog")
            .select("id, name")
            .in("id", rewardIds)
        : Promise.resolve({
            data: [] as {
              id: string;
              name: string;
            }[],
            error: null,
          }),

      storeIds.length > 0
        ? supabase
            .from("partner_stores")
            .select("id, name")
            .in("id", storeIds)
        : Promise.resolve({
            data: [] as {
              id: string;
              name: string;
            }[],
            error: null,
          }),
    ]);

  if (historyRewards.error) {
    throw new Error(
      historyRewards.error.message
    );
  }

  if (historyStores.error) {
    throw new Error(
      historyStores.error.message
    );
  }

  const rewardNames = new Map(
    (historyRewards.data ?? []).map(
      (item) => [item.id, item.name]
    )
  );

  const storeNames = new Map(
    (historyStores.data ?? []).map(
      (item) => [item.id, item.name]
    )
  );

  // ==============================
  // 7. FORMAT RIWAYAT PENUKARAN
  // ==============================
  const redemptions = rawRedemptions.map(
    (item) => ({
      id: item.id,
      redemption_code: item.redemption_code,
      points_spent: item.points_spent,
      status: item.status,
      created_at: item.created_at,

      reward_name:
        rewardNames.get(item.reward_id) ??
        "Hadiah tidak ditemukan",

      store_name:
        storeNames.get(item.store_id) ??
        "Warung tidak ditemukan",
    })
  );

  // ==============================
  // 8. SALDO & STATUS PROGRAM
  // ==============================
  const balance = Number(
    balanceResult.data ?? 0
  );

  const enabled =
    settingsResult.data?.redemption_enabled ===
    true;

  // ==============================
  // 9. RENDER HALAMAN
  // ==============================
  return (
    <main className="min-h-screen bg-[#FFFBF1] px-4 py-8 text-[#332417] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-7">
        <header>
          <Link
            href="/supplier/points"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#47763A] transition hover:underline"
          >
            ← Kembali ke Dompet Poin
          </Link>

          <div className="mt-5 inline-flex rounded-full bg-[#E7F0DC] px-4 py-2 text-xs font-bold text-[#47763A]">
            PUTARASA POIN
          </div>

          <h1 className="mt-4 text-3xl font-black sm:text-4xl">
            Katalog Hadiah
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#817665]">
            Tukarkan poin hasil setoran sampah
            organik dengan kebutuhan rumah tangga
            melalui warung mitra PUTARASA.
          </p>
        </header>

        {!enabled && (
          <div className="rounded-2xl border border-[#F0D99B] bg-[#FFF5D8] p-5">
            <h2 className="font-black text-[#76541B]">
              Penukaran Hadiah Belum Dibuka
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#866A38]">
              Kamu tetap dapat melihat katalog
              hadiah dan saldo poin. Penukaran
              akan tersedia setelah program
              resmi diaktifkan.
            </p>
          </div>
        )}

        <RewardsWorkspace
          rewards={rewards}
          stores={stores}
          redemptions={redemptions}
          balance={balance}
          enabled={enabled}
        />
      </div>
    </main>
  );
}
