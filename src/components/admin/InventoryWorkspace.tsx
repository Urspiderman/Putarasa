
"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardCheck,
  History,
  Package,
  Plus,
  Search,
  AlertTriangle,
  X,
  CheckCircle2,
  Factory,
} from "lucide-react";
import {
  recordInventory,
  type InventoryPayload,
} from "@/app/admin/inventori/actions";

type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  is_active: boolean;
};

type Stock = {
  product_id: string;
  quantity: number;
};

type Movement = {
  id: string;
  product_id: string;
  movement_type: string;
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  source_output_id: string | null;
  notes: string | null;
  created_at: string;
};

type ProductionOutput = {
  id: string;
  output_type: string;
  weight_kg: number;
  batch_code: string;
};

type Props = {
  products: Product[];
  stocks: Stock[];
  movements: Movement[];
  availableOutputs: ProductionOutput[];
};

type MovementType = InventoryPayload["movementType"];

const outputLabels: Record<string, string> = {
  compost: "Kompos",
  fresh_maggot: "Maggot Segar",
  dried_maggot: "Maggot Kering",
  frass: "Frass",
  residue: "Residu",
  other: "Lainnya",
};

function number(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 3,
  }).format(value || 0);
}

function date(value: string) {
  return new Date(value).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: typeof Boxes;
}) {
  return (
    <div className="rounded-3xl border border-[#EFE5D4] bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-[#8C7A65]">
          {title}
        </p>
        <div className="rounded-xl bg-[#FFF0BF] p-3">
          <Icon size={21} className="text-[#47763A]" />
        </div>
      </div>
      <p className="text-3xl font-extrabold">{value}</p>
      <p className="mt-2 text-xs text-[#9A8974]">
        {detail}
      </p>
    </div>
  );
}

export default function InventoryWorkspace({
  products,
  stocks,
  movements,
  availableOutputs,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [movementType, setMovementType] =
    useState<MovementType>("in");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [sourceOutputId, setSourceOutputId] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(true);

  const stockMap = useMemo(
    () =>
      new Map(
        stocks.map((item) => [
          item.product_id,
          Number(item.quantity),
        ])
      ),
    [stocks]
  );

  const productMap = useMemo(
    () => new Map(products.map((item) => [item.id, item])),
    [products]
  );

  const selectedProduct = productMap.get(productId);
  const selectedStock = stockMap.get(productId) ?? 0;

  const selectedOutput = availableOutputs.find(
    (item) => item.id === sourceOutputId
  );

  const compatibleOutputs = availableOutputs.filter(
    (output) => {
      if (!selectedProduct || selectedProduct.unit !== "kg") {
        return false;
      }
      if (output.output_type === "compost") {
        return selectedProduct.category === "compost";
      }
      if (
        output.output_type === "fresh_maggot" ||
        output.output_type === "dried_maggot"
      ) {
        return selectedProduct.category === "maggot";
      }
      return selectedProduct.category === "other";
    }
  );

  const filteredProducts = products.filter((product) => {
    const keyword = search.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(keyword) ||
      product.sku.toLowerCase().includes(keyword);

    const stock = stockMap.get(product.id) ?? 0;
    const matchesFilter =
      filter === "all" ||
      (filter === "available" && stock > 0) ||
      (filter === "empty" && stock === 0) ||
      (filter === "inactive" && !product.is_active);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    products: products.length,
    stocked: products.filter(
      (product) => (stockMap.get(product.id) ?? 0) > 0
    ).length,
    empty: products.filter(
      (product) => (stockMap.get(product.id) ?? 0) === 0
    ).length,
    transactions: movements.length,
  };

  function openTransaction(
    type: MovementType,
    initialProductId = ""
  ) {
    setMovementType(type);
    setProductId(initialProductId);
    setQuantity("");
    setNotes("");
    setSourceOutputId("");
    setMessage("");
    setModalOpen(true);
  }

  function handleSave() {
    const parsedQuantity = Number(quantity);

    if (
      !productId ||
      quantity.trim() === "" ||
      !Number.isFinite(parsedQuantity) ||
      parsedQuantity < 0 ||
      (movementType !== "adjustment" &&
        parsedQuantity <= 0)
    ) {
      setSuccess(false);
      setMessage("Pilih produk dan isi jumlah yang valid.");
      return;
    }

    if (
      movementType === "out" &&
      parsedQuantity > selectedStock
    ) {
      setSuccess(false);
      setMessage("Jumlah melebihi stok yang tersedia.");
      return;
    }

    if (
      sourceOutputId &&
      (!selectedOutput ||
        parsedQuantity !== selectedOutput.weight_kg)
    ) {
      setSuccess(false);
      setMessage(
        "Jumlah harus sama dengan berat hasil produksi."
      );
      return;
    }

    startTransition(async () => {
      try {
        const result = await recordInventory({
          productId,
          movementType,
          quantity: parsedQuantity,
          notes,
          sourceOutputId:
            movementType === "in"
              ? sourceOutputId || null
              : null,
        });

        setSuccess(result.success);
        setMessage(result.message);

        if (result.success) {
          setModalOpen(false);
          router.refresh();
        }
      } catch (error) {
        setSuccess(false);
        setMessage(
          error instanceof Error
            ? error.message
            : "Gagal mencatat transaksi."
        );
      }
    });
  }

  return (
    <div className="space-y-7">
      {message && (
        <div
          role="status"
          className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-sm font-semibold ${
            success
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {success ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertTriangle size={18} />
            )}
            {message}
          </div>
          <button
            onClick={() => setMessage("")}
            aria-label="Tutup pesan"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* STATISTIK */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Produk"
          value={String(stats.products)}
          detail="Produk dalam katalog"
          icon={Package}
        />
        <StatCard
          title="Produk Berstok"
          value={String(stats.stocked)}
          detail="Produk dengan saldo positif"
          icon={Boxes}
        />
        <StatCard
          title="Stok Kosong"
          value={String(stats.empty)}
          detail="Produk tanpa stok tersedia"
          icon={AlertTriangle}
        />
        <StatCard
          title="Riwayat Ditampilkan"
          value={String(stats.transactions)}
          detail="Maksimal 200 transaksi terbaru"
          icon={History}
        />
      </div>

      {/* PANEL AKSI */}
      <section className="flex flex-col gap-5 rounded-3xl bg-[#47763A] p-6 text-white md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
            <Factory size={18} />
            Pengelolaan Persediaan
          </p>
          <h2 className="text-2xl font-extrabold">
            Inventori Produk PUTARASA
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
            Catat stok masuk dari produksi atau sumber lain,
            stok keluar, dan hasil stock opname.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => openTransaction("in")}
            className="inline-flex items-center gap-2 rounded-xl bg-[#FFDA57] px-4 py-3 text-sm font-extrabold text-[#332417]"
          >
            <Plus size={18} />
            Stok Masuk
          </button>
          <button
            onClick={() => openTransaction("out")}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#47763A]"
          >
            <ArrowUpFromLine size={18} />
            Stok Keluar
          </button>
        </div>
      </section>

      {/* TABEL PRODUK */}
      <section className="rounded-3xl border border-[#EFE5D4] bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-xl font-extrabold">
              Stok Produk
            </h2>
            <p className="mt-1 text-sm text-[#8C7A65]">
              Saldo persediaan setiap produk
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
                placeholder="Cari produk atau SKU..."
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
              <option value="all">Semua Produk</option>
              <option value="available">Ada Stok</option>
              <option value="empty">Stok Kosong</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-14 text-center">
            <Boxes
              size={42}
              className="mx-auto mb-3 text-[#9DBB90]"
            />
            <p className="font-bold">
              Tidak ada produk ditemukan
            </p>
            <p className="mt-2 text-sm text-[#8C7A65]">
              Tambahkan produk melalui menu Produk.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#EFE5D4] text-[#8C7A65]">
                  <th className="px-3 py-4">Produk</th>
                  <th className="px-3 py-4">SKU</th>
                  <th className="px-3 py-4">Stok</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-3 py-4 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const stock =
                    stockMap.get(product.id) ?? 0;

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-[#F4EDE2] last:border-0"
                    >
                      <td className="px-3 py-4">
                        <p className="font-extrabold">
                          {product.name}
                        </p>
                        <p className="mt-1 text-xs text-[#8C7A65]">
                          {product.category}
                        </p>
                      </td>
                      <td className="px-3 py-4 text-[#7B6A55]">
                        {product.sku}
                      </td>
                      <td className="px-3 py-4">
                        <span className="text-lg font-extrabold">
                          {number(stock)}
                        </span>
                        <span className="ml-1 text-xs text-[#8C7A65]">
                          {product.unit}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                            stock > 0
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {stock > 0
                            ? "Tersedia"
                            : "Kosong"}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-right">
                        <button
                          onClick={() =>
                            openTransaction(
                              "adjustment",
                              product.id
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-[#E8DDCC] px-3 py-2 font-bold text-[#47763A] hover:bg-[#F0F7E9]"
                        >
                          <ClipboardCheck size={16} />
                          Sesuaikan
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

      {/* RIWAYAT */}
      <section className="rounded-3xl border border-[#EFE5D4] bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-[#FFF0BF] p-3">
            <History
              size={21}
              className="text-[#47763A]"
            />
          </div>
          <div>
            <h2 className="text-xl font-extrabold">
              Riwayat Pergerakan Stok
            </h2>
            <p className="text-sm text-[#8C7A65]">
              Catatan transaksi inventori terbaru
            </p>
          </div>
        </div>

        {movements.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#8C7A65]">
            Belum ada transaksi stok.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#EFE5D4] text-[#8C7A65]">
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Produk</th>
                  <th className="p-3">Jenis</th>
                  <th className="p-3">Perubahan</th>
                  <th className="p-3">Saldo Akhir</th>
                  <th className="p-3">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((item) => {
                  const product =
                    productMap.get(item.product_id);

                  const typeLabel =
                    item.movement_type === "in"
                      ? "Masuk"
                      : item.movement_type === "out"
                        ? "Keluar"
                        : "Penyesuaian";

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-[#F4EDE2] last:border-0"
                    >
                      <td className="p-3 text-[#8C7A65]">
                        {date(item.created_at)}
                      </td>
                      <td className="p-3 font-bold">
                        {product?.name ?? "Produk"}
                      </td>
                      <td className="p-3">
                        <span className="rounded-full bg-[#F0F7E9] px-3 py-1 text-xs font-bold text-[#47763A]">
                          {typeLabel}
                        </span>
                      </td>
                      <td
                        className={`p-3 font-extrabold ${
                          item.quantity_change > 0
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {item.quantity_change > 0
                          ? "+"
                          : ""}
                        {number(item.quantity_change)}
                      </td>
                      <td className="p-3 font-bold">
                        {number(item.quantity_after)}
                      </td>
                      <td className="p-3 text-[#8C7A65]">
                        {item.source_output_id
                          ? "Hasil pengolahan"
                          : item.notes || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* MODAL TRANSAKSI */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-extrabold">
                  {movementType === "in"
                    ? "Catat Stok Masuk"
                    : movementType === "out"
                      ? "Catat Stok Keluar"
                      : "Penyesuaian Stok"}
                </h2>
                <p className="mt-1 text-sm text-[#8C7A65]">
                  Semua perubahan akan tercatat
                  dalam riwayat inventori.
                </p>
              </div>
              <button
                disabled={pending}
                onClick={() => setModalOpen(false)}
                aria-label="Tutup"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold">
                  Jenis Transaksi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    ["in", "Masuk"],
                    ["out", "Keluar"],
                    ["adjustment", "Opname"],
                  ] as const).map(([value, label]) => (
                    <button
                      key={value}
                      disabled={pending}
                      onClick={() => {
                        setMovementType(value);
                        setSourceOutputId("");
                        setQuantity("");
                      }}
                      className={`rounded-xl border p-3 text-xs font-bold ${
                        movementType === value
                          ? "border-[#47763A] bg-[#F0F7E9] text-[#47763A]"
                          : "border-[#E8DDCC]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Produk
                </label>
                <select
                  value={productId}
                  disabled={pending}
                  onChange={(event) => {
                    setProductId(event.target.value);
                    setSourceOutputId("");
                    setQuantity("");
                  }}
                  className="w-full rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] p-3"
                >
                  <option value="">Pilih produk</option>
                  {products.map((product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div className="rounded-xl bg-[#F0F7E9] p-4">
                  <p className="text-xs font-semibold text-[#47763A]">
                    Stok Saat Ini
                  </p>
                  <p className="mt-1 text-2xl font-extrabold">
                    {number(selectedStock)}{" "}
                    {selectedProduct.unit}
                  </p>
                </div>
              )}

              {movementType === "in" && productId && (
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Sumber Hasil Pengolahan (opsional)
                  </label>
                  <select
                    value={sourceOutputId}
                    disabled={pending}
                    onChange={(event) => {
                      const id = event.target.value;
                      setSourceOutputId(id);

                      const output = compatibleOutputs.find(
                        (item) => item.id === id
                      );

                      setQuantity(
                        output
                          ? String(output.weight_kg)
                          : ""
                      );
                    }}
                    className="w-full rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] p-3 text-sm"
                  >
                    <option value="">
                      Stok masuk manual
                    </option>
                    {compatibleOutputs.map((output) => (
                      <option
                        key={output.id}
                        value={output.id}
                      >
                        {output.batch_code} —{" "}
                        {outputLabels[output.output_type] ??
                          output.output_type}{" "}
                        ({number(output.weight_kg)} kg)
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-[#8C7A65]">
                    Pilih hasil batch selesai untuk
                    memasukkannya ke inventori.
                    Satu hasil produksi hanya dapat
                    digunakan satu kali.
                  </p>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-bold">
                  {movementType === "adjustment"
                    ? "Jumlah Stok Akhir"
                    : "Jumlah"}{" "}
                  ({selectedProduct?.unit ?? "satuan"})
                </label>
                <input
                  type="number"
                  min={
                    movementType === "adjustment"
                      ? "0"
                      : "0.001"
                  }
                  step="0.001"
                  value={quantity}
                  disabled={pending || Boolean(sourceOutputId)}
                  onChange={(event) =>
                    setQuantity(event.target.value)
                  }
                  placeholder={
                    movementType === "adjustment"
                      ? "Stok hasil perhitungan fisik"
                      : "Contoh: 10"
                  }
                  className="w-full rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] p-3 outline-none"
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
                  placeholder="Contoh: Hasil produksi, barang rusak, atau koreksi stock opname"
                  className="w-full resize-none rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] p-3 outline-none"
                />
              </div>

              <button
                disabled={pending || !productId}
                onClick={handleSave}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFDA57] px-5 py-3.5 font-extrabold text-[#332417] disabled:opacity-50"
              >
                {movementType === "in" ? (
                  <ArrowDownToLine size={19} />
                ) : (
                  <ClipboardCheck size={19} />
                )}
                {pending
                  ? "Menyimpan..."
                  : "Simpan Transaksi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
