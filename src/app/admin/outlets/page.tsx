
import { createClient } from "@/lib/supabase/server";
import { createOutlet, toggleOutlet } from "./actions";
import {
  MapPin,
  Plus,
  Store,
  CheckCircle2,
  CircleOff,
  ArrowLeft,
  Leaf,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

type Outlet = {
  id: string;
  name: string;
  address: string;
  is_active: boolean;
  created_at: string;
};

export default async function AdminOutletsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!role) {
    redirect("/dashboard");
  }

  const { data, error } = await supabase
    .from("outlets")
    .select(
      "id, name, address, is_active, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      `Gagal mengambil data outlet: ${error.message}`
    );
  }

  const outlets = (data ?? []) as Outlet[];

  const total = outlets.length;
  const active = outlets.filter(
    (outlet) => outlet.is_active
  ).length;
  const inactive = total - active;

  return (
    <main className="min-h-screen bg-[#FFFBF1] px-4 py-8 text-[#332417] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* HEADER */}
        <header className="space-y-5">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#47763A] transition hover:opacity-70"
          >
            <ArrowLeft size={17} />
            Kembali ke Admin
          </Link>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#E7F0DC] px-4 py-2 text-xs font-bold text-[#47763A]">
                <Leaf size={15} />
                PUTARASA POIN
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Kelola Outlet
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#796D5B] sm:text-base">
                Atur lokasi penerimaan sampah organik
                masyarakat. Outlet aktif dapat dipilih
                saat Admin mencatat setoran sampah.
              </p>
            </div>
          </div>
        </header>

        {/* SUMMARY */}
        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Total Outlet"
            value={total}
            icon={<Store size={22} />}
            color="bg-[#FFF0B5]"
          />

          <SummaryCard
            title="Outlet Aktif"
            value={active}
            icon={<CheckCircle2 size={22} />}
            color="bg-[#E4F0DC]"
          />

          <SummaryCard
            title="Tidak Aktif"
            value={inactive}
            icon={<CircleOff size={22} />}
            color="bg-[#F5E7DD]"
          />
        </section>

        {/* MAIN CONTENT */}
        <section className="grid items-start gap-6 lg:grid-cols-[390px_minmax(0,1fr)]">
          {/* FORM */}
          <div className="rounded-[28px] border border-[#EAE1CF] bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFDA57]">
                <Plus size={24} strokeWidth={2.5} />
              </div>

              <div>
                <h2 className="text-xl font-black">
                  Tambah Outlet
                </h2>
                <p className="text-xs text-[#8C806D]">
                  Daftarkan lokasi penerimaan baru
                </p>
              </div>
            </div>

            <form
              action={createOutlet}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-bold"
                >
                  Nama Outlet
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  minLength={3}
                  maxLength={120}
                  placeholder="Contoh: Outlet PUTARASA Pusat"
                  className="w-full rounded-2xl border border-[#E8DFD1] bg-[#FFFCF6] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#A89D8C] focus:border-[#47763A] focus:ring-2 focus:ring-[#47763A]/10"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="address"
                  className="block text-sm font-bold"
                >
                  Alamat Lengkap
                </label>

                <textarea
                  id="address"
                  name="address"
                  rows={4}
                  required
                  minLength={5}
                  maxLength={500}
                  placeholder="Masukkan alamat outlet secara lengkap..."
                  className="w-full resize-none rounded-2xl border border-[#E8DFD1] bg-[#FFFCF6] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#A89D8C] focus:border-[#47763A] focus:ring-2 focus:ring-[#47763A]/10"
                />
              </div>

              <div className="rounded-2xl bg-[#F3F8EC] p-4 text-xs leading-6 text-[#47763A]">
                Outlet baru akan langsung berstatus
                <strong> aktif</strong> dan dapat digunakan
                untuk pencatatan setoran.
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#47763A] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#365C2C]"
              >
                <Plus size={19} />
                Simpan Outlet
              </button>
            </form>
          </div>

          {/* LIST */}
          <div className="rounded-[28px] border border-[#EAE1CF] bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">
                  Daftar Outlet
                </h2>

                <p className="mt-1 text-sm text-[#8C806D]">
                  {total} outlet terdaftar
                </p>
              </div>

              <span className="rounded-full bg-[#FFF4CC] px-4 py-2 text-xs font-bold text-[#76591B]">
                Lokasi PUTARASA
              </span>
            </div>

            {outlets.length === 0 ? (
              <div className="flex min-h-[340px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#EAE1CF] bg-[#FFFCF7] px-6 text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#FFF0B5]">
                  <MapPin
                    size={34}
                    className="text-[#8C6C19]"
                  />
                </div>

                <h3 className="text-lg font-black">
                  Belum Ada Outlet
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-7 text-[#8C806D]">
                  Tambahkan outlet pertama PUTARASA
                  melalui formulir di sebelah kiri.
                  Outlet yang didaftarkan akan muncul
                  di sini.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {outlets.map((outlet) => (
                  <article
                    key={outlet.id}
                    className="rounded-3xl border border-[#EAE1CF] bg-[#FFFCF7] p-5 transition hover:border-[#D5C7AC]"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF0B5] text-[#80601B]">
                          <Store size={23} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="break-words text-base font-black sm:text-lg">
                            {outlet.name}
                          </h3>

                          <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-[#796D5B]">
                            <MapPin
                              size={16}
                              className="mt-1 shrink-0"
                            />
                            <span className="break-words">
                              {outlet.address}
                            </span>
                          </p>

                          <p className="mt-3 text-xs text-[#A09585]">
                            Terdaftar{" "}
                            {new Date(
                              outlet.created_at
                            ).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      <span
                        className={
                          outlet.is_active
                            ? "w-fit shrink-0 rounded-full bg-[#E4F0DC] px-3 py-1.5 text-xs font-bold text-[#47763A]"
                            : "w-fit shrink-0 rounded-full bg-[#F5E7DD] px-3 py-1.5 text-xs font-bold text-[#8B5E48]"
                        }
                      >
                        {outlet.is_active
                          ? "● Aktif"
                          : "● Tidak Aktif"}
                      </span>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#EAE1CF] pt-4">
                      <p className="text-xs text-[#8C806D]">
                        Status operasional outlet
                      </p>

                      <form
                        action={async () => {
                          "use server";

                          await toggleOutlet(
                            outlet.id,
                            !outlet.is_active
                          );
                        }}
                      >
                        <button
                          type="submit"
                          className={
                            outlet.is_active
                              ? "rounded-xl border border-[#E8C9B7] bg-white px-4 py-2.5 text-xs font-bold text-[#9B5B3C] transition hover:bg-[#FFF0E7]"
                              : "rounded-xl bg-[#47763A] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#365C2C]"
                          }
                        >
                          {outlet.is_active
                            ? "Nonaktifkan"
                            : "Aktifkan"}
                        </button>
                      </form>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#EAE1CF] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#796D5B]">
            {title}
          </p>

          <p className="mt-3 text-3xl font-black">
            {value}
          </p>
        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${color}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
