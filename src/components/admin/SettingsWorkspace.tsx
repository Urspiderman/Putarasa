
"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Fingerprint,
  Info,
  KeyRound,
  Leaf,
  LockKeyhole,
  Mail,
  Save,
  Settings2,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  changeAdminPassword,
  updateAdminProfile,
} from "@/app/admin/pengaturan/actions";

type Props = {
  email: string;
  fullName: string;
  phone: string;
  createdAt: string;
  lastSignInAt: string | null;
  emailConfirmed: boolean;
};

function formatDate(value: string | null) {
  if (!value) return "Belum tersedia";

  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PanelTitle({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: typeof UserRound;
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="rounded-xl bg-[#F0F7E9] p-3">
        <Icon
          size={21}
          className="text-[#47763A]"
        />
      </div>

      <div>
        <h2 className="text-xl font-extrabold">
          {title}
        </h2>
        <p className="mt-1 text-sm text-[#8C7A65]">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function SettingsWorkspace({
  email,
  fullName: initialName,
  phone: initialPhone,
  createdAt,
  lastSignInAt,
  emailConfirmed,
}: Props) {
  const [profilePending, startProfileTransition] =
    useTransition();

  const [passwordPending, startPasswordTransition] =
    useTransition();

  const [fullName, setFullName] =
    useState(initialName);

  const [phone, setPhone] =
    useState(initialPhone);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [profileMessage, setProfileMessage] =
    useState("");

  const [profileSuccess, setProfileSuccess] =
    useState(false);

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [passwordSuccess, setPasswordSuccess] =
    useState(false);

  const initials = (fullName.trim() || email)
    .split(/[\s@]+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  function saveProfile() {
    setProfileMessage("");

    startProfileTransition(async () => {
      const result = await updateAdminProfile({
        fullName,
        phone,
      });

      setProfileSuccess(result.success);
      setProfileMessage(result.message);
    });
  }

  function savePassword() {
    setPasswordMessage("");

    if (newPassword !== confirmPassword) {
      setPasswordSuccess(false);
      setPasswordMessage(
        "Konfirmasi password tidak sesuai."
      );
      return;
    }

    startPasswordTransition(async () => {
      const result = await changeAdminPassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setPasswordSuccess(result.success);
      setPasswordMessage(result.message);

      if (result.success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    });
  }

  const passwordFields = [
    {
      id: "current-password",
      label: "Password Saat Ini",
      value: currentPassword,
      setter: setCurrentPassword,
      visible: showCurrent,
      toggle: () => setShowCurrent(!showCurrent),
      placeholder: "Masukkan password saat ini",
    },
    {
      id: "new-password",
      label: "Password Baru",
      value: newPassword,
      setter: setNewPassword,
      visible: showNew,
      toggle: () => setShowNew(!showNew),
      placeholder: "Minimal 8 karakter",
    },
    {
      id: "confirm-password",
      label: "Konfirmasi Password Baru",
      value: confirmPassword,
      setter: setConfirmPassword,
      visible: showConfirm,
      toggle: () => setShowConfirm(!showConfirm),
      placeholder: "Ulangi password baru",
    },
  ];

  return (
    <div className="space-y-7">
      {/* HERO */}
      <section className="flex flex-col justify-between gap-5 rounded-3xl bg-[#47763A] p-6 text-white md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
            <ShieldCheck size={18} />
            Administrasi Akun
          </div>

          <h2 className="text-2xl font-extrabold">
            Pusat Pengaturan PUTARASA
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
            Perbarui informasi akun dan jaga keamanan
            akses Admin untuk mendukung operasional
            pengelolaan sampah organik.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-white/15 px-5 py-4">
          <ShieldCheck size={27} />
          <div>
            <p className="text-xs text-white/75">
              Hak Akses
            </p>
            <p className="font-extrabold">
              Administrator
            </p>
          </div>
        </div>
      </section>

      {/* KARTU RINGKASAN */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Status Akun",
            value: "Aktif",
            icon: UserRound,
          },
          {
            label: "Verifikasi Email",
            value: emailConfirmed
              ? "Terverifikasi"
              : "Belum Verifikasi",
            icon: Mail,
          },
          {
            label: "Hak Akses",
            value: "Admin",
            icon: Fingerprint,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-3xl border border-[#EFE5D4] bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-[#8C7A65]">
                  {item.label}
                </p>

                <div className="rounded-xl bg-[#FFF0BF] p-3">
                  <Icon
                    size={20}
                    className="text-[#47763A]"
                  />
                </div>
              </div>

              <p className="text-xl font-extrabold">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* FORM PROFIL DAN INFO AKUN */}
      <div className="grid items-start gap-6 xl:grid-cols-5">
        <section className="rounded-3xl border border-[#EFE5D4] bg-white p-6 shadow-sm xl:col-span-3">
          <PanelTitle
            title="Profil Administrator"
            description="Perbarui informasi identitas akun"
            icon={UserRound}
          />

          <div className="mb-6 flex items-center gap-4 rounded-2xl bg-[#FFFBF1] p-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#FFDA57] text-xl font-black text-[#332417]">
              {initials || "AD"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold">
                {fullName || "Administrator PUTARASA"}
              </p>
              <p className="truncate text-sm text-[#8C7A65]">
                {email}
              </p>
              <span className="mt-2 inline-block rounded-full bg-[#F0F7E9] px-3 py-1 text-xs font-bold text-[#47763A]">
                Administrator
              </span>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="admin-name"
                className="mb-2 block text-sm font-bold"
              >
                Nama Lengkap
              </label>

              <input
                id="admin-name"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                maxLength={100}
                placeholder="Nama administrator"
                className="w-full rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] px-4 py-3 outline-none focus:border-[#47763A]"
              />
            </div>

            <div>
              <label
                htmlFor="admin-phone"
                className="mb-2 block text-sm font-bold"
              >
                Nomor Telepon
              </label>

              <input
                id="admin-phone"
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                placeholder="08xxxxxxxxxx"
                className="w-full rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] px-4 py-3 outline-none focus:border-[#47763A]"
              />
            </div>

            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-sm font-bold"
              >
                Email
              </label>

              <input
                id="admin-email"
                type="email"
                value={email}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-[#E8DDCC] bg-[#F4F1EB] px-4 py-3 text-[#8C7A65]"
              />

              <p className="mt-2 text-xs text-[#9A8974]">
                Email tidak dapat diubah melalui halaman ini.
              </p>
            </div>

            {profileMessage && (
              <div
                role="status"
                className={`flex items-start gap-2 rounded-xl p-4 text-sm font-semibold ${
                  profileSuccess
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {profileSuccess ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                {profileMessage}
              </div>
            )}

            <button
              type="button"
              onClick={saveProfile}
              disabled={profilePending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#47763A] px-6 py-3 font-extrabold text-white transition hover:bg-[#3C6632] disabled:opacity-50"
            >
              <Save size={18} />
              {profilePending
                ? "Menyimpan..."
                : "Simpan Perubahan"}
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-[#EFE5D4] bg-white p-6 shadow-sm xl:col-span-2">
          <PanelTitle
            title="Informasi Akun"
            description="Detail akun yang sedang digunakan"
            icon={Info}
          />

          <div className="space-y-5">
            {[
              ["Email Akun", email],
              ["Role", "Administrator"],
              ["Terdaftar Sejak", formatDate(createdAt)],
              ["Login Terakhir", formatDate(lastSignInAt)],
              [
                "Status Email",
                emailConfirmed
                  ? "Terverifikasi"
                  : "Belum terverifikasi",
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="border-b border-[#F2EADF] pb-4 last:border-0"
              >
                <p className="text-xs font-semibold text-[#8C7A65]">
                  {label}
                </p>
                <p className="mt-1 break-words text-sm font-extrabold">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* KEAMANAN */}
      <section className="rounded-3xl border border-[#EFE5D4] bg-white p-6 shadow-sm">
        <PanelTitle
          title="Keamanan Akun"
          description="Perbarui password untuk menjaga keamanan akses Admin"
          icon={LockKeyhole}
        />

        <div className="grid items-start gap-8 lg:grid-cols-2">
          <div className="space-y-5">
            {passwordFields.map((field) => (
              <div key={field.id}>
                <label
                  htmlFor={field.id}
                  className="mb-2 block text-sm font-bold"
                >
                  {field.label}
                </label>

                <div className="relative">
                  <input
                    id={field.id}
                    type={
                      field.visible ? "text" : "password"
                    }
                    value={field.value}
                    onChange={(event) =>
                      field.setter(event.target.value)
                    }
                    placeholder={field.placeholder}
                    autoComplete={
                      field.id === "current-password"
                        ? "current-password"
                        : "new-password"
                    }
                    className="w-full rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] px-4 py-3 pr-12 outline-none focus:border-[#47763A]"
                  />

                  <button
                    type="button"
                    onClick={field.toggle}
                    aria-label={
                      field.visible
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7A65]"
                  >
                    {field.visible ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>
            ))}

            {passwordMessage && (
              <div
                role="status"
                className={`flex items-start gap-2 rounded-xl p-4 text-sm font-semibold ${
                  passwordSuccess
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {passwordSuccess ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                {passwordMessage}
              </div>
            )}

            <button
              type="button"
              onClick={savePassword}
              disabled={
                passwordPending ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#47763A] px-6 py-3 font-extrabold text-white transition hover:bg-[#3C6632] disabled:opacity-50"
            >
              <KeyRound size={18} />
              {passwordPending
                ? "Memperbarui..."
                : "Ubah Password"}
            </button>
          </div>

          <div className="rounded-2xl bg-[#FFFBF1] p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-[#FFF0BF] p-3">
                <ShieldCheck
                  size={22}
                  className="text-[#47763A]"
                />
              </div>

              <h3 className="font-extrabold">
                Tips Keamanan Akun
              </h3>
            </div>

            <ul className="space-y-4 text-sm leading-6 text-[#74695B]">
              <li>
                Gunakan password yang panjang dan
                berbeda dari akun lain.
              </li>
              <li>
                Hindari menggunakan nama, tanggal lahir,
                atau informasi pribadi.
              </li>
              <li>
                Jangan membagikan password kepada
                pengguna lain.
              </li>
              <li>
                Keluar dari akun ketika menggunakan
                perangkat bersama.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* INFORMASI APLIKASI */}
      <section className="rounded-3xl border border-[#EFE5D4] bg-white p-6 shadow-sm">
        <PanelTitle
          title="Tentang PUTARASA"
          description="Informasi platform pengelolaan sampah organik"
          icon={Settings2}
        />

        <div className="flex flex-col gap-5 rounded-2xl bg-[#FFFBF1] p-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#FFDA57]">
            <Leaf
              size={32}
              className="text-[#47763A]"
            />
          </div>

          <div>
            <h3 className="text-xl font-black">
              PUTARASA
            </h3>
            <p className="mt-1 text-sm font-semibold text-[#47763A]">
              Dari Dapur, Untuk Bumi
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8C7A65]">
              Platform digital untuk mendukung
              pengumpulan sampah organik, pengolahan
              menjadi produk bernilai, pengelolaan
              inventori, transaksi, serta pencatatan
              estimasi dampak lingkungan.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
