
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Edit3,
  Leaf,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import {
  updateSupplierProfile,
  type SupplierProfileInput,
} from "@/app/supplier/profil/actions";

type Props = {
  initialName: string;
  initialPhone: string;
  initialAddress: string;
  initialSupplierType: string;
  initialInstitutionName: string;
  email: string;
  createdAt: string;
};

const inputClass =
  "w-full rounded-2xl border border-[#E8DFD0] bg-[#FFFBF1] px-4 py-3.5 text-sm font-semibold text-[#332417] outline-none transition focus:border-[#47763A] focus:ring-2 focus:ring-[#47763A]/10 disabled:opacity-70";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function SupplierProfileWorkspace({
  initialName,
  initialPhone,
  initialAddress,
  initialSupplierType,
  initialInstitutionName,
  email,
  createdAt,
}: Props) {
  const router = useRouter();

  const initialValues: SupplierProfileInput = {
    fullName: initialName,
    phone: initialPhone,
    supplierType: initialSupplierType,
    institutionName: initialInstitutionName,
    defaultAddress: initialAddress,
  };

  const [form, setForm] =
    useState<SupplierProfileInput>(initialValues);

  const [saved, setSaved] =
    useState<SupplierProfileInput>(initialValues);

  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(true);

  const displayName =
    saved.fullName.trim() || "Supplier PUTARASA";

  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  function updateField(
    key: keyof SupplierProfileInput,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function cancelEdit() {
    setForm(saved);
    setEditing(false);
    setMessage("");
  }

  function handleSave() {
    if (!form.fullName.trim()) {
      setSuccess(false);
      setMessage("Nama lengkap wajib diisi.");
      return;
    }

    startTransition(async () => {
      const result = await updateSupplierProfile(form);

      setSuccess(result.success);
      setMessage(result.message);

      if (result.success) {
        const cleaned = {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          supplierType: form.supplierType.trim(),
          institutionName:
            form.institutionName.trim(),
          defaultAddress:
            form.defaultAddress.trim(),
        };

        setSaved(cleaned);
        setForm(cleaned);
        setEditing(false);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          role="status"
          className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-sm font-bold ${
            success
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {success && <CheckCircle2 size={18} />}
            <span>{message}</span>
          </div>

          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Tutup pesan"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        {/* KARTU IDENTITAS */}
        <section className="overflow-hidden rounded-[28px] border border-[#EFE5D4] bg-white shadow-sm">
          <div className="h-28 bg-[#47763A]" />

          <div className="-mt-12 px-6 pb-7 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] border-[5px] border-white bg-[#FFDA57] text-3xl font-black text-[#332417] shadow-sm">
              {initials || <UserRound size={36} />}
            </div>

            <h2 className="mt-4 text-2xl font-black">
              {displayName}
            </h2>

            <p className="mt-2 break-all text-sm text-[#8C7A65]">
              {email}
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#EAF3DF] px-4 py-2 text-xs font-black text-[#47763A]">
              <Leaf size={16} />
              Supplier PUTARASA
            </div>

            <div className="mt-7 space-y-5 border-t border-[#F0E7D9] pt-6 text-left">
              <div className="flex items-start gap-3">
                <Building2
                  size={20}
                  className="mt-0.5 text-[#47763A]"
                />
                <div>
                  <p className="text-xs text-[#8C7A65]">
                    Usaha / Institusi
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {saved.institutionName ||
                      "Belum diisi"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone
                  size={20}
                  className="mt-0.5 text-[#47763A]"
                />
                <div>
                  <p className="text-xs text-[#8C7A65]">
                    Nomor Telepon
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {saved.phone || "Belum diisi"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin
                  size={20}
                  className="mt-0.5 text-[#47763A]"
                />
                <div>
                  <p className="text-xs text-[#8C7A65]">
                    Alamat Default
                  </p>
                  <p className="mt-1 break-words text-sm font-bold">
                    {saved.defaultAddress ||
                      "Belum diisi"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDays
                  size={20}
                  className="mt-0.5 text-[#47763A]"
                />
                <div>
                  <p className="text-xs text-[#8C7A65]">
                    Bergabung Sejak
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {formatDate(createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FORM */}
        <section className="rounded-[28px] border border-[#EFE5D4] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black">
                Informasi Profil
              </h2>
              <p className="mt-2 text-sm text-[#8C7A65]">
                Kelola identitas pribadi dan informasi usaha.
              </p>
            </div>

            {!editing && (
              <button
                type="button"
                onClick={() => {
                  setMessage("");
                  setEditing(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-[#EAF3DF] px-4 py-2.5 text-sm font-black text-[#47763A]"
              >
                <Edit3 size={16} />
                Edit Profil
              </button>
            )}
          </div>

          <div className="mt-7 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-black">
                Nama Lengkap
              </label>
              <input
                value={form.fullName}
                onChange={(event) =>
                  updateField(
                    "fullName",
                    event.target.value
                  )
                }
                disabled={!editing || pending}
                maxLength={100}
                className={inputClass}
                placeholder="Nama lengkap"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C7A65]"
                />
                <input
                  type="email"
                  value={email}
                  disabled
                  className={`${inputClass} pl-12`}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black">
                Nomor Telepon
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(event) =>
                  updateField(
                    "phone",
                    event.target.value
                  )
                }
                disabled={!editing || pending}
                maxLength={20}
                placeholder="081234567890"
                className={inputClass}
              />
            </div>

            <div className="border-t border-[#F0E7D9] pt-5">
              <h3 className="flex items-center gap-2 font-black">
                <Building2
                  size={19}
                  className="text-[#47763A]"
                />
                Informasi Usaha
              </h3>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black">
                Jenis Supplier
              </label>

              <input
                value={form.supplierType}
                onChange={(event) =>
                  updateField(
                    "supplierType",
                    event.target.value
                  )
                }
                disabled={!editing || pending}
                maxLength={100}
                placeholder="Contoh: Restoran, rumah tangga, hotel"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black">
                Nama Usaha / Institusi
              </label>
              <input
                value={form.institutionName}
                onChange={(event) =>
                  updateField(
                    "institutionName",
                    event.target.value
                  )
                }
                disabled={!editing || pending}
                maxLength={150}
                placeholder="Nama restoran atau institusi"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black">
                Alamat Penjemputan Default
              </label>
              <textarea
                rows={4}
                value={form.defaultAddress}
                onChange={(event) =>
                  updateField(
                    "defaultAddress",
                    event.target.value
                  )
                }
                disabled={!editing || pending}
                maxLength={500}
                placeholder="Masukkan alamat lengkap lokasi penjemputan"
                className={`${inputClass} resize-none`}
              />
              <p className="mt-2 text-xs leading-5 text-[#9A8974]">
                Alamat ini disimpan sebagai preferensi
                akun. Alamat pada penjemputan yang
                sudah dibuat tidak berubah.
              </p>
            </div>

            {editing && (
              <div className="flex flex-wrap gap-3 border-t border-[#F0E7D9] pt-6">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={pending}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#47763A] px-6 py-3.5 text-sm font-black text-white hover:bg-[#315F2E] disabled:opacity-50"
                >
                  <Save size={18} />
                  {pending
                    ? "Menyimpan..."
                    : "Simpan Perubahan"}
                </button>

                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={pending}
                  className="rounded-2xl border border-[#E8DFD0] px-6 py-3.5 text-sm font-black"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* KEAMANAN */}
      <section className="rounded-[28px] border border-[#EFE5D4] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-[#EAF3DF] p-3">
            <ShieldCheck
              size={23}
              className="text-[#47763A]"
            />
          </div>

          <div>
            <h2 className="text-xl font-black">
              Keamanan Akun
            </h2>
            <p className="mt-1 text-sm text-[#8C7A65]">
              Informasi keamanan akun Supplier.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#FFFBF1] p-5">
          <LockKeyhole
            size={22}
            className="shrink-0 text-[#47763A]"
          />

          <div>
            <p className="font-black">
              Kata Sandi dan Autentikasi
            </p>
            <p className="mt-1 text-xs leading-6 text-[#8C7A65]">
              Akun dikelola menggunakan Supabase Auth.
              Jangan membagikan kata sandi atau kode
              verifikasi kepada siapa pun.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
