
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import CheckoutWorkspace from "@/components/supplier/CheckoutWorkspace";

export default async function SupplierCheckoutPage() {
  await requireRole("supplier");

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="mx-auto max-w-[1500px] px-5 py-10">
        <div className="rounded-2xl bg-white p-6">
          Silakan login kembali untuk melanjutkan checkout.
        </div>
      </main>
    );
  }

  const { data: cart, error: cartError } =
    await supabase
      .from("putarasa_cart_items")
      .select("id,product_id,quantity")
      .eq("buyer_id", user.id);

  if (cartError) {
    return (
      <main className="mx-auto max-w-[1500px] px-5 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          Gagal mengambil keranjang: {cartError.message}
        </div>
      </main>
    );
  }

  const metadataName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : "";

  const defaultName = metadataName.trim();
  const defaultPhone = "";
  const defaultAddress = "";

  const rows = cart ?? [];

  const productIds = rows.map(
    (item) => item.product_id
  );

  if (productIds.length === 0) {
    return (
      <CheckoutWorkspace
        initialItems={[]}
        defaultName={defaultName}
        defaultPhone={defaultPhone}
        defaultAddress={defaultAddress}
      />
    );
  }

  const [productsResult, inventoryResult] =
    await Promise.all([
      supabase
        .from("putarasa_products")
        .select(
          "id,name,price,unit,image_url,is_active"
        )
        .in("id", productIds),

      supabase
        .from("putarasa_inventory")
        .select("product_id,quantity")
        .in("product_id", productIds),
    ]);

  if (
    productsResult.error ||
    inventoryResult.error
  ) {
    return (
      <main className="mx-auto max-w-[1500px] px-5 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          <h1 className="text-xl font-black">
            Gagal Memuat Checkout
          </h1>

          <p className="mt-2 text-sm">
            {productsResult.error?.message ||
              inventoryResult.error?.message ||
              "Terjadi kesalahan saat mengambil data produk."}
          </p>
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
      cartItemId: row.id,
      productId: row.product_id,
      name: product?.name ?? "Produk Tidak Tersedia",
      price: Number(product?.price ?? 0),
      quantity: Number(row.quantity ?? 0),
      unit: product?.unit ?? "unit",
      imageUrl: product?.image_url ?? null,
      isActive: Boolean(product?.is_active),
      stock: stockMap.get(row.product_id) ?? 0,
    };
  });

  return (
    <CheckoutWorkspace
      initialItems={items}
      defaultName={defaultName}
      defaultPhone={defaultPhone}
      defaultAddress={defaultAddress}
    />
  );
}
