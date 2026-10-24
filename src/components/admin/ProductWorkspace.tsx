
"use client";

import {
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  CircleDollarSign,
  Edit3,
  Leaf,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Sprout,
  X,
} from "lucide-react";

import {
  saveProduct,
  type ProductPayload,
} from "@/app/admin/produk/actions";

type Product = {
  id: string;
  name: string;
  sku: string;
  category: "compost" | "maggot" | "other";
  description: string;
  price: number;
  unit: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
};

type Props = {
  products: Product[];
};

const emptyForm: ProductPayload = {
  id: null,
  name: "",
  sku: "",
  category: "compost",
  description: "",
  price: 0,
  unit: "kg",
  is_active: true,
};

const categoryLabels = {
  compost: "Kompos",
  maggot: "Maggot",
  other: "Lainnya",
};

function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export default function ProductWorkspace({
  products,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ProductPayload>(
    emptyForm
  );

  const [message, setMessage] = useState("");
  const [messageSuccess, setMessageSuccess] =
    useState(true);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(keyword) ||
        product.sku.toLowerCase().includes(keyword);

      const matchesCategory =
        category === "all" ||
        product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const activeCount = products.filter(
    (product) => product.is_active
  ).length;

  const inactiveCount =
    products.length - activeCount;

  function openCreate() {
    setForm({ ...emptyForm });
    setMessage("");
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setForm({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      description: product.description,
      price: Number(product.price),
      unit: product.unit,
      is_active: product.is_active,
    });

    setMessage("");
    setModalOpen(true);
  }

  function handleSave() {
    if (
      !form.name.trim() ||
      !form.sku.trim() ||
      !form.unit.trim()
    ) {
      setMessageSuccess(false);
      setMessage("Nama, SKU, dan satuan wajib diisi.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await saveProduct(form);

        setMessageSuccess(result.success);
        setMessage(result.message);

        if (result.success) {
          setModalOpen(false);
          router.refresh();
        }
      } catch (error) {
        setMessageSuccess(false);
        setMessage(
          error instanceof Error
            ? error.message
            : "Gagal menyimpan produk."
        );
      }
    });
  }

  function handleToggle(product: Product) {
    startTransition(async () => {
      const result = await saveProduct({
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        description: product.description,
        price: Number(product.price),
        unit: product.unit,
        is_active: !product.is_active,
      });

      setMessageSuccess(result.success);
      setMessage(result.message);

      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-7">
      {message && (
        <div
          role="status"
          className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-sm font-semibold ${
            messageSuccess
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <span>{message}</span>
          <button
            onClick={() => setMessage("")}
            aria-label="Tutup notifikasi"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total Produk",
            value: products.length,
            icon: Package,
          },
          {
            label: "Produk Aktif",
            value: activeCount,
            icon: CheckCircle2,
          },
          {
            label: "Produk Nonaktif",
            value: inactiveCount,
            icon: ShoppingBag,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-3xl border border-[#EFE5D4] bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#8C7A65]">
                  {item.label}
                </span>

                <div className="rounded-xl bg-[#FFF0BF] p-2.5">
                  <Icon
                    size={21}
                    className="text-[#47763A]"
                  />
                </div>
              </div>

              <p className="text-3xl font-extrabold text-[#332417]">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-5 rounded-3xl bg-[#47763A] p-6 text-white md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
            <Leaf size={18} />
            Katalog Produk PUTARASA
          </div>

          <h2 className="text-2xl font-extrabold">
            Kelola Produk Ramah Lingkungan
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
            Atur informasi, harga, dan status penjualan
            produk kompos serta maggot.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#FFDA57] px-5 py-3 font-extrabold text-[#332417] transition hover:bg-[#FFE586]"
        >
          <Plus size={19} />
          Tambah Produk
        </button>
      </div>

      <section className="rounded-3xl border border-[#EFE5D4] bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-extrabold text-[#332417]">
              Daftar Produk
            </h2>

            <p className="mt-1 text-sm text-[#8C7A65]">
              {filteredProducts.length} produk ditampilkan
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
                placeholder="Cari nama atau SKU..."
                className="w-full rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#47763A]"
              />
            </div>

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] px-3 py-2.5 text-sm outline-none"
            >
              <option value="all">
                Semua Kategori
              </option>
              <option value="compost">
                Kompos
              </option>
              <option value="maggot">
                Maggot
              </option>
              <option value="other">
                Lainnya
              </option>
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Sprout
              size={44}
              className="mb-4 text-[#9DBB90]"
            />
            <h3 className="font-bold text-[#332417]">
              Belum ada produk
            </h3>
            <p className="mt-2 text-sm text-[#8C7A65]">
              Klik Tambah Produk untuk membuat katalog.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-3xl border border-[#EFE5D4] bg-[#FFFEFA] transition hover:shadow-md"
              >
                <div className="flex h-40 items-center justify-center bg-[#F0F7E9]">
                  {product.category === "compost" ? (
                    <Sprout
                      size={55}
                      className="text-[#47763A]"
                    />
                  ) : product.category === "maggot" ? (
                    <Leaf
                      size={55}
                      className="text-[#47763A]"
                    />
                  ) : (
                    <Package
                      size={55}
                      className="text-[#47763A]"
                    />
                  )}
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-[#FFF0BF] px-3 py-1 text-xs font-bold text-[#805F16]">
                      {categoryLabels[product.category]}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        product.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {product.is_active
                        ? "Aktif"
                        : "Nonaktif"}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-[#332417]">
                    {product.name}
                  </h3>

                  <p className="mt-1 text-xs text-[#8C7A65]">
                    SKU: {product.sku}
                  </p>

                  <p className="mt-3 min-h-12 text-sm leading-6 text-[#8C7A65]">
                    {product.description ||
                      "Belum ada deskripsi produk."}
                  </p>

                  <div className="mt-4 flex items-end justify-between border-t border-[#EFE5D4] pt-4">
                    <div>
                      <p className="text-xs text-[#8C7A65]">
                        Harga jual
                      </p>
                      <p className="text-xl font-extrabold text-[#47763A]">
                        {rupiah(product.price)}
                      </p>
                      <p className="text-xs text-[#8C7A65]">
                        per {product.unit}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#FFF0BF] p-2.5">
                      <CircleDollarSign
                        size={22}
                        className="text-[#47763A]"
                      />
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openEdit(product)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#47763A] px-3 py-2.5 text-sm font-bold text-white"
                    >
                      <Edit3 size={16} />
                      Edit
                    </button>

                    <button
                      disabled={pending}
                      onClick={() => handleToggle(product)}
                      className="rounded-xl border border-[#E8DDCC] px-3 py-2.5 text-sm font-bold text-[#5B4B36] disabled:opacity-50"
                    >
                      {product.is_active
                        ? "Nonaktifkan"
                        : "Aktifkan"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-extrabold">
                  {form.id
                    ? "Edit Produk"
                    : "Tambah Produk"}
                </h2>
                <p className="mt-1 text-sm text-[#8C7A65]">
                  Lengkapi informasi katalog PUTARASA.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                aria-label="Tutup"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold">
                  Nama Produk
                </label>
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                    })
                  }
                  placeholder="Contoh: Kompos Organik Premium"
                  className="w-full rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] p-3 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  SKU Produk
                </label>
                <input
                  value={form.sku}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      sku: event.target.value,
                    })
                  }
                  placeholder="Contoh: PUT-KOM-001"
                  className="w-full rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] p-3 outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Kategori
                  </label>
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        category: event.target.value as
                          ProductPayload["category"],
                      })
                    }
                    className="w-full rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] p-3 outline-none"
                  >
                    <option value="compost">
                      Kompos
                    </option>
                    <option value="maggot">
                      Maggot
                    </option>
                    <option value="other">
                      Lainnya
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Satuan
                  </label>
                  <select
                    value={form.unit}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        unit: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] p-3 outline-none"
                  >
                    <option value="kg">Kilogram</option>
                    <option value="gram">Gram</option>
                    <option value="pack">Pack</option>
                    <option value="unit">Unit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Harga Jual (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={form.price}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      price: Number(event.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] p-3 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Deskripsi
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                  placeholder="Jelaskan keunggulan produk..."
                  className="w-full resize-none rounded-xl border border-[#E8DDCC] bg-[#FFFBF1] p-3 outline-none"
                />
              </div>

              <label className="flex items-center gap-3 rounded-xl bg-[#FFFBF1] p-4 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      is_active: event.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-[#47763A]"
                />
                Produk aktif dan siap ditampilkan
              </label>

              <button
                disabled={pending}
                onClick={handleSave}
                className="w-full rounded-xl bg-[#FFDA57] px-5 py-3.5 font-extrabold text-[#332417] disabled:opacity-50"
              >
                {pending
                  ? "Menyimpan..."
                  : form.id
                    ? "Simpan Perubahan"
                    : "Tambah Produk"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
