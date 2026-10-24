
"use client";

import {
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  Clock3,
  CreditCard,
  History,
  Plus,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  createPayment,
  reviewPayment,
} from "@/app/admin/pembayaran/actions";

type Order = {
  id: string;
  order_code: string;
  customer_name: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
};

type Payment = {
  id: string;
  order_id: string;
  amount: number;
  payment_method: string;
  reference_number: string | null;
  sender_name: string | null;
  payment_date: string | null;
  status: "pending" | "verified" | "rejected";
  notes: string | null;
  rejection_reason: string | null;
  verified_at: string | null;
  created_at: string;
};

type PaymentEvent = {
  id: string;
  payment_id: string;
  event_type: string;
  notes: string | null;
  created_at: string;
};

type Props = {
  orders: Order[];
  payments: Payment[];
  events: PaymentEvent[];
};

const statusLabels = {
  pending: "Menunggu Verifikasi",
  verified: "Terverifikasi",
  rejected: "Ditolak",
};

const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  verified: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

function money(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function date(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PaymentWorkspace({
  orders,
  payments,
  events,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(
    null
  );
  const [orderId, setOrderId] = useState("");
  const [senderName, setSenderName] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [notes, setNotes] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeSuccess, setNoticeSuccess] = useState(true);

  const orderMap = useMemo(
    () => new Map(orders.map((order) => [order.id, order])),
    [orders]
  );

  const selectedPayment = payments.find(
    (payment) => payment.id === selectedId
  );

  const selectedOrder = orderMap.get(orderId);

  const availableOrders = orders.filter((order) => {
    if (
      order.payment_status !== "unpaid" ||
      order.status === "cancelled" ||
      order.total_amount <= 0
    ) {
      return false;
    }

    return !payments.some(
      (payment) =>
        payment.order_id === order.id &&
        (payment.status === "pending" ||
          payment.status === "verified")
    );
  });

  const filtered = payments.filter((payment) => {
    const order = orderMap.get(payment.order_id);
    const keyword = search.trim().toLowerCase();

    const matchesSearch =
      (order?.order_code ?? "")
        .toLowerCase()
        .includes(keyword) ||
      (order?.customer_name ?? "")
        .toLowerCase()
        .includes(keyword) ||
      (payment.reference_number ?? "")
        .toLowerCase()
        .includes(keyword);

    return (
      matchesSearch &&
      (filter === "all" || payment.status === filter)
    );
  });

  const verified = payments.filter(
    (payment) => payment.status === "verified"
  );

  const stats = [
    {
      label: "Total Pembayaran",
      value: String(payments.length),
      detail: "Seluruh catatan transfer",
      icon: CreditCard,
    },
    {
      label: "Menunggu Verifikasi",
      value: String(
        payments.filter(
          (payment) => payment.status === "pending"
        ).length
      ),
      detail: "Perlu ditinjau Admin",
      icon: Clock3,
    },
    {
      label: "Terverifikasi",
      value: String(verified.length),
      detail: "Pembayaran disetujui",
      icon: ShieldCheck,
    },
    {
      label: "Nominal Terverifikasi",
      value: money(
        verified.reduce(
          (total, payment) => total + payment.amount,
          0
        )
      ),
      detail: "Total pembayaran yang disetujui",
      icon: Banknote,
    },
  ];

  function openCreate() {
    setOrderId("");
    setSenderName("");
    setReferenceNumber("");
    setPaymentDate(
      new Date().toLocaleDateString("en-CA")
    );
    setNotes("");
    setNotice("");
    setCreateOpen(true);
  }

  function handleCreate() {
    if (!orderId || !paymentDate) {
      setNoticeSuccess(false);
      setNotice("Pilih pesanan dan tanggal transfer.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createPayment({
          orderId,
          referenceNumber,
          senderName,
          paymentDate,
          notes,
        });

        setNoticeSuccess(result.success);
        setNotice(result.message);

        if (result.success) {
          setCreateOpen(false);
          router.refresh();
        }
      } catch (error) {
        setNoticeSuccess(false);
        setNotice(
          error instanceof Error
            ? error.message
            : "Gagal mencatat pembayaran."
        );
      }
    });
  }

  function handleReview(
    decision: "verified" | "rejected"
  ) {
    if (!selectedPayment || pending) return;

    if (
      decision === "rejected" &&
      !reviewNotes.trim()
    ) {
      setNoticeSuccess(false);
      setNotice("Isi alasan penolakan terlebih dahulu.");
      return;
    }

    if (
      decision === "verified" &&
      !window.confirm(
        "Pastikan dana benar-benar diterima di rekening. Verifikasi pembayaran ini?"
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await reviewPayment({
          paymentId: selectedPayment.id,
          decision,
          notes: reviewNotes,
        });

        setNoticeSuccess(result.success);
        setNotice(result.message);

        if (result.success) {
          setSelectedId(null);
          setReviewNotes("");
          router.refresh();
        }
      } catch (error) {
        setNoticeSuccess(false);
        setNotice(
          error instanceof Error
            ? error.message
            : "Gagal meninjau pembayaran."
        );
      }
    });
  }

  return (
    <div className="space-y-7">
      {notice && (
        <div
          role="status"
          className={`flex items-start justify-between gap-3 rounded-2xl border p-4 text-sm font-semibold ${
            noticeSuccess
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <span className="flex items-center gap-2">
            {noticeSuccess ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            {notice}
          </span>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Tutup notifikasi"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* STATISTIK */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-3xl border border-[#EFE5D4] bg-white p-5 shadow-sm"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#8C7A65]">
                  {stat.label}
                </p>
                <div className="rounded-xl bg-[#FFF0BF] p-3">
                  <Icon
                    size={21}
                    className="text-[#47763A]"
                  />
                </div>
              </div>
              <p className="break-words text-2xl font-extrabold xl:text-3xl">
                {stat.value}
              </p>
              <p className="mt-2 text-xs text-[#9A8974]">
                {stat.detail}
              </p>
            </div>
          );
        })}
      </div>

      {/* PANEL UTAMA */}
      <section className="flex flex-col justify-between gap-5 rounded-3xl bg-[#47763A] p-6 text-white md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
            <ShieldCheck size={18} />
            Verifikasi Transaksi
          </div>
          <h2 className="text-2xl font-extrabold">
            Pembayaran Pelanggan PUTARASA
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
            Catat transfer masuk dan pastikan setiap
            pembayaran diperiksa sebelum dinyatakan lunas.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#FFDA57] px-5 py-3 font-extrabold text-[#332417] hover:bg-[#FFE586]"
        >
          <Plus size={19} />
          Catat Pembayaran
        </button>
      </section>

      {/* TABEL PEMBAYARAN */}
      <section className="rounded-3xl border border-[#EFE5D4] bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-xl font-extrabold">
              Daftar Pembayaran
            </h2>
            <p className="mt-1 text-sm text-[#8C7A65]">
              {filtered.length} pembayaran ditampilkan
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-3 text-[#9A8974]"
              />
              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Cari pesanan atau referensi..."
                className="w-full rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] py-2.5 pl-10 pr-3 text-sm outline-none"
              />
            </div>
            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value)
              }
              className="rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] px-3 py-2.5 text-sm"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="verified">Terverifikasi</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <CreditCard
              size={44}
              className="mx-auto mb-4 text-[#9DBB90]"
            />
            <h3 className="font-extrabold">
              Belum ada pembayaran
            </h3>
            <p className="mt-2 text-sm text-[#8C7A65]">
              Pembayaran transfer akan muncul di sini
              setelah dicatat.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#EFE5D4] text-[#8C7A65]">
                  <th className="px-3 py-4">Pesanan</th>
                  <th className="px-3 py-4">Pelanggan</th>
                  <th className="px-3 py-4">Nominal</th>
                  <th className="px-3 py-4">Tanggal</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-3 py-4 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((payment) => {
                  const order = orderMap.get(
                    payment.order_id
                  );

                  return (
                    <tr
                      key={payment.id}
                      className="border-b border-[#F4EDE2] last:border-0"
                    >
                      <td className="px-3 py-4">
                        <p className="font-extrabold">
                          {order?.order_code ?? "-"}
                        </p>
                        <p className="mt-1 text-xs text-[#8C7A65]">
                          {payment.reference_number ||
                            "Tanpa referensi"}
                        </p>
                      </td>
                      <td className="px-3 py-4">
                        {order?.customer_name ?? "-"}
                      </td>
                      <td className="px-3 py-4 font-bold">
                        {money(payment.amount)}
                      </td>
                      <td className="px-3 py-4 text-[#8C7A65]">
                        {date(payment.payment_date)}
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                            statusStyles[payment.status]
                          }`}
                        >
                          {statusLabels[payment.status]}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(payment.id);
                            setReviewNotes("");
                            setNotice("");
                          }}
                          className="rounded-xl bg-[#F0F7E9] px-4 py-2 font-bold text-[#47763A]"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* RIWAYAT KEPUTUSAN */}
      <section className="rounded-3xl border border-[#EFE5D4] bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-[#FFF0BF] p-3">
            <History
              size={20}
              className="text-[#47763A]"
            />
          </div>
          <div>
            <h2 className="text-xl font-extrabold">
              Riwayat Verifikasi
            </h2>
            <p className="text-sm text-[#8C7A65]">
              Maksimal 200 aktivitas terbaru
            </p>
          </div>
        </div>

        {events.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#8C7A65]">
            Belum ada aktivitas pembayaran.
          </p>
        ) : (
          <div className="divide-y divide-[#F1E9DD]">
            {events.map((event) => {
              const payment = payments.find(
                (item) => item.id === event.payment_id
              );
              const order = payment
                ? orderMap.get(payment.order_id)
                : null;

              return (
                <div
                  key={event.id}
                  className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-bold">
                      {event.event_type === "created"
                        ? "Pembayaran dicatat"
                        : event.event_type === "verified"
                          ? "Pembayaran diverifikasi"
                          : "Pembayaran ditolak"}
                    </p>
                    <p className="mt-1 text-xs text-[#8C7A65]">
                      {order?.order_code ?? "Pesanan"} —{" "}
                      {event.notes || "Tanpa catatan"}
                    </p>
                  </div>
                  <span className="text-xs text-[#8C7A65]">
                    {date(event.created_at)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* MODAL CATAT PEMBAYARAN */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-extrabold">
                  Catat Pembayaran
                </h2>
                <p className="mt-1 text-sm text-[#8C7A65]">
                  Masukkan informasi transfer pelanggan.
                </p>
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() => setCreateOpen(false)}
                aria-label="Tutup"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold">
                  Pesanan
                </label>
                <select
                  value={orderId}
                  disabled={pending}
                  onChange={(event) =>
                    setOrderId(event.target.value)
                  }
                  className="w-full rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] p-3"
                >
                  <option value="">Pilih pesanan</option>
                  {availableOrders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.order_code} —{" "}
                      {order.customer_name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedOrder && (
                <div className="rounded-xl bg-[#F0F7E9] p-4">
                  <p className="text-xs font-semibold text-[#47763A]">
                    Nominal yang harus dibayar
                  </p>
                  <p className="mt-1 text-2xl font-extrabold">
                    {money(selectedOrder.total_amount)}
                  </p>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Nama Pengirim
                </label>
                <input
                  value={senderName}
                  disabled={pending}
                  onChange={(event) =>
                    setSenderName(event.target.value)
                  }
                  placeholder="Nama pemilik rekening"
                  className="w-full rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] p-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Nomor Referensi Transfer
                </label>
                <input
                  value={referenceNumber}
                  disabled={pending}
                  onChange={(event) =>
                    setReferenceNumber(event.target.value)
                  }
                  placeholder="Nomor referensi dari bank"
                  className="w-full rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] p-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Tanggal Transfer
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  disabled={pending}
                  onChange={(event) =>
                    setPaymentDate(event.target.value)
                  }
                  className="w-full rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] p-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Catatan
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  disabled={pending}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                  placeholder="Informasi tambahan transfer..."
                  className="w-full resize-none rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] p-3"
                />
              </div>

              <button
                type="button"
                disabled={pending || !orderId || !paymentDate}
                onClick={handleCreate}
                className="w-full rounded-xl bg-[#FFDA57] px-5 py-3.5 font-extrabold disabled:opacity-50"
              >
                {pending
                  ? "Menyimpan..."
                  : "Simpan Pembayaran"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL & VERIFIKASI */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#47763A]">
                  Detail Pembayaran
                </p>
                <h2 className="mt-1 text-xl font-extrabold">
                  {orderMap.get(selectedPayment.order_id)
                    ?.order_code ?? "Pesanan"}
                </h2>
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() => setSelectedId(null)}
                aria-label="Tutup"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-3 rounded-2xl bg-[#FFFBF1] p-5 text-sm">
              {[
                ["Nominal", money(selectedPayment.amount)],
                ["Pengirim", selectedPayment.sender_name || "-"],
                [
                  "Referensi",
                  selectedPayment.reference_number || "-",
                ],
                [
                  "Tanggal Transfer",
                  date(selectedPayment.payment_date),
                ],
                [
                  "Status",
                  statusLabels[selectedPayment.status],
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4"
                >
                  <span className="text-[#8C7A65]">
                    {label}
                  </span>
                  <span className="text-right font-bold">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {selectedPayment.notes && (
              <p className="mt-4 text-sm text-[#8C7A65]">
                Catatan: {selectedPayment.notes}
              </p>
            )}

            {selectedPayment.rejection_reason && (
              <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                Alasan penolakan:{" "}
                {selectedPayment.rejection_reason}
              </p>
            )}

            {selectedPayment.status === "pending" ? (
              <div className="mt-6 space-y-4 border-t border-[#EFE5D4] pt-5">
                <div className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  Periksa dana masuk pada rekening bank
                  sebelum memverifikasi pembayaran.
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Catatan Verifikasi / Alasan Penolakan
                  </label>
                  <textarea
                    rows={3}
                    value={reviewNotes}
                    disabled={pending}
                    onChange={(event) =>
                      setReviewNotes(event.target.value)
                    }
                    placeholder="Wajib diisi jika pembayaran ditolak..."
                    className="w-full resize-none rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] p-3"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      handleReview("verified")
                    }
                    className="flex-1 rounded-xl bg-[#47763A] px-4 py-3 font-bold text-white disabled:opacity-50"
                  >
                    Verifikasi
                  </button>
                  <button
                    type="button"
                    disabled={pending || !reviewNotes.trim()}
                    onClick={() =>
                      handleReview("rejected")
                    }
                    className="flex-1 rounded-xl border border-red-200 px-4 py-3 font-bold text-red-700 disabled:opacity-50"
                  >
                    Tolak
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-xl bg-[#F0F7E9] p-4 text-sm font-semibold text-[#47763A]">
                Pembayaran ini sudah ditinjau dan
                tidak dapat diubah kembali.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
