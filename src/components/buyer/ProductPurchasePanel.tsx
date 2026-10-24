
"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";

import { addToCart } from "@/app/buyer/marketplace/[id]/actions";

type Props = {
  productId: string;
  price: number;
  unit: string;
  stock: number;
};

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function ProductPurchasePanel({
  productId,
  price,
  unit,
  stock,
}: Props) {
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();

  const [feedback, setFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const maxQuantity = Math.max(0, Math.floor(stock));
  const isAvailable = maxQuantity >= 1;
  const subtotal = quantity * price;

  function changeQuantity(next: number) {
    setQuantity(
      Math.min(Math.max(1, next), maxQuantity || 1)
    );
    setFeedback(null);
  }

  function handleAddToCart() {
    if (!isAvailable || isPending) return;

    setFeedback(null);

    startTransition(async () => {
      const result = await addToCart(
        productId,
        quantity
      );

      setFeedback(result);
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black">
            Atur Jumlah Pembelian
          </h2>
          <p className="mt-1 text-sm text-[#8C7A65]">
            Stok tersedia:{" "}
            <span className="font-extrabold text-[#47763A]">
              {stock} {unit}
            </span>
          </p>
        </div>

        <div className="inline-flex items-center rounded-2xl border border-[#E8DFD0] bg-[#FFFBF1] p-1">
          <button
            type="button"
            onClick={() =>
              changeQuantity(quantity - 1)
            }
            disabled={
              !isAvailable ||
              quantity <= 1 ||
              isPending
            }
            aria-label="Kurangi jumlah"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#47763A] disabled:opacity-40"
          >
            <Minus size={18} />
          </button>

          <span className="w-14 text-center text-lg font-black">
            {quantity}
          </span>

          <button
            type="button"
            onClick={() =>
              changeQuantity(quantity + 1)
            }
            disabled={
              !isAvailable ||
              quantity >= maxQuantity ||
              isPending
            }
            aria-label="Tambah jumlah"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#47763A] disabled:opacity-40"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#F0F7E9] p-5">
        <div>
          <p className="text-sm font-bold text-[#74695B]">
            Subtotal
          </p>
          <p className="mt-1 text-xs text-[#8C7A65]">
            {quantity} × {rupiah(price)}
          </p>
        </div>

        <p className="text-xl font-black text-[#47763A] sm:text-2xl">
          {rupiah(subtotal)}
        </p>
      </div>

      {feedback && (
        <div
          role="status"
          className={`rounded-2xl border p-4 text-sm font-semibold ${
            feedback.success
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.success && (
              <CheckCircle2 size={19} />
            )}
            {feedback.message}
          </div>

          {feedback.success && (
            <Link
              href="/buyer/keranjang"
              className="mt-3 inline-flex items-center gap-2 font-black underline"
            >
              Lihat Keranjang
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!isAvailable || isPending}
        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#47763A] px-6 py-4 text-sm font-black text-white shadow-md transition hover:bg-[#315F2E] disabled:cursor-not-allowed disabled:bg-[#A8B5A1]"
      >
        <ShoppingCart size={21} />
        {isPending
          ? "Menambahkan..."
          : !isAvailable
            ? "Stok Habis"
            : "Tambah ke Keranjang"}
        <ArrowRight size={18} />
      </button>

      <Link
        href="/buyer/keranjang"
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#47763A] px-6 py-3.5 text-sm font-extrabold text-[#47763A] transition hover:bg-[#F0F7E9]"
      >
        Lihat Keranjang Saya
      </Link>

      <p className="text-center text-xs leading-5 text-[#9A8974]">
        Stok diperiksa kembali saat produk dimasukkan
        ke keranjang. Harga dan ketersediaan dapat
        berubah sebelum checkout.
      </p>
    </div>
  );
}
