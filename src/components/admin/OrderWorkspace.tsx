
"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  MapPin,
  PackageCheck,
  Search,
  ShoppingCart,
  Truck,
  UserRound,
  X,
} from "lucide-react";

import {
  assignOrderCourier,
  changeOrderStatus,
} from "@/app/admin/pesanan/actions";

type Status =
  | "pending"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

type Order = {
  id: string;
  order_code: string;
  buyer_id: string;
  customer_name: string;
  customer_phone: string | null;
  shipping_address: string | null;
  status: Status;
  payment_status: string;
  total_amount: number;
  notes: string | null;
  created_at: string;
  courier_id: string | null;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  assigned_at: string | null;
  delivered_at: string | null;
};

type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

type Courier = {
  id: string;
  name: string;
};

type Props = {
  orders: Order[];
  items: OrderItem[];
  couriers: Courier[];
};

const statusLabels: Record<Status, string> = {
  pending: "Menunggu",
  processing: "Diproses",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const statusStyles: Record<Status, string> = {
  pending: "bg-amber-100 text-amber-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-violet-100 text-violet-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-700",
};

function money(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function date(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

export default function OrderWorkspace({
  orders,
  items,
  couriers,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    null
  );

  const [courierId, setCourierId] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [notice, setNotice] = useState("");
  const [noticeSuccess, setNoticeSuccess] = useState(true);

  const selected =
    orders.find((order) => order.id === selectedId) ?? null;

  const selectedItems = items.filter(
    (item) => item.order_id === selectedId
  );

  const courierMap = useMemo(
    () => new Map(couriers.map((courier) => [
      courier.id,
      courier.name,
    ])),
    [couriers]
  );

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return orders.filter((order) => {
      const matches =
        order.order_code.toLowerCase().includes(keyword) ||
        order.customer_name.toLowerCase().includes(keyword);

      return matches &&
        (filter === "all" || order.status === filter);
    });
  }, [orders, search, filter]);

  const stats = [
    {
      label: "Total Pesanan",
      value: orders.length,
      icon: ShoppingCart,
    },
    {
      label: "Menunggu",
      value: orders.filter((o) => o.status === "pending").length,
      icon: Clock3,
    },
    {
      label: "Diproses",
      value: orders.filter((o) => o.status === "processing").length,
      icon: PackageCheck,
    },
    {
      label: "Dalam Pengiriman",
      value: orders.filter((o) => o.status === "shipped").length,
      icon: Truck,
    },
  ];

  function openOrder(order: Order) {
    setSelectedId(order.id);
    setCourierId(order.courier_id ?? "");
    setLatitude(
      order.delivery_latitude == null
        ? ""
        : String(order.delivery_latitude)
    );
    setLongitude(
      order.delivery_longitude == null
        ? ""
        : String(order.delivery_longitude)
    );
    setNotice("");
  }

  function updateStatus(nextStatus: Status) {
    if (!selected || pending) return;

    if (
      nextStatus === "cancelled" &&
      !window.confirm("Yakin ingin membatalkan pesanan ini?")
    ) {
      return;
    }

    setNotice("");

    startTransition(async () => {
      try {
        const result = await changeOrderStatus(
          selected.id,
          nextStatus
        );

        setNoticeSuccess(result.success);
        setNotice(result.message);

        if (result.success) {
          setSelectedId(null);
          router.refresh();
        }
      } catch {
        setNoticeSuccess(false);
        setNotice("Gagal memperbarui status pesanan.");
      }
    });
  }

  function saveCourier() {
    if (!selected || pending) return;

    if (!courierId) {
      setNoticeSuccess(false);
      setNotice("Pilih Kurir terlebih dahulu.");
      return;
    }

    if (!latitude.trim() || !longitude.trim()) {
      setNoticeSuccess(false);
      setNotice("Isi koordinat tujuan pengantaran.");
      return;
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      setNoticeSuccess(false);
      setNotice("Koordinat tujuan tidak valid.");
      return;
    }

    setNotice("");

    startTransition(async () => {
      try {
        const result = await assignOrderCourier(
          selected.id,
          courierId,
          lat,
          lng
        );

        setNoticeSuccess(result.success);
        setNotice(result.message);

        if (result.success) {
          setSelectedId(null);
          router.refresh();
        }
      } catch {
        setNoticeSuccess(false);
        setNotice("Gagal menyimpan penugasan Kurir.");
      }
    });
  }

  return (
    <div className="space-y-7">
      {notice && (
        <div
          role="status"
          className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-sm font-semibold ${
            noticeSuccess
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <span className="flex items-center gap-2">
            {noticeSuccess
              ? <CheckCircle2 size={18} />
              : <AlertCircle size={18} />}
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
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm font-semibold text-[#8C7A65]">
                  {stat.label}
                </p>
                <div className="rounded-xl bg-[#FFF0BF] p-3">
                  <Icon size={21} className="text-[#47763A]" />
                </div>
              </div>
              <p className="text-3xl font-extrabold">
                {stat.value}
              </p>
              <p className="mt-2 text-xs text-[#9A8974]">
                Data pesanan PUTARASA
              </p>
            </div>
          );
        })}
      </div>

      {/* PANEL HIJAU */}
      <section className="flex flex-col justify-between gap-4 rounded-3xl bg-[#47763A] p-6 text-white md:flex-row md:items-center">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
            <ShoppingCart size={18} />
            Operasional Penjualan
          </p>
          <h2 className="text-2xl font-extrabold">
            Kelola Pesanan Pelanggan
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
            Proses pesanan, tentukan Kurir, dan pantau
            pengantaran Buyer maupun Supplier.
          </p>
        </div>
        <div className="rounded-2xl bg-white/15 px-5 py-4">
          <p className="text-xs text-white/80">
            Pesanan perlu ditangani
          </p>
          <p className="mt-1 text-3xl font-extrabold">
            {orders.filter(
              (o) =>
                o.status === "pending" ||
                o.status === "processing"
            ).length}
          </p>
        </div>
      </section>

      {/* DAFTAR PESANAN */}
      <section className="rounded-3xl border border-[#EFE5D4] bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-xl font-extrabold">
              Daftar Pesanan
            </h2>
            <p className="mt-1 text-sm text-[#8C7A65]">
              {filtered.length} pesanan ditampilkan
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
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kode atau pelanggan..."
                className="w-full rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] py-2.5 pl-10 pr-3 text-sm outline-none"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] px-3 py-2.5 text-sm"
            >
              <option value="all">Semua Status</option>
              {(Object.entries(statusLabels) as [
                Status,
                string
              ][]).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingCart
              size={44}
              className="mx-auto mb-4 text-[#9DBB90]"
            />
            <h3 className="font-extrabold">
              Belum ada pesanan
            </h3>
            <p className="mt-2 text-sm text-[#8C7A65]">
              Pesanan pelanggan akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#EFE5D4] text-[#8C7A65]">
                  <th className="px-3 py-4">Pesanan</th>
                  <th className="px-3 py-4">Pelanggan</th>
                  <th className="px-3 py-4">Total</th>
                  <th className="px-3 py-4">Pembayaran</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-3 py-4">Kurir</th>
                  <th className="px-3 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[#F4EDE2] last:border-0"
                  >
                    <td className="px-3 py-4">
                      <p className="font-extrabold">
                        {order.order_code}
                      </p>
                      <p className="mt-1 text-xs text-[#8C7A65]">
                        {date(order.created_at)}
                      </p>
                    </td>
                    <td className="px-3 py-4">
                      {order.customer_name}
                    </td>
                    <td className="px-3 py-4 font-bold">
                      {money(order.total_amount)}
                    </td>
                    <td className="px-3 py-4">
                      {order.payment_status === "paid"
                        ? "Lunas"
                        : order.payment_status === "refunded"
                          ? "Dikembalikan"
                          : "Belum Dibayar"}
                    </td>
                    <td className="px-3 py-4">
                      <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusStyles[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      {order.courier_id
                        ? courierMap.get(order.courier_id) ||
                          "Kurir ditugaskan"
                        : "Belum ditugaskan"}
                    </td>
                    <td className="px-3 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openOrder(order)}
                        className="rounded-xl bg-[#F0F7E9] px-4 py-2 font-bold text-[#47763A] hover:bg-[#E3EFD9]"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* MODAL DETAIL */}
      {selected && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Detail pesanan ${selected.order_code}`}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#47763A]">
                  Detail Pesanan
                </p>
                <h2 className="mt-1 text-2xl font-extrabold">
                  {selected.order_code}
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

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#FFFBF1] p-4">
                <p className="text-xs text-[#8C7A65]">
                  Pelanggan
                </p>
                <p className="mt-1 font-extrabold">
                  {selected.customer_name}
                </p>
                <p className="mt-1 text-sm text-[#8C7A65]">
                  {selected.customer_phone || "-"}
                </p>
              </div>
              <div className="rounded-2xl bg-[#FFFBF1] p-4">
                <p className="text-xs text-[#8C7A65]">
                  Alamat Pengiriman
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {selected.shipping_address || "-"}
                </p>
              </div>
            </div>

            <h3 className="mt-6 font-extrabold">
              Produk Dipesan
            </h3>
            <div className="mt-3 space-y-2">
              {selectedItems.length ? (
                selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-[#EFE5D4] p-4"
                  >
                    <div>
                      <p className="font-bold">
                        {item.product_name}
                      </p>
                      <p className="mt-1 text-xs text-[#8C7A65]">
                        {item.quantity} × {money(item.unit_price)}
                      </p>
                    </div>
                    <p className="font-extrabold">
                      {money(item.subtotal)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#8C7A65]">
                  Belum ada item pesanan.
                </p>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#F0F7E9] p-5">
              <span className="font-bold">
                Total Pesanan
              </span>
              <span className="text-2xl font-extrabold text-[#47763A]">
                {money(selected.total_amount)}
              </span>
            </div>

            {selected.notes && (
              <p className="mt-4 text-sm text-[#8C7A65]">
                Catatan: {selected.notes}
              </p>
            )}

            {/* PENUGASAN KURIR */}
            <section className="mt-6 rounded-2xl border border-[#DCE9D1] bg-[#F8FBF4] p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#EAF3DF] p-3">
                  <Truck size={22} className="text-[#47763A]" />
                </div>
                <div>
                  <h3 className="font-extrabold">
                    Penugasan Kurir
                  </h3>
                  <p className="text-xs text-[#8C7A65]">
                    Atur petugas dan titik tujuan pengantaran.
                  </p>
                </div>
              </div>

              {selected.courier_id && (
                <div className="mt-4 rounded-xl bg-white p-4 text-sm">
                  <p className="font-bold text-[#47763A]">
                    Kurir saat ini
                  </p>
                  <p className="mt-1">
                    {courierMap.get(selected.courier_id) ||
                      "Kurir PUTARASA"}
                  </p>
                  {selected.assigned_at && (
                    <p className="mt-1 text-xs text-[#8C7A65]">
                      Ditugaskan {date(selected.assigned_at)}
                    </p>
                  )}
                </div>
              )}

              {selected.status === "processing" ? (
                <div className="mt-5 space-y-4">
                  {selected.payment_status !== "paid" && (
                    <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">
                      Pembayaran harus lunas sebelum Kurir
                      dapat ditugaskan.
                    </p>
                  )}

                  <label className="block space-y-2">
                    <span className="flex items-center gap-2 text-sm font-bold">
                      <UserRound size={16} />
                      Pilih Kurir
                    </span>
                    <select
                      value={courierId}
                      onChange={(e) => setCourierId(e.target.value)}
                      disabled={pending}
                      className="w-full rounded-xl border border-[#E8DDCC] bg-white px-4 py-3 text-sm"
                    >
                      <option value="">Pilih Kurir</option>
                      {couriers.map((courier) => (
                        <option
                          key={courier.id}
                          value={courier.id}
                        >
                          {courier.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block space-y-2">
                      <span className="flex items-center gap-2 text-sm font-bold">
                        <MapPin size={16} />
                        Latitude
                      </span>
                      <input
                        type="number"
                        step="any"
                        min="-90"
                        max="90"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        placeholder="Koordinat lintang"
                        className="w-full rounded-xl border border-[#E8DDCC] bg-white px-4 py-3 text-sm"
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="flex items-center gap-2 text-sm font-bold">
                        <MapPin size={16} />
                        Longitude
                      </span>
                      <input
                        type="number"
                        step="any"
                        min="-180"
                        max="180"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        placeholder="Koordinat bujur"
                        className="w-full rounded-xl border border-[#E8DDCC] bg-white px-4 py-3 text-sm"
                      />
                    </label>
                  </div>

                  <p className="text-xs leading-5 text-[#8C7A65]">
                    Masukkan koordinat tujuan yang sudah
                    diverifikasi. Jangan menggunakan koordinat
                    perkiraan sebagai alamat penerima.
                  </p>

                  <button
                    type="button"
                    onClick={saveCourier}
                    disabled={
                      pending ||
                      selected.payment_status !== "paid" ||
                      couriers.length === 0
                    }
                    className="w-full rounded-xl bg-[#47763A] px-5 py-3 font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {pending
                      ? "Menyimpan..."
                      : selected.courier_id
                        ? "Perbarui Penugasan"
                        : "Tugaskan Kurir"}
                  </button>
                </div>
              ) : (
                <p className="mt-4 text-sm text-[#8C7A65]">
                  Penugasan dapat diatur ketika pesanan
                  berstatus Diproses.
                </p>
              )}
            </section>

            {/* PERUBAHAN STATUS */}
            <div className="mt-6 flex flex-wrap gap-3 border-t border-[#EFE5D4] pt-5">
              {selected.status === "pending" && (
                <>
                  <button
                    type="button"
                    disabled={
                      pending ||
                      selectedItems.length === 0
                    }
                    onClick={() => updateStatus("processing")}
                    className="flex-1 rounded-xl bg-[#47763A] px-5 py-3 font-bold text-white disabled:opacity-50"
                  >
                    Proses Pesanan
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => updateStatus("cancelled")}
                    className="rounded-xl border border-red-200 px-5 py-3 font-bold text-red-700 disabled:opacity-50"
                  >
                    Batalkan
                  </button>
                </>
              )}

              {selected.status === "processing" && (
                <>
                  <button
                    type="button"
                    disabled={
                      pending ||
                      !selected.courier_id ||
                      selected.payment_status !== "paid" ||
                      selected.delivery_latitude == null ||
                      selected.delivery_longitude == null
                    }
                    onClick={() => updateStatus("shipped")}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#47763A] px-5 py-3 font-bold text-white disabled:opacity-50"
                  >
                    <Truck size={18} />
                    Tandai Dikirim
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => updateStatus("cancelled")}
                    className="rounded-xl border border-red-200 px-5 py-3 font-bold text-red-700 disabled:opacity-50"
                  >
                    Batalkan
                  </button>
                </>
              )}

              {selected.status === "shipped" && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => updateStatus("completed")}
                  className="w-full rounded-xl bg-[#47763A] px-5 py-3 font-bold text-white disabled:opacity-50"
                >
                  Tandai Selesai
                </button>
              )}

              {selected.status === "completed" && (
                <div className="flex w-full items-center gap-2 rounded-xl bg-green-50 p-4 text-sm font-bold text-green-700">
                  <CheckCircle2 size={19} />
                  Pesanan telah selesai.
                </div>
              )}

              {selected.status === "cancelled" && (
                <div className="flex w-full items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">
                  <AlertCircle size={19} />
                  Pesanan telah dibatalkan.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
