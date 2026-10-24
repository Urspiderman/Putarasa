
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { togglePartner } from "./actions";
import PartnerForm from "./PartnerForm";

export default async function AdminPartnersPage() {
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
    .from("partner_stores")
    .select(
      "id, name, address, contact_phone, is_active"
    )
    .order("name");

  if (error) throw new Error(error.message);

  const partners = data ?? [];
  const active = partners.filter(
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
            Warung Mitra
          </h1>

          <p className="mt-3 text-sm leading-7 text-[#817665]">
            Kelola warung yang menjadi lokasi
            pengambilan hadiah sembako masyarakat.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            ["Total Mitra", partners.length],
            ["Mitra Aktif", active],
            ["Tidak Aktif", partners.length - active],
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
          <PartnerForm />

          <section className="rounded-[26px] border border-[#EAE1CF] bg-white p-6">
            <h2 className="text-xl font-black">
              Daftar Warung Mitra
            </h2>

            {partners.length === 0 ? (
              <div className="py-16 text-center text-sm text-[#817665]">
                Belum ada warung mitra.
                Tambahkan warung pertama melalui
                formulir di sebelah kiri.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {partners.map((partner) => (
                  <article
                    key={partner.id}
                    className="rounded-2xl border border-[#EAE1CF] bg-[#FFFCF7] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black">
                          {partner.name}
                        </h3>

                        <p className="mt-2 text-sm text-[#817665]">
                          {partner.address}
                        </p>

                        {partner.contact_phone && (
                          <p className="mt-1 text-sm text-[#817665]">
                            Kontak: {partner.contact_phone}
                          </p>
                        )}
                      </div>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                          partner.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-stone-200 text-stone-700"
                        }`}
                      >
                        {partner.is_active
                          ? "Aktif"
                          : "Tidak Aktif"}
                      </span>
                    </div>

                    <form
                      action={async () => {
                        "use server";
                        await togglePartner(
                          partner.id,
                          !partner.is_active
                        );
                      }}
                      className="mt-5 border-t border-[#EAE1CF] pt-4"
                    >
                      <button
                        type="submit"
                        className="rounded-xl bg-[#47763A] px-4 py-2.5 text-xs font-bold text-white"
                      >
                        {partner.is_active
                          ? "Nonaktifkan Mitra"
                          : "Aktifkan Mitra"}
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
