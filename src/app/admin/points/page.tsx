
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PutarasaPointsNavigation from "@/components/PutarasaPointsNavigation";

export default async function AdminPointsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: role, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (error || !role) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#FFFBF1] px-4 py-8 text-[#332417] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-7">
        <header>
          <Link
            href="/admin"
            className="text-sm font-bold text-[#47763A]"
          >
            ← Kembali ke Dashboard Admin
          </Link>

          <div className="mt-5 inline-flex rounded-full bg-[#E7F0DC] px-4 py-2 text-xs font-bold text-[#47763A]">
            PUTARASA POIN
          </div>

          <h1 className="mt-4 text-3xl font-black sm:text-4xl">
            Pusat Pengelolaan Poin
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#817665]">
            Kelola outlet, setoran sampah masyarakat,
            hadiah sembako, warung mitra, dan anggaran
            program melalui satu halaman.
          </p>
        </header>

        <PutarasaPointsNavigation role="admin" />

        <section className="rounded-2xl border border-[#EAE1CF] bg-white p-6">
          <h2 className="font-black">
            Status Pengembangan
          </h2>

          <p className="mt-2 text-sm leading-7 text-[#817665]">
            Modul administrasi PUTARASA Poin sudah
            disusun. Penukaran hadiah nyata tetap
            belum dibuka sampai pendanaan dan
            pengujian transaksi dinyatakan siap.
          </p>
        </section>
      </div>
    </main>
  );
}
