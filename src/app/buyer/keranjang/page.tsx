
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import CartWorkspace from "@/components/buyer/CartWorkspace";

export default async function BuyerCartPage() {
  await requireRole("buyer");

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="mx-auto max-w-[1500px] px-5 py-10">
        <p className="rounded-2xl bg-white p-6">
          Silakan login kembali untuk melihat keranjang.
        </p>
      </main>
    );
  }

  const { data: cartItems, error: cartError } =
    await supabase
      .from("putarasa_cart_items")
      .select("id,product_id,quantity,created_at")
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false });

  if (cartError) {
    return (
      <main className="mx-auto max-w-[1500px] px-5 py-10">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-xl font-black text-red-800">
            Gagal Memuat Keranjang
          </h1>
          <p className="mt-2 text-sm text-red-700">
            {cartError.message}
          </p>
        </div>
      </main>
    );
  }

  const rows = cartItems ?? [];
  const productIds = rows.map((item) => item.product_id);

  if (productIds.length === 0) {
    return <CartWorkspace initialItems={[]} />;
  }

  const [productsResult, inventoryResult] =
    await Promise.all([
      supabase
        .from("putarasa_products")
        .select(
          "id,name,sku,category,price,unit,image_url,is_active"
        )
        .in("id", productIds),

      supabase
        .from("putarasa_inventory")
        .select("product_id,quantity")
        .in("product_id", productIds),
    ]);

  if (productsResult.error || inventoryResult.error) {
    return (
      <main className="mx-auto max-w-[1500px] px-5 py-10">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          Gagal mengambil informasi produk atau stok.
        </div>
      </main>
    );
  }

  const productMap = new Map(
    (productsResult.data ?? []).map((product) => [
      product.id,
      product,
    ])
  );

  const stockMap = new Map(
    (inventoryResult.data ?? []).map((item) => [
      item.product_id,
      Number(item.quantity ?? 0),
    ])
  );

  const items = rows.map((row) => {
    const product = productMap.get(row.product_id);

    return {
      id: row.id,
      product_id: row.product_id,
      quantity: Number(row.quantity ?? 1),
      name: product?.name ?? "Produk Tidak Tersedia",
      sku: product?.sku ?? "-",
      category: product?.category ?? "other",
      price: Number(product?.price ?? 0),
      unit: product?.unit ?? "unit",
      image_url: product?.image_url ?? null,
      is_active: Boolean(product?.is_active),
      stock: stockMap.get(row.product_id) ?? 0,
    };
  });

  return <CartWorkspace initialItems={items} />;
}
