
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Edit3,
  Leaf,
  Loader2,
  LockKeyhole,
  Mail,
  MapPinned,
  Phone,
  Save,
  ShieldCheck,
  Truck,
  UserRound,
  X,
  AlertCircle,
} from "lucide-react";

type ProfileData = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
};

function formatDate(value: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "K";

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export default function CourierProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const supabase = createClient();

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw new Error(userError.message);
        }

        if (!user) {
          throw new Error(
            "Sesi login tidak ditemukan. Silakan login kembali."
          );
        }

        const metadata = user.user_metadata ?? {};

        const name =
          typeof metadata.full_name === "string"
            ? metadata.full_name
            : typeof metadata.name === "string"
              ? metadata.name
              : "";

        const phoneNumber =
          typeof metadata.phone === "string"
            ? metadata.phone
            : user.phone ?? "";

        const nextProfile: ProfileData = {
          id: user.id,
          fullName: name || "Kurir PUTARASA",
          email: user.email ?? "-",
          phone: phoneNumber,
          createdAt: user.created_at,
        };

        if (!mounted) return;

        setProfile(nextProfile);
        setFullName(nextProfile.fullName);
        setPhone(nextProfile.phone);
      } catch (err) {
        if (!mounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Gagal memuat informasi profil."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  function cancelEdit() {
    if (!profile) return;

    setFullName(profile.fullName);
    setPhone(profile.phone);
    setEditing(false);
    setError("");
    setSuccess("");
  }

  async function saveProfile() {
    if (!profile || saving) return;

    setError("");
    setSuccess("");

    const cleanedName = fullName.trim();
    const cleanedPhone = phone.trim();

    if (cleanedName.length < 2) {
      setError("Nama lengkap minimal 2 karakter.");
      return;
    }

    if (
      cleanedPhone &&
      !/^\+?[0-9\s()-]{8,20}$/.test(cleanedPhone)
    ) {
      setError("Format nomor telepon tidak valid.");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      const { data, error: updateError } =
        await supabase.auth.updateUser({
          data: {
            full_name: cleanedName,
            phone: cleanedPhone,
          },
        });

      if (updateError) {
        throw new Error(updateError.message);
      }

      setProfile((current) =>
        current
          ? {
              ...current,
              fullName: cleanedName,
              phone: cleanedPhone,
              email: data.user?.email ?? current.email,
            }
          : current
      );

      setEditing(false);
      setSuccess("Profil berhasil diperbarui.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan perubahan profil."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[75vh] items-center justify-center bg-[#FFFBF1] px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#E8F2DE] text-[#47763A]">
            <Loader2 size={30} className="animate-spin" />
          </div>

          <p className="text-sm font-bold text-[#776957]">
            Memuat profil Kurir...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFBF1] text-[#332417]">
      <div className="mx-auto max-w-[1500px] space-y-7 px-4 py-7 sm:px-6 lg:px-8">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm text-[#8C7A65]">
          <Link
            href="/courier/dashboard"
            className="hover:text-[#47763A]"
          >
            Kurir
          </Link>

          <ChevronRight size={15} />

          <span className="font-black text-[#47763A]">
            Profil
          </span>
        </div>

        {/* HEADER */}
        <section className="relative overflow-hidden rounded-[30px] bg-[#FFDA57] p-7 sm:p-9">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/20" />
          <div className="absolute -bottom-28 right-36 h-56 w-56 rounded-full bg-white/15" />

          <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/65 px-4 py-2 text-xs font-black text-[#47763A]">
                <UserRound size={15} />
                PROFIL PENGGUNA
              </span>

              <h1 className="mt-5 text-3xl font-black sm:text-4xl">
                Profil Saya
                <span className="block text-[#47763A]">
                  Kurir PUTARASA
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[#655221] sm:text-base">
                Kelola informasi pribadi dan pastikan
                data akunmu selalu terbaru untuk
                mendukung aktivitas penjemputan serta
                pengantaran.
              </p>
            </div>

            <div className="hidden shrink-0 lg:flex">
              <div className="flex h-40 w-40 items-center justify-center rounded-[40px] bg-[#47763A] text-white shadow-xl">
                <UserRound size={85} strokeWidth={1.3} />
              </div>
            </div>
          </div>
        </section>

        {/* NOTIFICATIONS */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"
          >
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <p className="text-sm font-semibold text-red-700">
              {error}
            </p>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4"
          >
            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0 text-[#47763A]"
            />

            <p className="text-sm font-semibold text-[#47763A]">
              {success}
            </p>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="grid gap-6 xl:grid-cols-3">
          {/* LEFT */}
          <div className="space-y-6">
            {/* PROFILE CARD */}
            <section className="overflow-hidden rounded-[28px] border border-[#EAE3D6] bg-white shadow-sm">
              <div className="h-28 bg-[#47763A]" />

              <div className="-mt-12 px-6 pb-7 text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] border-4 border-white bg-[#FFDA57] text-3xl font-black text-[#332417] shadow-lg">
                  {getInitials(
                    profile?.fullName ?? "Kurir"
                  )}
                </div>

                <h2 className="mt-4 text-xl font-black">
                  {profile?.fullName ??
                    "Kurir PUTARASA"}
                </h2>

                <p className="mt-1 break-all text-sm text-[#8C7A65]">
                  {profile?.email ?? "-"}
                </p>

                <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#E8F2DE] px-4 py-2 text-xs font-black text-[#47763A]">
                  <BadgeCheck size={16} />
                  Kurir PUTARASA
                </span>

                <div className="mt-6 border-t border-[#EFE8DC] pt-5">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#8C7A65]">
                    <CalendarDays size={15} />
                    Bergabung{" "}
                    {formatDate(
                      profile?.createdAt ?? ""
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ACCOUNT SECURITY */}
            <section className="rounded-[28px] border border-[#EAE3D6] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F2DE] text-[#47763A]">
                  <ShieldCheck size={22} />
                </div>

                <div>
                  <h3 className="font-black">
                    Keamanan Akun
                  </h3>

                  <p className="mt-1 text-xs text-[#8C7A65]">
                    Informasi akses akun
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-3 rounded-xl bg-[#FFFBF1] p-4">
                  <LockKeyhole
                    size={19}
                    className="shrink-0 text-[#47763A]"
                  />

                  <div>
                    <p className="text-sm font-black">
                      Akun Terautentikasi
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#8C7A65]">
                      Informasi akun diambil dari
                      Supabase Authentication.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <div className="space-y-6 xl:col-span-2">
            {/* PROFILE INFORMATION */}
            <section className="rounded-[28px] border border-[#EAE3D6] bg-white p-5 shadow-sm sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black">
                    Informasi Pribadi
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#8C7A65]">
                    Data yang digunakan pada akun
                    Kurir PUTARASA.
                  </p>
                </div>

                {!editing ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(true);
                      setSuccess("");
                      setError("");
                    }}
                    disabled={!profile}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#E8F2DE] px-4 py-2.5 text-sm font-black text-[#47763A] transition hover:bg-[#D6E8CE] disabled:opacity-50"
                  >
                    <Edit3 size={17} />
                    Edit Profil
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#EAE3D6] px-4 py-2.5 text-sm font-black text-[#776957] transition hover:bg-[#F7F3EA]"
                  >
                    <X size={17} />
                    Batal
                  </button>
                )}
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                {/* NAME */}
                <div>
                  <label
                    htmlFor="courier-full-name"
                    className="mb-2 block text-xs font-black text-[#776957]"
                  >
                    Nama Lengkap
                  </label>

                  <div className="relative">
                    <UserRound
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A8974]"
                    />

                    <input
                      id="courier-full-name"
                      value={
                        editing
                          ? fullName
                          : profile?.fullName ?? ""
                      }
                      onChange={(event) =>
                        setFullName(event.target.value)
                      }
                      readOnly={!editing}
                      className={`w-full rounded-xl border py-3.5 pl-11 pr-4 text-sm font-semibold outline-none transition ${
                        editing
                          ? "border-[#D6CDBD] bg-white focus:border-[#47763A] focus:ring-2 focus:ring-[#47763A]/10"
                          : "border-[#EFE8DC] bg-[#FFFBF1] text-[#776957]"
                      }`}
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="courier-email"
                    className="mb-2 block text-xs font-black text-[#776957]"
                  >
                    Email
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A8974]"
                    />

                    <input
                      id="courier-email"
                      type="email"
                      value={profile?.email ?? ""}
                      readOnly
                      className="w-full rounded-xl border border-[#EFE8DC] bg-[#FFFBF1] py-3.5 pl-11 pr-4 text-sm font-semibold text-[#776957] outline-none"
                    />
                  </div>

                  <p className="mt-2 text-xs text-[#9A8974]">
                    Email tidak dapat diubah dari
                    halaman ini.
                  </p>
                </div>

                {/* PHONE */}
                <div>
                  <label
                    htmlFor="courier-phone"
                    className="mb-2 block text-xs font-black text-[#776957]"
                  >
                    Nomor Telepon
                  </label>

                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A8974]"
                    />

                    <input
                      id="courier-phone"
                      type="tel"
                      value={
                        editing
                          ? phone
                          : profile?.phone ?? ""
                      }
                      onChange={(event) =>
                        setPhone(event.target.value)
                      }
                      readOnly={!editing}
                      placeholder="Belum diisi"
                      className={`w-full rounded-xl border py-3.5 pl-11 pr-4 text-sm font-semibold outline-none transition ${
                        editing
                          ? "border-[#D6CDBD] bg-white focus:border-[#47763A] focus:ring-2 focus:ring-[#47763A]/10"
                          : "border-[#EFE8DC] bg-[#FFFBF1] text-[#776957]"
                      }`}
                    />
                  </div>
                </div>

                {/* ROLE */}
                <div>
                  <label
                    htmlFor="courier-role"
                    className="mb-2 block text-xs font-black text-[#776957]"
                  >
                    Peran Akun
                  </label>

                  <div className="relative">
                    <Truck
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A8974]"
                    />

                    <input
                      id="courier-role"
                      value="Kurir"
                      readOnly
                      className="w-full rounded-xl border border-[#EFE8DC] bg-[#FFFBF1] py-3.5 pl-11 pr-4 text-sm font-semibold text-[#776957] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SAVE */}
              {editing && (
                <div className="mt-7 flex flex-wrap items-center justify-end gap-3 border-t border-[#EFE8DC] pt-6">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={saving}
                    className="rounded-xl border border-[#EAE3D6] px-5 py-3 text-sm font-black text-[#776957] transition hover:bg-[#F7F3EA] disabled:opacity-50"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    onClick={() => void saveProfile()}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#47763A] px-6 py-3 text-sm font-black text-white transition hover:bg-[#315F2E] disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Save size={17} />
                    )}

                    {saving
                      ? "Menyimpan..."
                      : "Simpan Perubahan"}
                  </button>
                </div>
              )}
            </section>

            {/* ROLE INFORMATION */}
            <section className="rounded-[28px] border border-[#EAE3D6] bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-xl font-black">
                Aktivitas Kurir
              </h2>

              <p className="mt-2 text-sm text-[#8C7A65]">
                Akses operasional sesuai tugas
                yang diberikan.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Link
                  href="/courier/tugas"
                  className="group rounded-2xl border border-[#EFE8DC] bg-[#FFFBF1] p-5 transition hover:border-[#B9CEAD] hover:bg-[#F2F7EB]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F2DE] text-[#47763A]">
                    <ClipboardList size={23} />
                  </div>

                  <h3 className="mt-4 text-base font-black">
                    Tugas Saya
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#8C7A65]">
                    Lihat daftar penjemputan dan
                    pengantaran yang ditugaskan.
                  </p>

                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#47763A]">
                    Buka Tugas
                    <ArrowRight
                      size={16}
                      className="transition group-hover:translate-x-1"
                    />
                  </span>
                </Link>

                <Link
                  href="/courier/operasional"
                  className="group rounded-2xl border border-[#EFE8DC] bg-[#FFFBF1] p-5 transition hover:border-[#B9CEAD] hover:bg-[#F2F7EB]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0B5] text-[#866500]">
                    <MapPinned size={23} />
                  </div>

                  <h3 className="mt-4 text-base font-black">
                    Peta Operasional
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#8C7A65]">
                    Akses lokasi penjemputan dan
                    pengantaran produk Marketplace.
                  </p>

                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#47763A]">
                    Buka Peta
                    <ArrowRight
                      size={16}
                      className="transition group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </div>
            </section>

            {/* FOOTER ACTION */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] bg-[#47763A] p-6 text-white">
              <div className="flex items-center gap-3">
                <Leaf size={28} />

                <div>
                  <h3 className="font-black">
                    PUTARASA Courier
                  </h3>

                  <p className="mt-1 text-xs text-white/75">
                    Bergerak bersama untuk ekonomi
                    sirkular.
                  </p>
                </div>
              </div>

              <Link
                href="/courier/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-[#FFDA57] px-5 py-3 text-sm font-black text-[#332417]"
              >
                <ArrowLeft size={17} />
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        <footer className="border-t border-[#EDE5D6] py-5 text-center text-xs text-[#9A8974]">
          PUTARASA — Profil Kurir
        </footer>
      </div>
    </main>
  );
}
