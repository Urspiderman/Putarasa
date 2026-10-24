
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Package,
  ShoppingBag,
} from "lucide-react";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
};

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default async function OrderDetailPage({
  params,
}: Props) {
  await requireRole("buyer");

  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: order } = await supabase
    .from("putarasa_orders")
    .select(
      "id,order_code,customer_name,customer_phone,shipping_address,status,payment_status,total_amount,notes,created_at"
    )
    .eq("id", id)
    .eq("buyer_id", user.id)
    .maybeSingle();

  if (!order) notFound();

  const { data: items } = await supabase
    .from("putarasa_order_items")
    .select(
      "id,product_name,quantity,unit_price,subtotal"
    )
    .eq("order_id", order.id);

  return (
    <main className="mx-auto max-w-[1000px] space-y-6 px-4 pb-16 pt-8 text-[#332417] sm:px-6">
      <section className="rounded-[30px] border border-[#EEE4D3] bg-white p-7 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#EAF3DF]">
          <CheckCircle2
            size={52}
            className="text-[#47763A]"
          />
        </div>

        <h1 className="mt-6 text-3xl font-black">
          Pesanan Berhasil Dibuat!
        </h1>

        <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[#8C7A65]">
          Terima kasih telah berbelanja di PUTARASA.
          Pesananmu sudah tercatat dan menunggu
          proses selanjutnya.
        </p>

        <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-[#FFF0BF] p-5">
          <p className="text-xs font-bold text-[#74695B]">
            Nomor Pesanan
          </p>
          <p className="mt-2 break-all text-xl font-black text-[#47763A]">
            {order.order_code}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF0BF] px-4 py-2 text-xs font-black text-[#775B15]">
            <Clock3 size={15} />
            Status: {order.status}
          </span>

          <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF0BF] px-4 py-2 text-xs font-black text-[#775B15]">
            Pembayaran: {order.payment_status}
          </span>
        </div>
      </section>

      <section className="rounded-[26px] border border-[#EEE4D3] bg-white p-6 sm:p-8">
        <h2 className="flex items-center gap-3 text-xl font-black">
          <Package
            size={24}
            className="text-[#47763A]"
          />
          Detail Pesanan
        </h2>

        <div className="mt-6 space-y-4">
          {(items ?? []).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 border-b border-[#F2EADF] pb-4"
            >
              <div>
                <p className="font-black">
                  {item.product_name}
                </p>
                <p className="mt-1 text-xs text-[#8C7A65]">
                  {item.quantity} ×{" "}
                  {rupiah(Number(item.unit_price))}
                </p>
              </div>

              <p className="font-black text-[#47763A]">
                {rupiah(Number(item.subtotal))}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-[#F0F7E9] p-5">
          <span className="font-black">
            Total Produk
          </span>
          <span className="text-2xl font-black text-[#47763A]">
            {rupiah(Number(order.total_amount))}
          </span>
        </div>

        <p className="mt-3 text-xs text-[#8C7A65]">
          Total ini belum mencakup ongkos kirim.
          Status pembayaran masih mengikuti
          proses pembayaran PUTARASA.
        </p>
      </section>

      <section className="rounded-[26px] border border-[#EEE4D3] bg-white p-6 sm:p-8">
        <h2 className="text-xl font-black">
          Informasi Pengiriman
        </h2>

        <div className="mt-5 space-y-3 text-sm leading-6">
          <p>
            <strong>Penerima:</strong>{" "}
            {order.customer_name}
          </p>
          <p>
            <strong>Telepon:</strong>{" "}
            {order.customer_phone}
          </p>
          <p>
            <strong>Alamat:</strong>{" "}
            {order.shipping_address}
          </p>

          {order.notes && (
            <p>
              <strong>Catatan:</strong>{" "}
              {order.notes}
            </p>
          )}
        </div>
      </section>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/buyer/pesanan"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#47763A] px-6 py-4 text-sm font-black text-white"
        >
          <Package size={18} />
          Pesanan Saya
          <ArrowRight size={18} />
        </Link>

        <Link
          href="/buyer/marketplace"
          className="inline-flex items-center gap-2 rounded-2xl border border-[#47763A] bg-white px-6 py-4 text-sm font-black text-[#47763A]"
        >
          <ShoppingBag size={18} />
          Belanja Lagi
        </Link>
      </div>
    </main>
  );
}
