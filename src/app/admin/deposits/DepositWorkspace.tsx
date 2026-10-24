
"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  createDeposit,
  verifyDeposit,
  rejectDeposit,
  type DepositActionState,
} from "./actions";

type Supplier = {
  user_id: string;
  name: string;
};

type Outlet = {
  id: string;
  name: string;
};

type Deposit = {
  id: string;
  supplier_id: string;
  supplier_name: string;
  outlet_name: string;
  waste_type: string;
  gross_weight_kg: number;
  accepted_weight_kg: number | null;
  points_awarded: number;
  status: string;
  notes: string | null;
  created_at: string;
};

const initialState: DepositActionState = {
  success: false,
  message: "",
};

const formatWeight = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 3,
  }).format(value);

const formatDate = (value: string) =>
  new Date(value).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function Feedback({ state }: { state: DepositActionState }) {
  if (!state.message) return null;

  return (
    <p
      role="status"
      className={`rounded-xl px-4 py-3 text-sm ${
        state.success
          ? "bg-green-50 text-green-800"
          : "bg-red-50 text-red-700"
      }`}
    >
      {state.message}
    </p>
  );
}

function SubmitButton({
  children,
  variant = "green",
}: {
  children: React.ReactNode;
  variant?: "green" | "red";
}) {
  return (
    <button
      type="submit"
      className={`rounded-xl px-4 py-3 text-sm font-bold text-white transition disabled:opacity-50 ${
        variant === "red"
          ? "bg-red-600 hover:bg-red-700"
          : "bg-[#47763A] hover:bg-[#365C2C]"
      }`}
    >
      {children}
    </button>
  );
}

function DepositForm({
  suppliers,
  outlets,
}: {
  suppliers: Supplier[];
  outlets: Outlet[];
}) {
  const [state, action, pending] = useActionState(
    createDeposit,
    initialState
  );

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <section className="rounded-[26px] border border-[#EAE1CF] bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black">
        Catat Setoran Baru
      </h2>
      <p className="mt-2 text-sm text-[#817665]">
        Masukkan data sampah yang diterima di outlet.
      </p>

      <form
        ref={formRef}
        action={action}
        className="mt-6 space-y-4"
      >
        <label className="block space-y-2">
          <span className="text-sm font-bold">
            Supplier Individu
          </span>
          <select
            name="supplier_id"
            required
            defaultValue=""
            className="w-full rounded-xl border border-[#EAE1CF] bg-[#FFFCF7] p-3 text-sm"
          >
            <option value="" disabled>
              Pilih Supplier
            </option>
            {suppliers.map((supplier) => (
              <option
                key={supplier.user_id}
                value={supplier.user_id}
              >
                {supplier.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-bold">
            Outlet Penerimaan
          </span>
          <select
            name="outlet_id"
            required
            defaultValue=""
            className="w-full rounded-xl border border-[#EAE1CF] bg-[#FFFCF7] p-3 text-sm"
          >
            <option value="" disabled>
              Pilih Outlet
            </option>
            {outlets.map((outlet) => (
              <option key={outlet.id} value={outlet.id}>
                {outlet.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-bold">
            Jenis Sampah Organik
          </span>
          <select
            name="waste_type"
            required
            defaultValue=""
            className="w-full rounded-xl border border-[#EAE1CF] bg-[#FFFCF7] p-3 text-sm"
          >
            <option value="" disabled>
              Pilih jenis sampah
            </option>
            <option value="Sisa makanan">
              Sisa makanan
            </option>
            <option value="Sayuran dan buah">
              Sayuran dan buah
            </option>
            <option value="Daun dan tanaman">
              Daun dan tanaman
            </option>
            <option value="Campuran organik">
              Campuran organik
            </option>
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-bold">
            Berat Awal (kg)
          </span>
          <input
            name="gross_weight_kg"
            type="number"
            min="0.001"
            max="100000"
            step="0.001"
            required
            placeholder="Contoh: 2.500"
            className="w-full rounded-xl border border-[#EAE1CF] bg-[#FFFCF7] p-3 text-sm"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-bold">
            Catatan (opsional)
          </span>
          <textarea
            name="notes"
            rows={3}
            maxLength={500}
            placeholder="Kondisi sampah atau keterangan lain..."
            className="w-full rounded-xl border border-[#EAE1CF] bg-[#FFFCF7] p-3 text-sm"
          />
        </label>

        <Feedback state={state} />

        <button
          type="submit"
          disabled={
            pending ||
            suppliers.length === 0 ||
            outlets.length === 0
          }
          className="w-full rounded-xl bg-[#47763A] px-5 py-4 font-bold text-white transition hover:bg-[#365C2C] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending
            ? "Menyimpan..."
            : "Simpan Setoran"}
        </button>

        {suppliers.length === 0 && (
          <p className="text-sm text-amber-700">
            Belum ada Supplier individu. Daftarkan
            akun Supplier dan profil individunya dahulu.
          </p>
        )}

        {outlets.length === 0 && (
          <p className="text-sm text-amber-700">
            Belum ada outlet aktif. Tambahkan melalui
            halaman Admin Outlet.
          </p>
        )}
      </form>
    </section>
  );
}

function DepositItem({
  deposit,
}: {
  deposit: Deposit;
}) {
  const [verifyState, verifyAction, verifying] =
    useActionState(verifyDeposit, initialState);

  const [rejectState, rejectAction, rejecting] =
    useActionState(rejectDeposit, initialState);

  const [showReject, setShowReject] = useState(false);

  const pending = deposit.status === "pending";

  return (
    <article className="rounded-2xl border border-[#EAE1CF] bg-[#FFFCF7] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-black">
            {deposit.supplier_name}
          </h3>
          <p className="mt-1 text-xs text-[#817665]">
            {formatDate(deposit.created_at)}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1.5 text-xs font-bold ${
            deposit.status === "verified"
              ? "bg-green-100 text-green-800"
              : deposit.status === "rejected"
                ? "bg-red-100 text-red-700"
                : "bg-amber-100 text-amber-800"
          }`}
        >
          {deposit.status === "verified"
            ? "Terverifikasi"
            : deposit.status === "rejected"
              ? "Ditolak"
              : "Menunggu"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <p className="text-[#817665]">Outlet</p>
          <p className="font-semibold">
            {deposit.outlet_name}
          </p>
        </div>
        <div>
          <p className="text-[#817665]">Jenis sampah</p>
          <p className="font-semibold">
            {deposit.waste_type}
          </p>
        </div>
        <div>
          <p className="text-[#817665]">Berat awal</p>
          <p className="font-semibold">
            {formatWeight(deposit.gross_weight_kg)} kg
          </p>
        </div>
        <div>
          <p className="text-[#817665]">
            Berat diterima
          </p>
          <p className="font-semibold">
            {deposit.accepted_weight_kg === null
              ? "Belum diverifikasi"
              : `${formatWeight(
                  deposit.accepted_weight_kg
                )} kg`}
          </p>
        </div>
      </div>

      {deposit.status === "verified" && (
        <div className="mt-4 rounded-xl bg-green-50 p-4 text-sm font-bold text-green-800">
          +{deposit.points_awarded.toLocaleString("id-ID")} poin diberikan
        </div>
      )}

      {deposit.notes && (
        <p className="mt-4 text-sm text-[#817665]">
          Catatan: {deposit.notes}
        </p>
      )}

      {pending && (
        <div className="mt-5 space-y-4 border-t border-[#EAE1CF] pt-5">
          <form
            action={verifyAction}
            className="space-y-3"
          >
            <input
              type="hidden"
              name="deposit_id"
              value={deposit.id}
            />

            <label className="block space-y-2">
              <span className="text-sm font-bold">
                Berat yang Diterima (kg)
              </span>
              <input
                type="number"
                name="accepted_weight_kg"
                min="0.001"
                max={deposit.gross_weight_kg}
                step="0.001"
                defaultValue={deposit.gross_weight_kg}
                required
                className="w-full rounded-xl border border-[#EAE1CF] bg-white p-3 text-sm"
              />
            </label>

            <Feedback state={verifyState} />

            <button
              type="submit"
              disabled={verifying}
              className="w-full rounded-xl bg-[#47763A] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {verifying
                ? "Memverifikasi..."
                : "Verifikasi & Berikan Poin"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setShowReject(!showReject)}
            className="text-sm font-bold text-red-700"
          >
            {showReject
              ? "Tutup Penolakan"
              : "Tolak Setoran"}
          </button>

          {showReject && (
            <form
              action={rejectAction}
              className="space-y-3"
            >
              <input
                type="hidden"
                name="deposit_id"
                value={deposit.id}
              />

              <textarea
                name="reason"
                required
                minLength={5}
                maxLength={500}
                rows={3}
                placeholder="Jelaskan alasan penolakan..."
                className="w-full rounded-xl border border-red-200 bg-white p-3 text-sm"
              />

              <Feedback state={rejectState} />

              <button
                type="submit"
                disabled={rejecting}
                className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {rejecting
                  ? "Memproses..."
                  : "Konfirmasi Penolakan"}
              </button>
            </form>
          )}
        </div>
      )}
    </article>
  );
}

export default function DepositWorkspace({
  suppliers,
  outlets,
  deposits,
}: {
  suppliers: Supplier[];
  outlets: Outlet[];
  deposits: Deposit[];
}) {
  const [filter, setFilter] = useState("all");

  const filtered = deposits.filter(
    (deposit) =>
      filter === "all" || deposit.status === filter
  );

  const pendingCount = deposits.filter(
    (deposit) => deposit.status === "pending"
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Total Setoran",
            value: deposits.length,
          },
          {
            title: "Menunggu Verifikasi",
            value: pendingCount,
          },
          {
            title: "Terverifikasi",
            value: deposits.filter(
              (item) => item.status === "verified"
            ).length,
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-[#EAE1CF] bg-white p-5"
          >
            <p className="text-sm text-[#817665]">
              {item.title}
            </p>
            <p className="mt-2 text-3xl font-black">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[390px_minmax(0,1fr)]">
        <DepositForm
          suppliers={suppliers}
          outlets={outlets}
        />

        <section className="rounded-[26px] border border-[#EAE1CF] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">
                Riwayat Setoran
              </h2>
              <p className="mt-1 text-sm text-[#817665]">
                Catatan penerimaan sampah masyarakat
              </p>
            </div>

            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value)
              }
              className="rounded-xl border border-[#EAE1CF] bg-white px-3 py-2 text-sm"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="verified">
                Terverifikasi
              </option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-6 rounded-2xl border-2 border-dashed border-[#EAE1CF] p-12 text-center">
              <p className="text-lg font-bold">
                Belum ada setoran
              </p>
              <p className="mt-2 text-sm text-[#817665]">
                Data setoran akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {filtered.map((deposit) => (
                <DepositItem
                  key={deposit.id}
                  deposit={deposit}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
