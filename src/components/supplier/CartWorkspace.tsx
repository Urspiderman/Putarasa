
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Leaf,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sprout,
  Trash2,
  Truck,
} from "lucide-react";

import {
  removeCartItem,
  updateCartQuantity,
} from "@/app/supplier/keranjang/actions";

type CartItem = {
  id: string;
  product_id: string;
  quantity: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  unit: string;
  image_url: string | null;
  is_active: boolean;
  stock: number;
};

type Props = {
  initialItems: CartItem[];
};

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

function categoryLabel(value: string) {
  if (value === "compost") return "Pupuk Kompos";
  if (value === "maggot") return "Produk Maggot";
  return "Produk Lainnya";
}

export default function CartWorkspace({
  initialItems,
}: Props) {
  const router = useRouter();

  const [items, setItems] =
    useState<CartItem[]>(initialItems);

  const [selectedIds, setSelectedIds] =
    useState<string[]>(
      initialItems
        .filter(
          (item) =>
            item.is_active &&
            item.stock >= item.quantity &&
            item.quantity > 0
        )
        .map((item) => item.id)
    );

  const [pendingId, setPendingId] =
    useState<string | null>(null);

  const [isPending, startTransition] =
    useTransition();

  const [feedback, setFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const eligibleItems = useMemo(
    () =>
      items.filter(
        (item) =>
          item.is_active &&
          item.stock >= item.quantity &&
          item.quantity > 0
      ),
    [items]
  );

  const selectedItems = useMemo(
    () =>
      eligibleItems.filter((item) =>
        selectedIds.includes(item.id)
      ),
    [eligibleItems, selectedIds]
  );

  const subtotal = selectedItems.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  const totalQuantity = selectedItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const allSelected =
    eligibleItems.length > 0 &&
    eligibleItems.every((item) =>
      selectedIds.includes(item.id)
    );

  function toggleItem(id: string) {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((itemId) => itemId !== id)
        : [...previous, id]
    );
  }

  function toggleAll() {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(
        eligibleItems.map((item) => item.id)
      );
    }
  }

  function changeQuantity(
    item: CartItem,
    nextQuantity: number
  ) {
    if (
      isPending ||
      nextQuantity < 1 ||
      nextQuantity > item.stock ||
      nextQuantity > 1000
    ) {
      return;
    }

    setFeedback(null);
    setPendingId(item.id);

    startTransition(async () => {
      const result = await updateCartQuantity(
        item.id,
        nextQuantity
      );

      if (result.success) {
        setItems((previous) =>
          previous.map((row) =>
            row.id === item.id
              ? { ...row, quantity: nextQuantity }
              : row
          )
        );

        router.refresh();
      }

      setFeedback(result);
      setPendingId(null);
    });
  }

  function handleRemove(item: CartItem) {
    if (isPending) return;

    setFeedback(null);
    setPendingId(item.id);

    startTransition(async () => {
      const result = await removeCartItem(item.id);

      if (result.success) {
        setItems((previous) =>
          previous.filter(
            (row) => row.id !== item.id
          )
        );

        setSelectedIds((previous) =>
          previous.filter(
            (id) => id !== item.id
          )
        );

        router.refresh();
      }

      setFeedback(result);
      setPendingId(null);
    });
  }

  function handleCheckout() {
    if (selectedItems.length === 0) {
      setFeedback({
        success: false,
        message:
          "Pilih minimal satu produk untuk checkout.",
      });
      return;
    }

    sessionStorage.setItem(
      "putarasa_checkout_items",
      JSON.stringify(
        selectedItems.map((item) => ({
          cartItemId: item.id,
          productId: item.product_id,
        }))
      )
    );

    router.push("/supplier/checkout");
  }

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-7 px-4 pb-16 pt-6 text-[#332417] sm:px-6 lg:px-8">

      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/supplier/marketplace"
          className="inline-flex items-center gap-2 font-bold text-[#47763A] hover:underline"
        >
          <ArrowLeft size={17} />
          Marketplace
        </Link>

        <ChevronRight
          size={16}
          className="text-[#B7A995]"
        />

        <span className="font-bold">
          Keranjang Belanja
        </span>
      </div>

      {/* HEADER */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF0BF] px-4 py-2 text-xs font-black text-[#47763A]">
            <ShoppingCart size={15} />
            KERANJANG PUTARASA
          </span>

          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Keranjang{" "}
            <span className="text-[#47763A]">
              Belanja
            </span>
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#8C7A65]">
            Periksa kembali produk pilihanmu sebelum
            melanjutkan ke checkout.
          </p>
        </div>

        <Link
          href="/supplier/marketplace"
          className="inline-flex items-center gap-2 rounded-xl border border-[#DDE8D2] bg-white px-5 py-3 text-sm font-extrabold text-[#47763A] transition hover:bg-[#EAF3DF]"
        >
          <ShoppingBag size={18} />
          Lanjut Belanja
          <ArrowRight size={17} />
        </Link>
      </section>

      {/* FEEDBACK */}
      {feedback && (
        <div
          role="status"
          className={`flex items-center gap-3 rounded-2xl border p-4 text-sm font-semibold ${
            feedback.success
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.success && (
            <CheckCircle2 size={20} />
          )}
          {feedback.message}
        </div>
      )}

      {/* KERANJANG KOSONG */}
      {items.length === 0 ? (
        <section className="rounded-[30px] border border-[#EFE5D4] bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-[#EAF3DF]">
            <ShoppingCart
              size={52}
              strokeWidth={1.4}
              className="text-[#47763A]"
            />
          </div>

          <h2 className="mt-7 text-2xl font-black">
            Keranjangmu Masih Kosong
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#8C7A65]">
            Belum ada produk yang ditambahkan.
            Yuk, jelajahi Marketplace dan temukan
            produk yang kamu butuhkan.
          </p>

          <Link
            href="/supplier/marketplace"
            className="mt-7 inline-flex items-center gap-3 rounded-2xl bg-[#47763A] px-7 py-4 text-sm font-black text-white transition hover:bg-[#315F2E]"
          >
            <ShoppingBag size={19} />
            Mulai Belanja
            <ArrowRight size={18} />
          </Link>
        </section>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_390px]">

          {/* KOLOM KIRI */}
          <section className="space-y-4">

            {/* PILIH SEMUA */}
            <div className="flex items-center justify-between gap-3 rounded-[22px] border border-[#EFE5D4] bg-white p-5 shadow-sm">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  disabled={eligibleItems.length === 0}
                  className="h-5 w-5 accent-[#47763A]"
                />

                <span className="font-black">
                  Pilih Semua Produk
                </span>
              </label>

              <span className="rounded-full bg-[#EAF3DF] px-3 py-1.5 text-xs font-extrabold text-[#47763A]">
                {items.length} Produk
              </span>
            </div>

            {/* DAFTAR PRODUK */}
            {items.map((item) => {
              const valid =
                item.is_active &&
                item.stock >= item.quantity &&
                item.quantity > 0;

              const selected =
                selectedIds.includes(item.id) && valid;

              const itemPending =
                isPending && pendingId === item.id;

              return (
                <article
                  key={item.id}
                  className={`rounded-[24px] border bg-white p-4 shadow-sm transition sm:p-5 ${
                    selected
                      ? "border-[#B9D5A8]"
                      : "border-[#EFE5D4]"
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">

                    {/* CHECKBOX */}
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleItem(item.id)}
                      disabled={!valid || isPending}
                      aria-label={`Pilih ${item.name}`}
                      className="mt-3 h-5 w-5 shrink-0 accent-[#47763A]"
                    />

                    {/* FOTO */}
                    <Link
                      href={`/supplier/marketplace/${item.product_id}`}
                      className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#EAF3DF] sm:h-32 sm:w-32"
                    >
                      {item.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Sprout
                          size={48}
                          className="text-[#47763A]"
                        />
                      )}
                    </Link>

                    {/* INFO */}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold text-[#47763A]">
                        {categoryLabel(item.category)}
                      </p>

                      <Link
                        href={`/supplier/marketplace/${item.product_id}`}
                        className="mt-1 block text-base font-black leading-6 hover:text-[#47763A] sm:text-lg"
                      >
                        {item.name}
                      </Link>

                      <p className="mt-1 text-xs text-[#9A8974]">
                        SKU: {item.sku}
                      </p>

                      <p className="mt-3 text-lg font-black text-[#47763A]">
                        {rupiah(item.price)}
                        <span className="ml-1 text-xs font-medium text-[#8C7A65]">
                          / {item.unit}
                        </span>
                      </p>

                      <span
                        className={`mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold ${
                          valid
                            ? "bg-[#EAF3DF] text-[#47763A]"
                            : "bg-[#FFF0BF] text-[#775B15]"
                        }`}
                      >
                        {!item.is_active
                          ? "Produk Tidak Aktif"
                          : item.stock <= 0
                            ? "Stok Habis"
                            : item.quantity > item.stock
                              ? `Stok Tersisa ${item.stock}`
                              : `Stok ${item.stock} ${item.unit}`}
                      </span>
                    </div>
                  </div>

                  {/* FOOTER ITEM */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[#F2EADF] pt-4">
                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      disabled={isPending}
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 size={17} />
                      Hapus
                    </button>

                    <div className="flex flex-wrap items-center gap-4">
                      <div className="inline-flex items-center rounded-xl border border-[#E8DFD0] bg-[#FFFBF1] p-1">
                        <button
                          type="button"
                          onClick={() =>
                            changeQuantity(
                              item,
                              item.quantity - 1
                            )
                          }
                          disabled={
                            isPending ||
                            !item.is_active ||
                            item.quantity <= 1
                          }
                          aria-label={`Kurangi ${item.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#47763A] disabled:opacity-40"
                        >
                          <Minus size={17} />
                        </button>

                        <span className="w-11 text-center text-sm font-black">
                          {itemPending
                            ? "..."
                            : item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            changeQuantity(
                              item,
                              item.quantity + 1
                            )
                          }
                          disabled={
                            isPending ||
                            !item.is_active ||
                            item.quantity >= item.stock ||
                            item.quantity >= 1000
                          }
                          aria-label={`Tambah ${item.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#47763A] disabled:opacity-40"
                        >
                          <Plus size={17} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-[#8C7A65]">
                          Subtotal
                        </p>

                        <p className="font-black text-[#332417]">
                          {rupiah(
                            item.price * item.quantity
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          {/* KOLOM KANAN */}
          <aside className="space-y-4 lg:sticky lg:top-28">
            <div className="rounded-[26px] border border-[#EFE5D4] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#FFF0BF] p-3">
                  <ShoppingBag
                    size={22}
                    className="text-[#47763A]"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-black">
                    Ringkasan Belanja
                  </h2>

                  <p className="text-xs text-[#8C7A65]">
                    Pesanan pilihanmu
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4 border-b border-[#F0E7D9] pb-5 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-[#8C7A65]">
                    Produk Dipilih
                  </span>

                  <span className="font-extrabold">
                    {selectedItems.length}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-[#8C7A65]">
                    Total Jumlah
                  </span>

                  <span className="font-extrabold">
                    {totalQuantity}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-[#8C7A65]">
                    Subtotal Produk
                  </span>

                  <span className="font-extrabold">
                    {rupiah(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-[#8C7A65]">
                    Ongkos Kirim
                  </span>

                  <span className="text-xs font-bold text-[#47763A]">
                    Dihitung saat checkout
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-sm font-bold text-[#8C7A65]">
                  Total Sementara
                </p>

                <p className="mt-2 text-3xl font-black text-[#47763A]">
                  {rupiah(subtotal)}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={
                  selectedItems.length === 0 ||
                  isPending
                }
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#47763A] px-5 py-4 text-sm font-black text-white transition hover:bg-[#315F2E] disabled:cursor-not-allowed disabled:bg-[#A8B5A1]"
              >
                Lanjut ke Checkout
                <ArrowRight size={19} />
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-[#9A8974]">
                Harga dan stok akan diperiksa kembali
                sebelum pesanan dibuat.
              </p>
            </div>

            <div className="rounded-[24px] bg-[#FFF0BF] p-5">
              <div className="flex items-start gap-3">
                <Leaf
                  size={24}
                  className="shrink-0 text-[#47763A]"
                />

                <div>
                  <h3 className="font-black">
                    Belanja dengan Manfaat
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-[#74695B]">
                    Dukung pemanfaatan sampah organik
                    menjadi produk yang lebih berguna.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#EFE5D4] bg-white p-4">
                <ShieldCheck
                  size={23}
                  className="text-[#47763A]"
                />

                <p className="mt-3 text-xs font-black">
                  Belanja Terarah
                </p>
              </div>

              <div className="rounded-2xl border border-[#EFE5D4] bg-white p-4">
                <Truck
                  size={23}
                  className="text-[#47763A]"
                />

                <p className="mt-3 text-xs font-black">
                  Pantau Pesanan
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}

      <footer className="border-t border-[#EDE5D6] pt-6 text-center text-xs text-[#9A8974]">
        PUTARASA — Dari Dapur, Untuk Bumi
      </footer>
    </main>
  );
}
