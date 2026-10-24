
"use client";

import { useActionState, useState } from "react";
import {
  registerSupplierProfile,
  type SupplierProfileState,
} from "./actions";

const initialState: SupplierProfileState = {
  success: false,
  message: "",
};

export default function SupplierProfileForm() {
  const [type, setType] = useState<
    "individual" | "institution"
  >("individual");

  const [state, action, pending] = useActionState(
    registerSupplierProfile,
    initialState
  );

  return (
    <section className="mx-auto max-w-2xl rounded-[28px] border border-[#EAE1CF] bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 inline-flex rounded-full bg-[#E7F0DC] px-4 py-2 text-xs font-bold text-[#47763A]">
        PROFIL SUPPLIER
      </div>

      <h2 className="text-2xl font-black text-[#332417]">
        Lengkapi Jenis Akun
      </h2>

      <p className="mt-3 text-sm leading-7 text-[#817665]">
        Pilih jenis Supplier sesuai aktivitas Anda.
        Supplier individu dapat menyetorkan sampah
        organik ke outlet dan memperoleh poin setelah
        setoran diverifikasi.
      </p>

      <form action={action} className="mt-7 space-y-5">
        <fieldset className="space-y-3">
          <legend className="mb-3 text-sm font-bold">
            Jenis Supplier
          </legend>

          <label className="flex cursor-pointer gap-3 rounded-2xl border border-[#EAE1CF] bg-[#FFFCF7] p-4">
            <input
              type="radio"
              name="supplier_type"
              value="individual"
              checked={type === "individual"}
              onChange={() => setType("individual")}
              className="accent-[#47763A]"
            />
            <span>
              <span className="block font-bold">
                Individu / Rumah Tangga
              </span>
              <span className="mt-1 block text-sm text-[#817665]">
                Menyetorkan sampah organik langsung
                ke outlet PUTARASA.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 rounded-2xl border border-[#EAE1CF] bg-[#FFFCF7] p-4">
            <input
              type="radio"
              name="supplier_type"
              value="institution"
              checked={type === "institution"}
              onChange={() => setType("institution")}
              className="accent-[#47763A]"
            />
            <span>
              <span className="block font-bold">
                Institusi / Usaha
              </span>
              <span className="mt-1 block text-sm text-[#817665]">
                Mengelola setoran atau penjemputan
                sampah dari usaha dan institusi.
              </span>
            </span>
          </label>
        </fieldset>

        {type === "institution" && (
          <label className="block space-y-2">
            <span className="text-sm font-bold">
              Nama Institusi
            </span>
            <input
              name="institution_name"
              required
              minLength={3}
              maxLength={150}
              placeholder="Contoh: Kantin Sekolah"
              className="w-full rounded-xl border border-[#EAE1CF] bg-[#FFFCF7] p-3"
            />
          </label>
        )}

        {state.message && (
          <p
            role="status"
            className={`rounded-xl p-4 text-sm ${
              state.success
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-700"
            }`}
          >
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || state.success}
          className="w-full rounded-xl bg-[#47763A] px-5 py-4 font-bold text-white disabled:opacity-50"
        >
          {pending
            ? "Menyimpan..."
            : "Simpan Profil Supplier"}
        </button>
      </form>
    </section>
  );
}
