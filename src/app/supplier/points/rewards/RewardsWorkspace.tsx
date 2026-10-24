
"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useFormStatus } from "react-dom";
import {
  Gift,
  Coins,
  Store,
  LockKeyhole,
  CheckCircle2,
  AlertCircle,
  History,
  RefreshCw,
} from "lucide-react";

import {
  redeemReward,
  type RedeemState,
} from "./actions";

type Reward = {
  id: string;
  name: string;
  description: string | null;
  points_cost: number;
  stock: number;
};

type PartnerStore = {
  id: string;
  name: string;
  address: string | null;
};

type Redemption = {
  id: string;
  redemption_code: string;
  points_spent: number;
  status: string;
  created_at: string;
  reward_name: string;
  store_name: string;
};

type Props = {
  rewards: Reward[];
  stores: PartnerStore[];
  redemptions: Redemption[];
  balance: number;
  enabled: boolean;
};

const initialState: RedeemState = {
  success: false,
  message: "",
};

function SubmitButton({
  disabled,
  retry,
}: {
  disabled: boolean;
  retry: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#47763A] px-5 py-3 font-black text-white transition hover:bg-[#365B2D] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? (
        <>
          <RefreshCw
            size={18}
            className="animate-spin"
          />
          Memproses...
        </>
      ) : retry ? (
        <>
          <RefreshCw size={18} />
          Periksa / Coba Lagi
        </>
      ) : (
        <>
          <Gift size={18} />
          Tukar Hadiah
        </>
      )}
    </button>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function statusLabel(status: string) {
  switch (status) {
    case "pending":
      return "Menunggu";
    case "ready":
      return "Siap Diambil";
    case "redeemed":
      return "Selesai";
    case "cancelled":
      return "Dibatalkan";
    default:
      return status;
  }
}

function statusClass(status: string) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "ready":
      return "bg-sky-100 text-sky-800";
    case "redeemed":
      return "bg-[#EAF3DF] text-[#47763A]";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function RedemptionForm({
  reward,
  stores,
  balance,
  enabled,
}: {
  reward: Reward;
  stores: PartnerStore[];
  balance: number;
  enabled: boolean;
}) {
  const [state, action] = useActionState(
    redeemReward,
    initialState
  );

  const [storeId, setStoreId] = useState(
    stores[0]?.id ?? ""
  );

  const [confirmed, setConfirmed] =
    useState(false);

  const [requestId, setRequestId] =
    useState("");

  const [submitted, setSubmitted] =
    useState(false);

  const [uncertain, setUncertain] =
    useState(false);

  const [locked, setLocked] =
    useState(false);

  const submittingRef = useRef(false);

  useEffect(() => {
    setRequestId(crypto.randomUUID());
  }, []);

  useEffect(() => {
    if (!state.message) return;

    submittingRef.current = false;
    setSubmitted(false);

    if (state.uncertain === true) {
      setUncertain(true);
      setLocked(true);
      return;
    }

    setUncertain(false);

    if (state.success) {
      setLocked(true);
      return;
    }

    // Jika permintaan sudah dibatalkan,
    // jangan gunakan request_id yang sama
    // untuk transaksi baru.
    if (state.status === "cancelled") {
      setLocked(true);
      return;
    }

    // Kesalahan yang sudah dipastikan
    // tidak berhasil diproses boleh
    // dicoba lagi menggunakan request_id sama.
    setLocked(false);
  }, [state]);

  const affordable =
    balance >= reward.points_cost;

  const hasStock = reward.stock > 0;

  const hasStore =
    stores.length > 0 && Boolean(storeId);

  const completed =
    state.success ||
    state.status === "cancelled";

  const canRedeem =
    enabled &&
    affordable &&
    hasStock &&
    hasStore &&
    confirmed &&
    Boolean(requestId) &&
    !completed &&
    !submitted;

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    if (
      !canRedeem ||
      submittingRef.current
    ) {
      event.preventDefault();
      return;
    }

    submittingRef.current = true;
    setSubmitted(true);
    setLocked(true);
  }

  function handleStoreChange(
    nextStoreId: string
  ) {
    if (locked || submitted || uncertain) {
      return;
    }

    setStoreId(nextStoreId);

    // Warung berbeda berarti
    // permintaan baru.
    setRequestId(crypto.randomUUID());
    setConfirmed(false);
  }

  return (
    <div className="rounded-[26px] border border-[#EAE1CF] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF0B5] text-[#8A681A]">
          <Gift size={24} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-black text-[#332417]">
            {reward.name}
          </h3>

          {reward.description && (
            <p className="mt-1 text-sm leading-6 text-[#817665]">
              {reward.description}
            </p>
          )}
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <span className="rounded-xl bg-[#EAF3DF] px-3 py-2 text-sm font-black text-[#47763A]">
          {reward.points_cost.toLocaleString(
            "id-ID"
          )}{" "}
          poin
        </span>

        <span className="rounded-xl bg-[#FFFBF1] px-3 py-2 text-sm font-bold text-[#817665]">
          Stok {reward.stock}
        </span>
      </div>

      <form
        action={action}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <input
          type="hidden"
          name="reward_id"
          value={reward.id}
        />

        <input
          type="hidden"
          name="request_id"
          value={requestId}
        />

        <div>
          <label
            htmlFor={`store-${reward.id}`}
            className="mb-2 block text-sm font-bold text-[#332417]"
          >
            Pilih warung pengambilan
          </label>

          <select
            id={`store-${reward.id}`}
            name="store_id"
            value={storeId}
            onChange={(event) =>
              handleStoreChange(
                event.target.value
              )
            }
            disabled={
              locked ||
              submitted ||
              uncertain ||
              completed
            }
            className="w-full rounded-2xl border border-[#EAE1CF] bg-[#FFFBF1] px-4 py-3 text-sm text-[#332417] outline-none focus:border-[#47763A] disabled:opacity-60"
          >
            {stores.length === 0 && (
              <option value="">
                Belum ada warung aktif
              </option>
            )}

            {stores.map((store) => (
              <option
                key={store.id}
                value={store.id}
              >
                {store.name}
              </option>
            ))}
          </select>

          {storeId && (
            <p className="mt-2 text-xs leading-5 text-[#817665]">
              {stores.find(
                (item) => item.id === storeId
              )?.address ??
                "Alamat warung belum tersedia."}
            </p>
          )}
        </div>

        <label className="flex items-start gap-3 rounded-2xl bg-[#FFFBF1] p-4">
          <input
            type="checkbox"
            name="confirmed"
            value="yes"
            checked={confirmed}
            onChange={(event) =>
              setConfirmed(
                event.target.checked
              )
            }
            disabled={
              submitted || completed
            }
            className="mt-1 accent-[#47763A]"
          />

          <span className="text-sm leading-6 text-[#332417]">
            Saya memahami bahwa penukaran
            ini akan menggunakan{" "}
            <strong>
              {reward.points_cost.toLocaleString(
                "id-ID"
              )}{" "}
              poin
            </strong>
            .
          </span>
        </label>

        {!enabled && (
          <div className="flex items-start gap-2 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
            <LockKeyhole
              size={19}
              className="mt-0.5 shrink-0"
            />
            <span>
              Program penukaran hadiah
              belum diaktifkan.
            </span>
          </div>
        )}

        {!affordable && (
          <div className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
            Saldo poin belum mencukupi.
          </div>
        )}

        {!hasStock && (
          <div className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
            Stok hadiah sedang habis.
          </div>
        )}

        {uncertain && (
          <div className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            Status transaksi belum dapat
            dipastikan. Jangan mengganti
            pilihan warung atau membuat
            permintaan baru. Gunakan tombol
            di bawah untuk memeriksa kembali.
          </div>
        )}

        {state.message && (
          <div
            role="status"
            className={`rounded-2xl p-4 text-sm ${
              state.success
                ? "bg-[#EAF3DF] text-[#365B2D]"
                : state.uncertain
                ? "bg-amber-50 text-amber-800"
                : "bg-red-50 text-red-700"
            }`}
          >
            <div className="flex items-start gap-2 font-bold">
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

            {state.code &&
              state.status !==
                "cancelled" && (
                <div className="mt-3 rounded-xl bg-white/70 p-3">
                  <p className="text-xs font-semibold">
                    Kode penukaran
                  </p>

                  <p className="mt-1 break-all font-mono text-lg font-black">
                    {state.code}
                  </p>

                  {state.status && (
                    <p className="mt-2 text-xs font-bold">
                      Status:{" "}
                      {statusLabel(
                        state.status
                      )}
                    </p>
                  )}
                </div>
              )}
          </div>
        )}

        <SubmitButton
          disabled={!canRedeem}
          retry={uncertain}
        />
      </form>
    </div>
  );
}

export default function RewardsWorkspace({
  rewards,
  stores,
  redemptions,
  balance,
  enabled,
}: Props) {
  return (
    <div className="space-y-8">
      <section className="flex items-center gap-4 rounded-[26px] bg-[#47763A] p-6 text-white">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
          <Coins size={28} />
        </div>

        <div>
          <p className="text-sm text-white/80">
            Saldo PUTARASA Poin
          </p>

          <h2 className="text-3xl font-black">
            {balance.toLocaleString(
              "id-ID"
            )}
            <span className="ml-2 text-base font-semibold">
              poin
            </span>
          </h2>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center gap-3">
          <Gift className="text-[#47763A]" />

          <h2 className="text-2xl font-black text-[#332417]">
            Katalog Hadiah
          </h2>
        </div>

        {rewards.length === 0 ? (
          <div className="rounded-2xl border border-[#EAE1CF] bg-white p-8 text-center text-[#817665]">
            Belum ada hadiah yang tersedia.
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {rewards.map((reward) => (
              <RedemptionForm
                key={reward.id}
                reward={reward}
                stores={stores}
                balance={balance}
                enabled={enabled}
              />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[26px] border border-[#EAE1CF] bg-white p-5 sm:p-7">
        <div className="mb-5 flex items-center gap-3">
          <History className="text-[#47763A]" />

          <h2 className="text-xl font-black text-[#332417]">
            Riwayat Penukaran
          </h2>
        </div>

        {redemptions.length === 0 ? (
          <p className="text-sm text-[#817665]">
            Belum ada riwayat penukaran.
          </p>
        ) : (
          <div className="space-y-3">
            {redemptions.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-[#FFFBF1] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-[#332417]">
                      {item.reward_name}
                    </p>

                    <p className="mt-1 flex items-center gap-1 text-xs text-[#817665]">
                      <Store size={13} />
                      {item.store_name}
                    </p>

                    <p className="mt-1 text-xs text-[#817665]">
                      {formatDate(
                        item.created_at
                      )}
                    </p>
                  </div>

                  <span
                    className={`rounded-xl px-3 py-2 text-xs font-bold ${statusClass(
                      item.status
                    )}`}
                  >
                    {statusLabel(
                      item.status
                    )}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
                  <span className="font-semibold text-[#817665]">
                    {item.points_spent.toLocaleString(
                      "id-ID"
                    )}{" "}
                    poin
                  </span>

                  <span className="break-all font-mono font-bold text-[#332417]">
                    {item.redemption_code}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
