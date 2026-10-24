
"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createPartner,
  type PartnerActionState,
} from "./actions";

const initialState: PartnerActionState = {
  success: false,
  message: "",
};

export default function PartnerForm() {
  const [state, action, pending] = useActionState(
    createPartner,
    initialState
  );

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <section className="rounded-[26px] border border-[#EAE1CF] bg-white p-6">
      <h2 className="text-xl font-black">
        Tambah Warung Mitra
      </h2>

      <p className="mt-2 text-sm text-[#817665]">
        Daftarkan lokasi penukaran hadiah.
      </p>

      <form
        ref={formRef}
        action={action}
        className="mt-6 space-y-5"
      >
        <label className="block space-y-2">
          <span className="text-sm font-bold">
            Nama Warung
          </span>
          <input
            name="name"
            required
            minLength={3}
            maxLength={120}
            placeholder="Contoh: Warung Sejahtera"
            className="w-full rounded-xl border border-[#EAE1CF] bg-[#FFFCF7] p-3 text-sm"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-bold">
            Alamat Warung
          </span>
          <textarea
            name="address"
            required
            minLength={5}
            maxLength={500}
            rows={3}
            placeholder="Alamat lengkap warung..."
            className="w-full rounded-xl border border-[#EAE1CF] bg-[#FFFCF7] p-3 text-sm"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-bold">
            Nomor Kontak
          </span>
          <input
            name="contact_phone"
            type="tel"
            maxLength={30}
            placeholder="08xxxxxxxxxx"
            className="w-full rounded-xl border border-[#EAE1CF] bg-[#FFFCF7] p-3 text-sm"
          />
        </label>

        {state.message && (
          <p
            role="status"
            className={`rounded-xl p-3 text-sm ${
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
          disabled={pending}
          className="w-full rounded-xl bg-[#47763A] px-5 py-4 font-bold text-white disabled:opacity-50"
        >
          {pending
            ? "Menyimpan..."
            : "Simpan Warung Mitra"}
        </button>
      </form>
    </section>
  );
}
