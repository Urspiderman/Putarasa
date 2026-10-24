
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import CheckoutWorkspace from "@/components/buyer/CheckoutWorkspace";

export default async function BuyerCheckoutPage() {
  await requireRole("buyer");

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

  // Ambil profil Buyer, keranjang, dan data pengguna.
  const [profileResult, cartResult] = await Promise.all([
    supabase
      .from("putarasa_buyer_profiles")
      .select("full_name,phone,default_address")
      .eq("user_id", user.id)
      .maybeSingle(),

    supabase
      .from("putarasa_cart_items")
      .select("id,product_id,quantity")
      .eq("buyer_id", user.id),
  ]);

  if (profileResult.error) {
    return (
      <main className="mx-auto max-w-[1500px] px-5 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          Gagal mengambil profil Buyer:{" "}
          {profileResult.error.message}
        </div>
      </main>
    );
  }

  if (cartResult.error) {
    return (
      <main className="mx-auto max-w-[1500px] px-5 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          Gagal mengambil keranjang:{" "}
          {cartResult.error.message}
        </div>
      </main>
    );
  }

  const buyerProfile = profileResult.data;
  const cart = cartResult.data ?? [];

  // Data default dari profil Buyer.
  const metadataName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : "";

  const defaultName =
    buyerProfile?.full_name?.trim() ||
    metadataName ||
    "";

  const defaultPhone =
    buyerProfile?.phone?.trim() || "";

  const defaultAddress =
    buyerProfile?.default_address?.trim() || "";

  const productIds = cart.map((item) => item.product_id);

  // Keranjang kosong: tetap tampilkan halaman Checkout.
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

  // Ambil data produk dan stok terbaru.
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

  if (productsResult.error || inventoryResult.error) {
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

  const items = cart.map((row) => {
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
