
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  Leaf,
  LogOut,
  Mail,
  MapPin,
  Package,
  Phone,
  Save,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  Wallet,
} from "lucide-react";

import {
  logoutBuyer,
  saveBuyerProfile,
} from "@/app/buyer/profil/actions";

type Props = {
  email: string;
  initialName: string;
  initialPhone: string;
  initialAddress: string;
  joinedAt: string;
  stats: {
    totalOrders: number;
    completedOrders: number;
    activeOrders: number;
    totalSpent: number;
  };
};

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

export default function BuyerProfileWorkspace({
  email,
  initialName,
  initialPhone,
  initialAddress,
  joinedAt,
  stats,
}: Props) {
  const router = useRouter();

  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [address, setAddress] = useState(
    initialAddress
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] =
    useTransition();

  const [feedback, setFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [savedValues, setSavedValues] = useState({
    name: initialName,
    phone: initialPhone,
    address: initialAddress,
  });

  const displayName = name.trim() || "Buyer";

  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  function handleCancel() {
    setName(savedValues.name);
    setPhone(savedValues.phone);
    setAddress(savedValues.address);
    setIsEditing(false);
    setFeedback(null);
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const result = await saveBuyerProfile({
        fullName: name,
        phone,
        defaultAddress: address,
      });

      setFeedback(result);

      if (result.success) {
        setSavedValues({
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
        });

        setIsEditing(false);
        router.refresh();
      }
    });
  }

  function handleLogout() {
    startTransition(async () => {
      await logoutBuyer();
    });
  }

  const statCards = [
    {
      label: "Total Pesanan",
      value: String(stats.totalOrders),
      icon: ShoppingBag,
      bg: "bg-[#FFF0BF]",
    },
    {
      label: "Dalam Proses",
      value: String(stats.activeOrders),
      icon: Clock3,
      bg: "bg-[#EAF3DF]",
    },
    {
      label: "Pesanan Selesai",
      value: String(stats.completedOrders),
      icon: CheckCircle2,
      bg: "bg-[#E8F4E9]",
    },
    {
      label: "Total Belanja Selesai",
      value: rupiah(stats.totalSpent),
      icon: Wallet,
      bg: "bg-[#FFF3DC]",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-7 px-4 pb-16 pt-6 text-[#332417] sm:px-6 lg:px-8">
      {/* HEADER */}
      <section>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF0BF] px-4 py-2 text-xs font-black text-[#47763A]">
          <UserRound size={15} />
          AKUN BUYER PUTARASA
        </span>

        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
          Profil{" "}
          <span className="text-[#47763A]">
            Saya
          </span>
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#8C7A65]">
          Kelola informasi akun, alamat pengiriman,
          dan lihat aktivitas belanjamu.
        </p>
      </section>

      {/* HERO PROFIL */}
      <section className="relative overflow-hidden rounded-[30px] bg-[#FFF0BF] p-6 sm:p-9">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#FFDA57]/50" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 h-40 w-40 rounded-full bg-[#DDEBCB]/60" />

        <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[25px] bg-[#47763A] text-2xl font-black text-white shadow-md sm:h-24 sm:w-24">
              {initials || "B"}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#47763A]">
                Akun Buyer
              </p>

              <h2 className="mt-2 break-words text-2xl font-black sm:text-3xl">
                {displayName}
              </h2>

              <p className="mt-2 break-all text-sm text-[#74695B]">
                {email}
              </p>

              <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-extrabold text-[#47763A]">
                <ShieldCheck size={15} />
                Akun Terdaftar
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsEditing(true);
              document
                .getElementById("form-profil")
                ?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#47763A] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#315F2E]"
          >
            <Edit3 size={18} />
            Edit Profil
          </button>
        </div>
      </section>

      {/* STATISTIK */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="flex items-center justify-between gap-4 rounded-[24px] border border-[#EFE5D4] bg-white p-5 shadow-sm"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#8C7A65]">
                  {stat.label}
                </p>

                <p className="mt-2 break-words text-xl font-black sm:text-2xl">
                  {stat.value}
                </p>
              </div>

              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${stat.bg}`}
              >
                <Icon
                  size={25}
                  className="text-[#47763A]"
                />
              </div>
            </div>
          );
        })}
      </section>

      {/* FEEDBACK */}
      {feedback && (
        <div
          role="status"
          className={`rounded-2xl border p-4 text-sm font-semibold ${
            feedback.success
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* KONTEN */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* FORM PROFIL */}
        <section
          id="form-profil"
          className="scroll-mt-28 rounded-[26px] border border-[#EFE5D4] bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">
                Informasi Pribadi
              </h2>

              <p className="mt-1 text-sm text-[#8C7A65]">
                Perbarui data akun dan alamat default.
              </p>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#EAF3DF] px-4 py-2.5 text-sm font-extrabold text-[#47763A]"
              >
                <Edit3 size={16} />
                Ubah Data
              </button>
            )}
          </div>

          <form
            onSubmit={handleSave}
            className="mt-7 space-y-5"
          >
            {/* NAMA */}
            <label className="block space-y-2">
              <span className="text-sm font-extrabold">
                Nama Lengkap
              </span>

              <div className="relative">
                <UserRound
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C7A65]"
                />

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  disabled={!isEditing || isPending}
                  required
                  minLength={2}
                  maxLength={150}
                  placeholder="Nama lengkap"
                  className="w-full rounded-xl border border-[#E8DFD0] bg-[#FFFBF1] py-3.5 pl-11 pr-4 text-sm outline-none focus:border-[#47763A] disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>
            </label>

            {/* EMAIL */}
            <label className="block space-y-2">
              <span className="text-sm font-extrabold">
                Alamat Email
              </span>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C7A65]"
                />

                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-[#E8DFD0] bg-[#F5F1E8] py-3.5 pl-11 pr-4 text-sm text-[#8C7A65]"
                />
              </div>

              <p className="text-xs text-[#9A8974]">
                Email akun tidak dapat diubah melalui
                halaman ini.
              </p>
            </label>

            {/* TELEPON */}
            <label className="block space-y-2">
              <span className="text-sm font-extrabold">
                Nomor Telepon
              </span>

              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C7A65]"
                />

                <input
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  disabled={!isEditing || isPending}
                  maxLength={30}
                  placeholder="08xxxxxxxxxx"
                  className="w-full rounded-xl border border-[#E8DFD0] bg-[#FFFBF1] py-3.5 pl-11 pr-4 text-sm outline-none focus:border-[#47763A] disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>
            </label>

            {/* ALAMAT */}
            <label className="block space-y-2">
              <span className="flex items-center gap-2 text-sm font-extrabold">
                <MapPin
                  size={17}
                  className="text-[#47763A]"
                />
                Alamat Pengiriman Default
              </span>

              <textarea
                rows={5}
                value={address}
                onChange={(event) =>
                  setAddress(event.target.value)
                }
                disabled={!isEditing || isPending}
                maxLength={1000}
                placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota, provinsi, dan kode pos"
                className="w-full resize-none rounded-xl border border-[#E8DFD0] bg-[#FFFBF1] px-4 py-3.5 text-sm leading-6 outline-none focus:border-[#47763A] disabled:cursor-not-allowed disabled:opacity-70"
              />

              <p className="text-xs text-[#9A8974]">
                Alamat ini dapat digunakan untuk
                mempermudah checkout berikutnya.
              </p>
            </label>

            {/* TOMBOL */}
            {isEditing && (
              <div className="flex flex-wrap gap-3 border-t border-[#F2EADF] pt-6">
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#47763A] px-6 py-3.5 text-sm font-black text-white transition hover:bg-[#315F2E] disabled:opacity-60"
                >
                  <Save size={18} />
                  {isPending
                    ? "Menyimpan..."
                    : "Simpan Perubahan"}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isPending}
                  className="rounded-xl border border-[#E8DFD0] px-6 py-3.5 text-sm font-extrabold text-[#74695B] hover:bg-[#F5F1E8]"
                >
                  Batal
                </button>
              </div>
            )}
          </form>
        </section>

        {/* SIDEBAR */}
        <aside className="space-y-5">
          {/* INFO AKUN */}
          <section className="rounded-[26px] border border-[#EFE5D4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black">
              Informasi Akun
            </h2>

            <div className="mt-6 space-y-5">
              <div className="flex items-start gap-3">
                <CalendarDays
                  size={20}
                  className="shrink-0 text-[#47763A]"
                />

                <div>
                  <p className="text-xs text-[#8C7A65]">
                    Bergabung Sejak
                  </p>
                  <p className="mt-1 text-sm font-black">
                    {formatDate(joinedAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={20}
                  className="shrink-0 text-[#47763A]"
                />

                <div>
                  <p className="text-xs text-[#8C7A65]">
                    Jenis Akun
                  </p>
                  <p className="mt-1 text-sm font-black">
                    Buyer PUTARASA
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* AKSES CEPAT */}
          <section className="rounded-[26px] border border-[#EFE5D4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black">
              Akses Cepat
            </h2>

            <div className="mt-5 space-y-3">
              <Link
                href="/buyer/pesanan"
                className="flex items-center justify-between rounded-xl bg-[#FFFBF1] px-4 py-4 text-sm font-extrabold transition hover:bg-[#EAF3DF]"
              >
                <span className="flex items-center gap-3">
                  <Package
                    size={19}
                    className="text-[#47763A]"
                  />
                  Pesanan Saya
                </span>

                <ArrowRight size={17} />
              </Link>

              <Link
                href="/buyer/keranjang"
                className="flex items-center justify-between rounded-xl bg-[#FFFBF1] px-4 py-4 text-sm font-extrabold transition hover:bg-[#EAF3DF]"
              >
                <span className="flex items-center gap-3">
                  <ShoppingBag
                    size={19}
                    className="text-[#47763A]"
                  />
                  Keranjang Belanja
                </span>

                <ArrowRight size={17} />
              </Link>
            </div>
          </section>

          {/* LOGOUT */}
          <section className="rounded-[26px] border border-[#F3DDDA] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black">
              Keluar dari Akun
            </h2>

            <p className="mt-2 text-xs leading-6 text-[#8C7A65]">
              Kamu dapat login kembali menggunakan
              email dan kata sandi yang sama.
            </p>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-5 py-3.5 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:opacity-60"
            >
              <LogOut size={18} />
              Keluar / Logout
            </button>
          </section>

          {/* BRAND */}
          <div className="rounded-[24px] bg-[#FFF0BF] p-5">
            <div className="flex items-start gap-3">
              <Leaf
                size={24}
                className="shrink-0 text-[#47763A]"
              />

              <div>
                <h3 className="font-black">
                  Terima Kasih!
                </h3>

                <p className="mt-2 text-xs leading-6 text-[#74695B]">
                  Sudah menjadi bagian dari PUTARASA
                  dan mendukung pemanfaatan sampah
                  organik menjadi produk yang bernilai.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <footer className="border-t border-[#EDE5D6] pt-6 text-center text-xs text-[#9A8974]">
        PUTARASA — Dari Dapur, Untuk Bumi
      </footer>
    </main>
  );
}
