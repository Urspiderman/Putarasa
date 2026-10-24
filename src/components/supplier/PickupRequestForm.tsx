
"use client";

import {
  useActionState,
  useEffect,
  useRef,
} from "react";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Leaf,
  MapPin,
  Package,
  FileText,
  Scale,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import {
  createPickupRequest,
  type PickupActionState,
} from "@/app/supplier/penjemputan/actions";

const initialState: PickupActionState = {
  success: false,
  message: "",
};

export default function PickupRequestForm() {
  const [state, formAction, pending] = useActionState(
    createPickupRequest,
    initialState
  );

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  const today = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date());

  const inputClass =
    "mt-2 w-full rounded-2xl border border-[#E8DFD0] bg-[#FFFBF1] px-4 py-3.5 text-sm font-medium text-[#332417] outline-none transition focus:border-[#47763A] focus:ring-2 focus:ring-[#47763A]/15";

  const labelClass =
    "block text-sm font-extrabold text-[#332417]";

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF3DF]">
          <Leaf
            size={23}
            className="text-[#47763A]"
          />
        </div>

        <div>
          <h2 className="text-xl font-black">
            Ajukan Penjemputan
          </h2>
          <p className="mt-1 text-xs text-[#8C7A65]">
            Isi informasi sampah yang ingin dijemput.
          </p>
        </div>
      </div>

      {state.message && (
        <div
          role="status"
          className={`flex items-start gap-3 rounded-2xl p-4 text-sm font-semibold ${
            state.success
              ? "bg-[#EAF3DF] text-[#47763A]"
              : "bg-red-50 text-red-700"
          }`}
        >
          {state.success ? (
            <CheckCircle2
              size={20}
              className="shrink-0"
            />
          ) : (
            <AlertCircle
              size={20}
              className="shrink-0"
            />
          )}
          <span>{state.message}</span>
        </div>
      )}

      <div>
        <label
          htmlFor="waste_type"
          className={labelClass}
        >
          <span className="inline-flex items-center gap-2">
            <Package size={17} />
            Jenis Sampah Organik
          </span>
        </label>

        <select
          id="waste_type"
          name="waste_type"
          required
          defaultValue=""
          className={inputClass}
        >
          <option value="" disabled>
            Pilih jenis sampah
          </option>
          <option value="Sisa makanan">
            Sisa makanan
          </option>
          <option value="Sayur dan buah">
            Sayur dan buah
          </option>
          <option value="Daun dan tanaman">
            Daun dan tanaman
          </option>
          <option value="Sampah organik campuran">
            Sampah organik campuran
          </option>
          <option value="Ampas kopi dan teh">
            Ampas kopi dan teh
          </option>
        </select>
      </div>

      <div>
        <label
          htmlFor="estimated_weight_kg"
          className={labelClass}
        >
          <span className="inline-flex items-center gap-2">
            <Scale size={17} />
            Estimasi Berat Sampah
          </span>
        </label>

        <div className="relative">
          <input
            id="estimated_weight_kg"
            name="estimated_weight_kg"
            type="number"
            min="0.01"
            max="100000"
            step="0.01"
            required
            placeholder="Contoh: 5"
            className={`${inputClass} pr-14`}
          />
          <span className="absolute right-4 top-1/2 mt-1 -translate-y-1/2 text-sm font-black text-[#47763A]">
            kg
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="pickup_date"
            className={labelClass}
          >
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={17} />
              Tanggal Penjemputan
            </span>
          </label>

          <input
            id="pickup_date"
            name="pickup_date"
            type="date"
            min={today}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="pickup_time"
            className={labelClass}
          >
            <span className="inline-flex items-center gap-2">
              <Clock3 size={17} />
              Waktu Penjemputan
            </span>
          </label>

          <input
            id="pickup_time"
            name="pickup_time"
            type="time"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="address"
          className={labelClass}
        >
          <span className="inline-flex items-center gap-2">
            <MapPin size={17} />
            Alamat Penjemputan
          </span>
        </label>

        <textarea
          id="address"
          name="address"
          rows={4}
          required
          minLength={10}
          maxLength={1000}
          placeholder="Masukkan alamat lengkap, nama jalan, nomor rumah, RT/RW, kelurahan, dan patokan lokasi."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label
          htmlFor="notes"
          className={labelClass}
        >
          <span className="inline-flex items-center gap-2">
            <FileText size={17} />
            Catatan Tambahan
          </span>
          <span className="ml-2 text-xs font-medium text-[#9A8974]">
            (Opsional)
          </span>
        </label>

        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={2000}
          placeholder="Contoh: Sampah sudah dipisahkan dan dikemas dalam kantong."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="rounded-2xl bg-[#FFF4C8] p-4">
        <p className="text-sm font-extrabold text-[#80621C]">
          Informasi Penjemputan
        </p>
        <p className="mt-2 text-xs leading-6 text-[#80621C]">
          Permintaan yang dikirim akan berstatus
          Menunggu. Berat akhir sampah akan dicatat
          setelah proses penjemputan dan penimbangan.
          Jadwal yang diajukan belum merupakan
          konfirmasi dari kurir.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#47763A] px-6 py-4 text-sm font-black text-white transition hover:bg-[#315F2E] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? "Mengirim Permintaan..."
          : "Ajukan Penjemputan"}
        {!pending && <ArrowRight size={19} />}
      </button>
    </form>
  );
}
