
"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  CheckCircle2,
  Minus,
  Plus,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";

import { addToSupplierCart } from "@/app/supplier/marketplace/[id]/actions";

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

  const available = stock > 0;

  function handleAddToCart() {
    if (!available || isPending) return;

    setFeedback(null);

    startTransition(async () => {
      const result = await addToSupplierCart(
        productId,
        quantity
      );

      setFeedback(result);
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-black text-[#332417]">
          Jumlah Pembelian
        </h2>

        <p className="mt-1 text-sm text-[#8C7A65]">
          Stok tersedia: {stock} {unit}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-[#E8DFD0] bg-[#FFFBF1] p-2">
          <button
            type="button"
            onClick={() =>
              setQuantity((value) =>
                Math.max(1, value - 1)
              )
            }
            disabled={quantity <= 1 || isPending}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#47763A] disabled:opacity-40"
            aria-label="Kurangi jumlah"
          >
            <Minus size={20} />
          </button>

          <span className="min-w-10 text-center text-lg font-black">
            {quantity}
          </span>

          <button
            type="button"
            onClick={() =>
              setQuantity((value) =>
                Math.min(
                  Math.min(stock, 1000),
                  value + 1
                )
              )
            }
            disabled={
              !available ||
              quantity >= Math.min(stock, 1000) ||
              isPending
            }
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#47763A] disabled:opacity-40"
            aria-label="Tambah jumlah"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="text-right">
          <p className="text-xs text-[#8C7A65]">
            Total Harga
          </p>

          <p className="text-2xl font-black text-[#47763A]">
            {rupiah(price * quantity)}
          </p>
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className={`rounded-2xl p-4 text-sm font-semibold ${
            feedback.success
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-700"
          }`}
        >
          {feedback.success && (
            <CheckCircle2
              size={18}
              className="mr-2 inline-block"
            />
          )}
          {feedback.message}
        </div>
      )}

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!available || isPending}
        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#47763A] px-6 py-4 text-sm font-black text-white transition hover:bg-[#315F2E] disabled:cursor-not-allowed disabled:bg-[#A8B5A1]"
      >
        <ShoppingCart size={20} />
        {isPending
          ? "Menambahkan..."
          : available
            ? "Tambah ke Keranjang"
            : "Stok Habis"}
      </button>

      <Link
        href="/supplier/keranjang"
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FFDA57] px-6 py-4 text-sm font-black text-[#332417] transition hover:bg-[#FFE585]"
      >
        Lihat Keranjang
        <ArrowRight size={19} />
      </Link>
    </div>
  );
}
