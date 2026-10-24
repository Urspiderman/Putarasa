
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Leaf,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  Truck,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import ProductPurchasePanel from "@/components/buyer/ProductPurchasePanel";

type Props = {
  params: Promise<{ id: string }>;
};

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

function categoryLabel(value: string) {
  if (value === "compost") return "Pupuk Kompos";
  if (value === "maggot") return "Produk Maggot";
  return "Produk Lainnya";
}

export default async function ProductDetailPage({
  params,
}: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("putarasa_products")
    .select(
      "id,name,sku,category,description,price,unit,image_url,is_active"
    )
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !product) {
    notFound();
  }

  const [stockResult, relatedResult] = await Promise.all([
    supabase
      .from("putarasa_inventory")
      .select("quantity")
      .eq("product_id", product.id)
      .maybeSingle(),

    supabase
      .from("putarasa_products")
      .select(
        "id,name,category,price,unit,image_url"
      )
      .eq("is_active", true)
      .eq("category", product.category)
      .neq("id", product.id)
      .limit(4),
  ]);

  const stock = Math.max(
    0,
    Number(stockResult.data?.quantity ?? 0)
  );

  const relatedProducts = relatedResult.data ?? [];

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-8 px-4 pb-16 pt-6 text-[#332417] sm:px-6 lg:px-8">
      {/* BREADCRUMB */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/buyer/marketplace"
          className="inline-flex items-center gap-2 font-bold text-[#47763A] hover:underline"
        >
          <ArrowLeft size={17} />
          Kembali ke Marketplace
        </Link>
        <span className="text-[#B7A995]">/</span>
        <span className="text-[#8C7A65]">
          {categoryLabel(product.category)}
        </span>
        <span className="text-[#B7A995]">/</span>
        <span className="font-bold">
          {product.name}
        </span>
      </div>

      {/* DETAIL PRODUK */}
      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* FOTO */}
        <div className="overflow-hidden rounded-[30px] border border-[#EEE4D3] bg-white p-4 shadow-sm">
          <div className="relative flex min-h-[350px] items-center justify-center overflow-hidden rounded-[24px] bg-[#EAF3DF] sm:min-h-[480px]">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full max-h-[520px] w-full object-contain"
              />
            ) : (
              <Sprout
                size={150}
                strokeWidth={1.1}
                className="text-[#47763A]"
              />
            )}

            <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-[#47763A] shadow-sm">
              <Leaf size={15} />
              PRODUK PUTARASA
            </span>
          </div>
        </div>

        {/* INFORMASI DAN PEMBELIAN */}
        <div className="flex flex-col rounded-[30px] border border-[#EEE4D3] bg-white p-6 shadow-sm sm:p-9">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#EAF3DF] px-4 py-2 text-xs font-extrabold text-[#47763A]">
              <BadgeCheck size={15} />
              {categoryLabel(product.category)}
            </span>

            <span
              className={`rounded-full px-4 py-2 text-xs font-extrabold ${
                stock > 0
                  ? "bg-[#EAF3DF] text-[#47763A]"
                  : "bg-[#FFF0BF] text-[#775B15]"
              }`}
            >
              {stock > 0 ? "Stok Tersedia" : "Stok Habis"}
            </span>
          </div>

          <h1 className="mt-6 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            {product.name}
          </h1>

          <p className="mt-3 text-sm text-[#8C7A65]">
            SKU: {product.sku}
          </p>

          <div className="mt-6 rounded-2xl bg-[#FFF9E9] p-5">
            <p className="text-sm font-bold text-[#74695B]">
              Harga Produk
            </p>

            <p className="mt-2 text-3xl font-black text-[#47763A]">
              {rupiah(Number(product.price ?? 0))}
            </p>

            <p className="mt-1 text-sm text-[#8C7A65]">
              per {product.unit}
            </p>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-black">
              Deskripsi Produk
            </h2>

            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#74695B]">
              {product.description ||
                "Produk hasil pengolahan sampah organik PUTARASA."}
            </p>
          </div>

          <div className="mt-6 border-t border-[#F0E7D9] pt-6">
            <ProductPurchasePanel
              productId={product.id}
              price={Number(product.price ?? 0)}
              unit={product.unit}
              stock={stock}
            />
          </div>
        </div>
      </section>

      {/* INFORMASI TAMBAHAN */}
      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: Leaf,
            title: "Pemanfaatan Organik",
            desc: "Produk dari pengolahan sampah organik.",
          },
          {
            icon: ShieldCheck,
            title: "Informasi Produk",
            desc: "Harga dan stok ditampilkan dari sistem.",
          },
          {
            icon: Truck,
            title: "Pantau Pesanan",
            desc: "Kelola pembelian melalui akun Buyer.",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex items-center gap-4 rounded-[22px] border border-[#EEE4D3] bg-white p-5"
            >
              <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3DF] p-3">
                <Icon size={24} className="text-[#47763A]" />
              </div>
              <div>
                <h3 className="font-black">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs leading-5 text-[#8C7A65]">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* PRODUK TERKAIT */}
      {relatedProducts.length > 0 && (
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[#47763A]">
                Rekomendasi
              </p>
              <h2 className="mt-1 text-2xl font-black">
                Produk Serupa
              </h2>
              <p className="mt-1 text-sm text-[#8C7A65]">
                Temukan produk lain dari kategori yang sama.
              </p>
            </div>

            <Link
              href="/buyer/marketplace"
              className="inline-flex items-center gap-2 text-sm font-extrabold text-[#47763A]"
            >
              Lihat Semua
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <Link
                key={item.id}
                href={`/buyer/marketplace/${item.id}`}
                className="group overflow-hidden rounded-[24px] border border-[#EEE4D3] bg-white p-2 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-44 items-center justify-center overflow-hidden rounded-[18px] bg-[#EAF3DF]">
                  {item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <Package
                      size={65}
                      className="text-[#47763A]"
                    />
                  )}
                </div>

                <div className="p-3">
                  <p className="text-xs font-bold text-[#47763A]">
                    {categoryLabel(item.category)}
                  </p>
                  <h3 className="mt-2 line-clamp-2 min-h-12 font-black">
                    {item.name}
                  </h3>
                  <p className="mt-3 font-black text-[#47763A]">
                    {rupiah(Number(item.price ?? 0))}
                  </p>
                  <p className="text-xs text-[#8C7A65]">
                    per {item.unit}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="flex flex-col items-start justify-between gap-5 rounded-[26px] bg-[#FFF0BF] p-7 sm:flex-row sm:items-center sm:p-9">
        <div>
          <p className="mb-2 text-sm font-extrabold text-[#47763A]">
            PUTARASA Marketplace
          </p>
          <h2 className="text-2xl font-black">
            Masih Ingin Melihat Produk Lain?
          </h2>
          <p className="mt-2 text-sm text-[#74695B]">
            Jelajahi pilihan produk lainnya di Marketplace.
          </p>
        </div>

        <Link
          href="/buyer/marketplace"
          className="inline-flex items-center gap-2 rounded-xl bg-[#47763A] px-6 py-3.5 text-sm font-extrabold text-white"
        >
          <ShoppingBag size={18} />
          Kembali Belanja
          <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}
