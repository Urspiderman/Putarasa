
"use client";

import { useActionState, useState } from "react";
import {
  completeRedemption,
  cancelRedemption,
  type RedemptionActionState,
} from "./actions";

const initialState: RedemptionActionState = {
  success: false,
  message: "",
};

export default function RedemptionActions({
  redemptionId,
}: {
  redemptionId: string;
}) {
  const [completeState, completeAction, completing] =
    useActionState(completeRedemption, initialState);

  const [cancelState, cancelAction, cancelling] =
    useActionState(cancelRedemption, initialState);

  const [showCancel, setShowCancel] = useState(false);

  return (
    <div className="mt-5 space-y-4 border-t border-[#EAE1CF] pt-5">
      <form action={completeAction} className="space-y-3">
        <input
          type="hidden"
          name="redemption_id"
          value={redemptionId}
        />

        <label className="block space-y-2">
          <span className="text-sm font-bold">
            Kode dari Supplier
          </span>

          <input
            name="redemption_code"
            required
            placeholder="Masukkan kode yang ditunjukkan Supplier"
            className="w-full rounded-xl border border-[#EAE1CF] bg-white p-3 text-sm uppercase"
          />
        </label>

        {completeState.message && (
          <p
            role="status"
            className={`rounded-xl p-3 text-sm ${
              completeState.success
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-700"
            }`}
          >
            {completeState.message}
          </p>
        )}

        <button
          type="submit"
          disabled={completing || completeState.success}
          className="w-full rounded-xl bg-[#47763A] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {completing
            ? "Memproses..."
            : "Konfirmasi Hadiah Sudah Diambil"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setShowCancel(!showCancel)}
        className="text-sm font-bold text-red-700"
      >
        {showCancel
          ? "Tutup Pembatalan"
          : "Batalkan Penukaran"}
      </button>

      {showCancel && (
        <form action={cancelAction} className="space-y-3">
          <input
            type="hidden"
            name="redemption_id"
            value={redemptionId}
          />

          <p className="rounded-xl bg-red-50 p-3 text-xs leading-6 text-red-700">
            Pembatalan akan mengembalikan poin
            Supplier, mengembalikan stok hadiah,
            dan melepaskan alokasi anggaran.
          </p>

          {cancelState.message && (
            <p
              role="status"
              className={`rounded-xl p-3 text-sm ${
                cancelState.success
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {cancelState.message}
            </p>
          )}

          <button
            type="submit"
            disabled={cancelling || cancelState.success}
            className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {cancelling
              ? "Membatalkan..."
              : "Ya, Batalkan Penukaran"}
          </button>
        </form>
      )}
    </div>
  );
}
