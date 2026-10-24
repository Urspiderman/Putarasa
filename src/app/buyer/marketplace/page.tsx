
import { createClient } from "@/lib/supabase/server";
import MarketplaceWorkspace from "@/components/buyer/MarketplaceWorkspace";

export default async function MarketplacePage() {
  const supabase = await createClient();

  const [productsResult, inventoryResult] = await Promise.all([
    supabase
      .from("putarasa_products")
      .select(
        "id,name,sku,category,description,price,unit,image_url,is_active,created_at"
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false }),

    supabase
      .from("putarasa_inventory")
      .select("product_id,quantity"),
  ]);

  if (productsResult.error || inventoryResult.error) {
    return (
      <main className="mx-auto max-w-[1500px] px-5 py-10 sm:px-8 lg:px-10">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          <h1 className="text-xl font-black">
            Gagal Memuat Marketplace
          </h1>
          <p className="mt-2 text-sm">
            {productsResult.error?.message ??
              inventoryResult.error?.message}
          </p>
          <p className="mt-3 text-xs">
            Periksa izin baca tabel produk dan inventori
            di Supabase.
          </p>
        </div>
      </main>
    );
  }

  const stockMap = new Map(
    (inventoryResult.data ?? []).map((item) => [
      item.product_id,
      Number(item.quantity ?? 0),
    ])
  );

  const products = (productsResult.data ?? []).map(
    (product) => ({
      ...product,
      price: Number(product.price ?? 0),
      stock: stockMap.get(product.id) ?? 0,
    })
  );

  return <MarketplaceWorkspace products={products} />;
}
