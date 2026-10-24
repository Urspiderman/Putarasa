
"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  Landmark,
  Plus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import {
  addRewardFunding,
  type FundingActionState,
} from "./actions";

const initialState: FundingActionState = {
  success: false,
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#47763A] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#365B2D] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Plus size={18} />
      {pending ? "Menyimpan..." : "Catat Pendanaan"}
    </button>
  );
}

export default function FundingForm() {
  const [state, formAction] = useActionState(
    addRewardFunding,
    initialState
  );

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <section className="rounded-[26px] border border-[#EAE1CF] bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF3DF] text-[#47763A]">
          <Landmark size={24} />
        </div>

        <div>
          <h2 className="text-xl font-black text-[#332417]">
            Catat Dana Sponsor
          </h2>

          <p className="mt-1 text-xs text-[#8C7A65]">
            Masukkan pendanaan yang sudah diterima.
          </p>
        </div>
      </div>

      <form
        ref={formRef}
        action={formAction}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="source_name"
            className="mb-2 block text-sm font-bold text-[#332417]"
          >
            Nama Sponsor / Sumber Dana
          </label>

          <input
            id="source_name"
            name="source_name"
            type="text"
            required
            minLength={3}
            maxLength={150}
            placeholder="Contoh: PT Mitra Lingkungan"
            className="w-full rounded-2xl border border-[#EAE1CF] bg-[#FFFBF1] px-4 py-3 text-sm outline-none focus:border-[#47763A]"
          />
        </div>

        <div>
          <label
            htmlFor="amount_idr"
            className="mb-2 block text-sm font-bold text-[#332417]"
          >
            Nominal Pendanaan (Rp)
          </label>

          <input
            id="amount_idr"
            name="amount_idr"
            type="number"
            required
            min={1}
            step={1}
            placeholder="Contoh: 1000000"
            className="w-full rounded-2xl border border-[#EAE1CF] bg-[#FFFBF1] px-4 py-3 text-sm outline-none focus:border-[#47763A]"
          />

          <p className="mt-2 text-xs text-[#8C7A65]">
            Masukkan angka tanpa titik atau koma.
          </p>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="mb-2 block text-sm font-bold text-[#332417]"
          >
            Keterangan
          </label>

          <textarea
            id="notes"
            name="notes"
            rows={4}
            maxLength={1000}
            placeholder="Contoh: Dana program hadiah sembako periode Oktober"
            className="w-full resize-none rounded-2xl border border-[#EAE1CF] bg-[#FFFBF1] px-4 py-3 text-sm outline-none focus:border-[#47763A]"
          />
        </div>

        {state.message && (
          <div
            role="status"
            className={`flex items-start gap-2 rounded-2xl p-4 text-sm ${
              state.success
                ? "bg-[#EAF3DF] text-[#365B2D]"
                : "bg-red-50 text-red-700"
            }`}
          >
            {state.success ? (
              <CheckCircle2
                size={19}
                className="shrink-0"
              />
            ) : (
              <AlertCircle
                size={19}
                className="shrink-0"
              />
            )}

            <span>{state.message}</span>
          </div>
        )}

        <SubmitButton />
      </form>
    </section>
  );
}
