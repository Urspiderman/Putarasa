
import Link from "next/link";
import { ArrowLeft, ShoppingCart } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import OrderWorkspace from "@/components/admin/OrderWorkspace";

export default async function PesananPage() {
  await requireRole("admin");

  const supabase = await createClient();

  const [ordersResult, itemsResult, couriersResult] =
    await Promise.all([
      supabase
        .from("putarasa_orders")
        .select(
          "id,order_code,buyer_id,customer_name,customer_phone,shipping_address,status,payment_status,total_amount,notes,created_at,courier_id,delivery_latitude,delivery_longitude,assigned_at,delivered_at"
        )
        .order("created_at", { ascending: false }),

      supabase
        .from("putarasa_order_items")
        .select(
          "id,order_id,product_id,product_name,quantity,unit_price,subtotal"
        ),

      supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "courier"),
    ]);

  const error =
    ordersResult.error ||
    itemsResult.error ||
    couriersResult.error;

  if (error) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          <h1 className="text-xl font-black">
            Gagal memuat pesanan
          </h1>
          <p className="mt-2 text-sm">{error.message}</p>
        </div>
      </main>
    );
  }

  const courierIds = (couriersResult.data ?? []).map(
    (courier) => courier.user_id
  );

  const profilesResult = courierIds.length
    ? await supabase
        .from("profiles")
        .select("id,full_name")
        .in("id", courierIds)
    : null;

  if (profilesResult?.error) {
    return (
      <main className="p-6 text-red-700">
        Gagal memuat nama Kurir:{" "}
        {profilesResult.error.message}
      </main>
    );
  }

  const names = new Map(
    (profilesResult?.data ?? []).map((profile) => [
      profile.id,
      profile.full_name,
    ])
  );

  const couriers = courierIds.map((id) => ({
    id,
    name: names.get(id) || "Kurir PUTARASA",
  }));

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
            <ShoppingCart size={30} />
          </div>

          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Manajemen Pesanan
            </h1>
            <p className="mt-1 text-sm leading-6 text-[#8C7A65]">
              Kelola pesanan Buyer dan Supplier, pembayaran,
              penugasan Kurir, dan pengantaran PUTARASA.
            </p>
          </div>
        </div>
      </header>

      <OrderWorkspace
        orders={(ordersResult.data ?? []).map((order) => ({
          ...order,
          total_amount: Number(order.total_amount ?? 0),
        }))}
        items={(itemsResult.data ?? []).map((item) => ({
          ...item,
          quantity: Number(item.quantity ?? 0),
          unit_price: Number(item.unit_price ?? 0),
          subtotal: Number(item.subtotal ?? 0),
        }))}
        couriers={couriers}
      />
    </main>
  );
}
