
import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import PaymentWorkspace from
  "@/components/admin/PaymentWorkspace";

export default async function PembayaranPage() {
  await requireRole("admin");

  const supabase = await createClient();

  const [ordersResult, paymentsResult, eventsResult] =
    await Promise.all([
      supabase
        .from("putarasa_orders")
        .select(
          "id,order_code,customer_name,status,payment_status,total_amount,created_at"
        )
        .order("created_at", { ascending: false }),

      supabase
        .from("putarasa_payments")
        .select(
          "id,order_id,amount,payment_method,reference_number,sender_name,payment_date,status,notes,rejection_reason,verified_at,created_at"
        )
        .order("created_at", { ascending: false }),

      supabase
        .from("putarasa_payment_events")
        .select("id,payment_id,event_type,notes,created_at")
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

  const error =
    ordersResult.error ||
    paymentsResult.error ||
    eventsResult.error;

  if (error) {
    return (
      <main className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        <h1 className="text-xl font-bold">
          Gagal memuat pembayaran
        </h1>
        <p className="mt-2 text-sm">{error.message}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-8 px-5 py-8 text-[#332417] sm:px-8 lg:px-10">
      <header className="space-y-6">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#47763A] hover:opacity-75"
        >
          <ArrowLeft size={18} />
          Kembali ke Dashboard
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-2xl bg-[#FFDA57]">
            <CreditCard size={30} />
          </div>

          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Manajemen Pembayaran
            </h1>
            <p className="mt-1 text-sm leading-6 text-[#8C7A65]">
              Catat transfer, verifikasi pembayaran, dan
              pantau transaksi pelanggan PUTARASA.
            </p>
          </div>
        </div>
      </header>

      <PaymentWorkspace
        orders={(ordersResult.data ?? []).map((item) => ({
          ...item,
          total_amount: Number(item.total_amount),
        }))}
        payments={(paymentsResult.data ?? []).map((item) => ({
          ...item,
          amount: Number(item.amount),
        }))}
        events={eventsResult.data ?? []}
      />
    </main>
  );
}
