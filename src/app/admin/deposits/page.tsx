
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DepositWorkspace from "./DepositWorkspace";

export default async function AdminDepositsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: adminRole, error: roleError } =
    await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

  if (roleError || !adminRole) {
    redirect("/dashboard");
  }

  const [
    suppliersResult,
    profilesResult,
    outletsResult,
    depositsResult,
  ] = await Promise.all([
    supabase
      .from("supplier_profiles")
      .select("user_id")
      .eq("supplier_type", "individual"),

    supabase
      .from("profiles")
      .select("id, full_name"),

    supabase
      .from("outlets")
      .select("id, name")
      .eq("is_active", true)
      .order("name"),

    supabase
      .from("waste_deposits")
      .select(
        "id, supplier_id, outlet_id, waste_type, gross_weight_kg, accepted_weight_kg, points_awarded, status, notes, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  for (const result of [
    suppliersResult,
    profilesResult,
    outletsResult,
    depositsResult,
  ]) {
    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  const nameMap = new Map(
    (profilesResult.data ?? []).map((profile) => [
      profile.id,
      profile.full_name,
    ])
  );

  const outletMap = new Map(
    (outletsResult.data ?? []).map((outlet) => [
      outlet.id,
      outlet.name,
    ])
  );

  const suppliers = (
    suppliersResult.data ?? []
  ).map((supplier) => ({
    user_id: supplier.user_id,
    name:
      nameMap.get(supplier.user_id) ||
      `Supplier ${supplier.user_id.slice(0, 8)}`,
  }));

  const deposits = (
    depositsResult.data ?? []
  ).map((deposit) => ({
    ...deposit,
    gross_weight_kg: Number(
      deposit.gross_weight_kg
    ),
    accepted_weight_kg:
      deposit.accepted_weight_kg === null
        ? null
        : Number(deposit.accepted_weight_kg),
    supplier_name:
      nameMap.get(deposit.supplier_id) ||
      "Supplier",
    outlet_name:
      outletMap.get(deposit.outlet_id) ||
      "Outlet tidak aktif / tidak ditemukan",
  }));

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

          <div className="mt-5 inline-flex rounded-full bg-[#E7F0DC] px-4 py-2 text-xs font-bold text-[#47763A]">
            PUTARASA POIN
          </div>

          <h1 className="mt-4 text-3xl font-black sm:text-4xl">
            Setoran Sampah
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#817665]">
            Catat sampah organik yang diterima di
            outlet, periksa berat yang layak diterima,
            lalu verifikasi untuk memberikan poin
            kepada masyarakat.
          </p>
        </header>

        <DepositWorkspace
          suppliers={suppliers}
          outlets={outletsResult.data ?? []}
          deposits={deposits}
        />
      </div>
    </main>
  );
}
