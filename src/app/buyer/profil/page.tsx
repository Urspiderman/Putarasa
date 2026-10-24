
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import BuyerProfileWorkspace from "@/components/buyer/BuyerProfileWorkspace";

export default async function BuyerProfilePage() {
  await requireRole("buyer");

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="mx-auto max-w-[1500px] px-5 py-10">
        Silakan login kembali.
      </main>
    );
  }

  const [profileResult, ordersResult] =
    await Promise.all([
      supabase
        .from("putarasa_buyer_profiles")
        .select("full_name,phone,default_address")
        .eq("user_id", user.id)
        .maybeSingle(),

      supabase
        .from("putarasa_orders")
        .select("id,status,total_amount")
        .eq("buyer_id", user.id),
    ]);

  const profile = profileResult.data;

  const orders = ordersResult.data ?? [];

  const totalOrders = orders.length;

  const completedOrders = orders.filter(
    (order) => order.status === "completed"
  ).length;

  const activeOrders = orders.filter((order) =>
    ["pending", "processing", "shipped"].includes(
      order.status
    )
  ).length;

  const totalSpent = orders
    .filter(
      (order) => order.status === "completed"
    )
    .reduce(
      (total, order) =>
        total + Number(order.total_amount ?? 0),
      0
    );

  const metadataName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : "";

  return (
    <BuyerProfileWorkspace
      email={user.email ?? ""}
      initialName={
        profile?.full_name || metadataName
      }
      initialPhone={profile?.phone ?? ""}
      initialAddress={profile?.default_address ?? ""}
      joinedAt={user.created_at}
      stats={{
        totalOrders,
        completedOrders,
        activeOrders,
        totalSpent,
      }}
    />
  );
}
