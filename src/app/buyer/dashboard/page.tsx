
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  CircleCheck,
  Globe2,
  Heart,
  Leaf,
  Package,
  Recycle,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sprout,
  Truck,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const categories = [
  {
    name: "Pupuk Kompos",
    desc: "Untuk tanah dan tanaman",
    href: "/buyer/marketplace?category=compost",
    icon: Sprout,
    bg: "bg-[#E7F0DB]",
    accent: "bg-[#47763A]",
  },
  {
    name: "Produk Maggot",
    desc: "Pakan dan produk budidaya",
    href: "/buyer/marketplace?category=maggot",
    icon: Recycle,
    bg: "bg-[#FFF0BF]",
    accent: "bg-[#E9B932]",
  },
  {
    name: "Produk Lainnya",
    desc: "Pilihan ramah lingkungan",
    href: "/buyer/marketplace?category=other",
    icon: Package,
    bg: "bg-[#F3E8D9]",
    accent: "bg-[#47763A]",
  },
];

const benefits = [
  {
    title: "Produk Ramah Lingkungan",
    desc: "Sampah organik diolah menjadi produk bernilai.",
    icon: Leaf,
  },
  {
    title: "Belanja Mudah",
    desc: "Temukan kebutuhan dan kelola pesanan.",
    icon: ShieldCheck,
  },
  {
    title: "Pantau Pengiriman",
    desc: "Ikuti status pesanan dari akunmu.",
    icon: Truck,
  },
  {
    title: "Ekonomi Sirkular",
    desc: "Dukung pemanfaatan kembali sampah organik.",
    icon: Globe2,
  },
];

export default async function BuyerDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [productsResult, inventoryResult] = await Promise.all([
    supabase
      .from("putarasa_products")
      .select(
        "id,name,description,category,price,unit,image_url,created_at"
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(8),

    supabase
      .from("putarasa_inventory")
      .select("product_id,quantity"),
  ]);

  const products = productsResult.data ?? [];

  const stockMap = new Map(
    (inventoryResult.data ?? []).map((item) => [
      item.product_id,
      Number(item.quantity ?? 0),
    ])
  );

  const name =
    typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim().split(" ")[0]
      : "Teman";

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-8 px-4 pb-16 pt-5 sm:px-6 lg:px-8">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-[30px] border border-[#F1E7D4] bg-[#FFF9E9] shadow-[0_10px_35px_rgba(94,70,30,0.07)]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#FFDA57]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-[#BBD49C]/25 blur-3xl" />

        <div className="relative grid min-h-[365px] items-center gap-7 px-6 py-9 sm:px-9 lg:grid-cols-[1.15fr_0.85fr] lg:px-12 lg:py-11">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF0BF] px-4 py-2 text-xs font-extrabold text-[#47763A]">
              <Leaf size={15} />
              Selamat datang, {name}!
            </span>

            <h1 className="mt-5 max-w-2xl text-3xl font-black leading-[1.15] tracking-tight text-[#47763A] sm:text-4xl lg:text-[46px]">
              Produk Baik,
              <span className="block text-[#332417]">
                untuk Bumi yang Lebih Baik.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-[#74695B] sm:text-base">
              Temukan produk hasil pengolahan sampah
              organik yang bermanfaat untuk rumah,
              tanaman, dan lingkungan.
            </p>

            <form
              action="/buyer/marketplace"
              method="get"
              className="mt-6 flex max-w-xl items-center gap-2 rounded-2xl border border-[#EEE3CE] bg-white p-1.5 shadow-sm"
            >
              <Search
                size={21}
                className="ml-3 shrink-0 text-[#47763A]"
              />

              <input
                name="q"
                type="search"
                aria-label="Cari produk"
                placeholder="Cari kompos, maggot, atau produk lainnya..."
                className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm outline-none placeholder:text-[#9A8974]"
              />

              <button
                type="submit"
                className="rounded-xl bg-[#47763A] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#315F2E]"
              >
                Cari
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-extrabold">
                Populer:
              </span>

              {[
                ["Kompos", "compost"],
                ["Maggot", "maggot"],
                ["Produk Lain", "other"],
              ].map(([label, category]) => (
                <Link
                  key={category}
                  href={`/buyer/marketplace?category=${category}`}
                  className="rounded-full bg-[#F5EDCF] px-3 py-1.5 text-xs font-semibold text-[#5B503E] transition hover:bg-[#FFDA57]"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* VISUAL HERO */}
          <div className="relative hidden min-h-[280px] items-center justify-center lg:flex">
            <div className="absolute right-1 top-1 h-60 w-60 rounded-full bg-[#DDEBCB]" />
            <div className="absolute bottom-1 left-10 h-48 w-48 rounded-full bg-[#FFDA57]/30" />

            <div className="relative flex h-[270px] w-[290px] items-center justify-center rounded-[40px] border border-[#E6D9BE] bg-gradient-to-br from-[#E6F1D8] via-[#F7E8C6] to-[#D7E7C3] shadow-xl">
              <div className="absolute left-5 top-5 rounded-2xl bg-white/80 p-3 text-[#47763A] shadow-sm">
                <Leaf size={27} />
              </div>

              <div className="flex h-44 w-44 items-center justify-center rounded-full bg-white/40">
                <Sprout
                  size={115}
                  strokeWidth={1.3}
                  className="text-[#47763A]"
                />
              </div>

              <div className="absolute -bottom-4 -right-5 max-w-[150px] rounded-2xl bg-[#FFDA57] px-4 py-3 text-center text-sm font-black text-[#332417] shadow-lg">
                Kurangi Sampah,
                <br />
                Tingkatkan Manfaat
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KEUNGGULAN */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {benefits.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex items-center gap-4 rounded-[22px] border border-[#F0E6D6] bg-white p-4 shadow-[0_5px_20px_rgba(88,68,38,0.05)]"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#F0F7E9]">
                <Icon size={27} className="text-[#47763A]" />
              </div>

              <div>
                <h3 className="text-sm font-black">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs leading-5 text-[#8C7A65]">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* KATEGORI */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#47763A]">
              Jelajahi
            </p>
            <h2 className="mt-1 text-2xl font-black">
              Kategori Produk
            </h2>
            <p className="mt-1 text-sm text-[#8C7A65]">
              Pilih kategori sesuai kebutuhanmu.
            </p>
          </div>

          <Link
            href="/buyer/marketplace"
            className="inline-flex items-center gap-2 text-sm font-extrabold text-[#47763A] hover:underline"
          >
            Lihat Semua Kategori
            <ArrowRight size={17} />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {categories.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex min-h-[155px] items-center justify-between overflow-hidden rounded-[24px] ${item.bg} p-6 transition hover:-translate-y-1 hover:shadow-lg`}
              >
                <div className="relative z-10 max-w-[60%]">
                  <h3 className="text-xl font-black leading-tight">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-sm leading-5 text-[#74695B]">
                    {item.desc}
                  </p>

                  <span
                    className={`mt-4 inline-flex h-9 w-9 items-center justify-center rounded-full ${item.accent} text-white transition group-hover:translate-x-1`}
                  >
                    <ArrowRight size={18} />
                  </span>
                </div>

                <div className="absolute -bottom-8 -right-5 flex h-44 w-44 items-center justify-center rounded-full bg-white/40">
                  <Icon
                    size={85}
                    strokeWidth={1.2}
                    className="text-[#47763A]"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* PRODUK */}
      <section id="produk" className="space-y-5 scroll-mt-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#47763A]">
              Pilihan PUTARASA
            </p>
            <h2 className="mt-1 text-2xl font-black">
              Produk Pilihan
            </h2>
            <p className="mt-1 text-sm text-[#8C7A65]">
              Produk terbaru yang bisa kamu jelajahi.
            </p>
          </div>

          <Link
            href="/buyer/marketplace"
            className="inline-flex items-center gap-2 text-sm font-extrabold text-[#47763A] hover:underline"
          >
            Lihat Semua Produk
            <ArrowRight size={17} />
          </Link>
        </div>

        {productsResult.error || inventoryResult.error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Gagal memuat produk. Periksa izin baca produk
            dan inventori pada Supabase.
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-[#EFE5D4] bg-white px-6 py-14 text-center">
            <ShoppingCart
              size={42}
              className="mx-auto text-[#47763A]"
            />
            <h3 className="mt-4 text-lg font-black">
              Belum Ada Produk
            </h3>
            <p className="mt-2 text-sm text-[#8C7A65]">
              Produk aktif akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const stock = stockMap.get(product.id) ?? 0;
              const available = stock > 0;

              return (
                <article
                  key={product.id}
                  className="group flex flex-col overflow-hidden rounded-[24px] border border-[#EFE5D4] bg-white p-2 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-[18px] bg-[#EAF3DF]">
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <Sprout
                        size={70}
                        strokeWidth={1.3}
                        className="text-[#47763A]"
                      />
                    )}

                    <span
                      className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-[11px] font-extrabold ${
                        available
                          ? "bg-[#47763A] text-white"
                          : "bg-[#FFDA57] text-[#332417]"
                      }`}
                    >
                      {available ? "Tersedia" : "Stok Habis"}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
                    <p className="text-xs font-bold text-[#47763A]">
                      {product.category === "compost"
                        ? "Pupuk Kompos"
                        : product.category === "maggot"
                          ? "Produk Maggot"
                          : "Produk Lainnya"}
                    </p>

                    <h3 className="mt-1 line-clamp-2 min-h-11 text-base font-black leading-6">
                      {product.name}
                    </h3>

                    <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-[#8C7A65]">
                      {product.description ||
                        "Produk hasil pengolahan sampah organik."}
                    </p>

                    <div className="mt-auto flex items-end justify-between gap-2 pt-4">
                      <div>
                        <p className="text-lg font-black text-[#47763A]">
                          {rupiah(Number(product.price ?? 0))}
                        </p>
                        <p className="text-xs text-[#8C7A65]">
                          per {product.unit}
                        </p>
                      </div>

                      <Link
                        href={`/buyer/marketplace/${product.id}`}
                        aria-label={`Lihat detail ${product.name}`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#47763A] text-white transition hover:bg-[#315F2E]"
                      >
                        <ShoppingCart size={19} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="flex flex-col items-start justify-between gap-5 rounded-[26px] bg-[#FFF0BF] p-7 sm:flex-row sm:items-center sm:p-9">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-extrabold text-[#47763A]">
            <CircleCheck size={18} />
            Belanja di PUTARASA
          </p>
          <h2 className="text-2xl font-black">
            Masih Ada Banyak Produk Menarik
          </h2>
          <p className="mt-2 text-sm text-[#74695B]">
            Temukan produk lainnya melalui Marketplace.
          </p>
        </div>

        <Link
          href="/buyer/marketplace"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#47763A] px-6 py-3.5 text-sm font-extrabold text-white hover:bg-[#315F2E]"
        >
          Jelajahi Marketplace
          <ChevronRight size={18} />
        </Link>
      </section>

      <footer className="border-t border-[#EDE5D6] pt-6 text-center text-xs text-[#9A8974]">
        PUTARASA — Dari Dapur, Untuk Bumi
      </footer>
    </main>
  );
}
