
"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createReward,
  type RewardActionState,
} from "./actions";

const initialState: RewardActionState = {
  success: false,
  message: "",
};

export default function RewardForm() {
  const [state, action, pending] = useActionState(
    createReward,
    initialState
  );

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <section className="rounded-[26px] border border-[#EAE1CF] bg-white p-6">
      <h2 className="text-xl font-black">
        Tambah Hadiah
      </h2>

      <p className="mt-2 text-sm leading-6 text-[#817665]">
        Hadiah baru disimpan sebagai draft sampai
        Admin mengaktifkannya.
      </p>

      <form
        ref={formRef}
        action={action}
        className="mt-6 space-y-5"
      >
        <label className="block space-y-2">
          <span className="text-sm font-bold">
            Nama Hadiah
          </span>
          <input
            name="name"
            required
            minLength={3}
            maxLength={120}
            placeholder="Contoh: Beras 1 kg"
            className="w-full rounded-xl border border-[#EAE1CF] bg-[#FFFCF7] p-3 text-sm"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-bold">
            Deskripsi
          </span>
          <textarea
            name="description"
            rows={3}
            placeholder="Keterangan hadiah..."
            className="w-full rounded-xl border border-[#EAE1CF] bg-[#FFFCF7] p-3 text-sm"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-bold">
            Poin Penukaran
          </span>
          <input
            name="points_cost"
            type="number"
            min="1"
            step="1"
            required
            placeholder="Contoh: 2000"
            className="w-full rounded-xl border border-[#EAE1CF] bg-[#FFFCF7] p-3 text-sm"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-bold">
            Biaya Hadiah (Rp)
          </span>
          <input
            name="cost_idr"
            type="number"
            min="0.01"
            step="0.01"
            required
            placeholder="Contoh: 5000"
            className="w-full rounded-xl border border-[#EAE1CF] bg-[#FFFCF7] p-3 text-sm"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-bold">
            Stok Awal
          </span>
          <input
            name="stock"
            type="number"
            min="0"
            step="1"
            required
            placeholder="Contoh: 20"
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
            : "Simpan Hadiah"}
        </button>
      </form>
    </section>
  );
}
