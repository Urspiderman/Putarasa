
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PutarasaPointsNavigation from "@/components/PutarasaPointsNavigation";

export default async function SupplierPointsMenuPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: role, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "supplier")
    .maybeSingle();

  if (error || !role) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#FFFBF1] px-4 py-8 text-[#332417] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-7">
        <header>
          <Link
            href="/supplier"
            className="text-sm font-bold text-[#47763A]"
          >
            ← Kembali ke Dashboard Supplier
          </Link>

          <div className="mt-5 inline-flex rounded-full bg-[#E7F0DC] px-4 py-2 text-xs font-bold text-[#47763A]">
            PROGRAM REWARD
          </div>

          <h1 className="mt-4 text-3xl font-black sm:text-4xl">
            PUTARASA Poin
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#817665]">
            Setorkan sampah organik ke outlet,
            kumpulkan poin setelah verifikasi,
            dan jelajahi katalog hadiah.
          </p>
        </header>

        <PutarasaPointsNavigation role="supplier" />
      </div>
    </main>
  );
}
