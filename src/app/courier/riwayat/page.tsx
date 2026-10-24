
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import CourierHistoryWorkspace, {
  type CourierHistoryItem,
} from "@/components/courier/CourierHistoryWorkspace";

type PickupRow = {
  id: string;
  category: string | null;
  estimated_kg: number | string | null;
  actual_kg: number | string | null;
  address: string | null;
  scheduled_at: string | null;
  status: string;
};

type DeliveryRow = {
  id: string;
  order_code: string | null;
  customer_name: string | null;
  shipping_address: string | null;
  total_amount: number | string | null;
  created_at: string | null;
  delivered_at: string | null;
  status: string;
};

export default async function CourierHistoryPage() {
  const { user } = await requireRole("courier");
  const supabase = await createClient();

  const [pickupsResult, deliveriesResult] =
    await Promise.all([
      supabase
        .from("pickups")
        .select(
          "id,category,estimated_kg,actual_kg,address,scheduled_at,status"
        )
        .eq("courier_id", user.id)
        .in("status", ["completed", "picked_up"])
        .order("scheduled_at", {
          ascending: false,
        }),

      supabase
        .from("putarasa_orders")
        .select(
          "id,order_code,customer_name,shipping_address,total_amount,created_at,delivered_at,status"
        )
        .eq("courier_id", user.id)
        .eq("status", "completed")
        .order("created_at", {
          ascending: false,
        }),
    ]);

  const pickups = (pickupsResult.data ??
    []) as PickupRow[];

  const deliveries = (deliveriesResult.data ??
    []) as DeliveryRow[];

  const pickupHistory: CourierHistoryItem[] =
    pickups.map((pickup) => ({
      id: `pickup-${pickup.id}`,
      type: "pickup",
      title: "Penjemputan Sampah Organik",
      reference: pickup.id.slice(0, 8).toUpperCase(),
      person: pickup.category ?? "Sampah Organik",
      address: pickup.address ?? "Alamat belum tersedia",
      date: pickup.scheduled_at,
      status: pickup.status,
      weightKg: Number(
        pickup.actual_kg ?? pickup.estimated_kg ?? 0
      ),
      amount: null,
    }));

  const deliveryHistory: CourierHistoryItem[] =
    deliveries.map((delivery) => ({
      id: `delivery-${delivery.id}`,
      type: "delivery",
      title: "Pengantaran Produk Marketplace",
      reference:
        delivery.order_code ??
        delivery.id.slice(0, 8).toUpperCase(),
      person:
        delivery.customer_name ?? "Pelanggan PUTARASA",
      address:
        delivery.shipping_address ??
        "Alamat belum tersedia",
      date:
        delivery.delivered_at ?? delivery.created_at,
      status: delivery.status,
      weightKg: null,
      amount: Number(delivery.total_amount ?? 0),
    }));

  const history = [
    ...pickupHistory,
    ...deliveryHistory,
  ].sort((a, b) => {
    const timeA = a.date
      ? new Date(a.date).getTime()
      : 0;

    const timeB = b.date
      ? new Date(b.date).getTime()
      : 0;

    return timeB - timeA;
  });

  const errors = [
    pickupsResult.error?.message,
    deliveriesResult.error?.message,
  ].filter((message): message is string =>
    Boolean(message)
  );

  return (
    <CourierHistoryWorkspace
      history={history}
      errorMessage={
        errors.length > 0
          ? errors.join(" | ")
          : null
      }
    />
  );
}
