
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import OrdersWorkspace from "@/components/buyer/OrdersWorkspace";

export default async function BuyerOrdersPage() {
  await requireRole("buyer");

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="mx-auto max-w-[1500px] px-5 py-10">
        <div className="rounded-2xl bg-white p-6">
          Silakan login kembali untuk melihat pesanan.
        </div>
      </main>
    );
  }

  const { data: orders, error } = await supabase
    .from("putarasa_orders")
    .select(
      `
      id,
      order_code,
      customer_name,
      status,
      payment_status,
      total_amount,
      created_at,
      putarasa_order_items (
        id,
        product_name,
        quantity,
        subtotal
      )
      `
    )
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto max-w-[1500px] px-5 py-10">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-xl font-black text-red-800">
            Gagal Memuat Pesanan
          </h1>
          <p className="mt-2 text-sm text-red-700">
            {error.message}
          </p>
        </div>
      </main>
    );
  }

  const formattedOrders = (orders ?? []).map((order) => {
    const items = order.putarasa_order_items ?? [];

    return {
      id: order.id,
      order_code: order.order_code,
      customer_name: order.customer_name,
      status: order.status,
      payment_status: order.payment_status,
      total_amount: Number(order.total_amount ?? 0),
      created_at: order.created_at,
      items: items.map((item) => ({
        id: item.id,
        product_name: item.product_name,
        quantity: Number(item.quantity ?? 0),
        subtotal: Number(item.subtotal ?? 0),
      })),
    };
  });

  return <OrdersWorkspace orders={formattedOrders} />;
}
