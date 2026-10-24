
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  CircleCheck,
  Filter,
  Leaf,
  Search,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Sprout,
  X,
} from "lucide-react";

type Category = "all" | "compost" | "maggot" | "other";

type SortMode =
  | "newest"
  | "price-low"
  | "price-high"
  | "name";

type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string | null;
  price: number;
  unit: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  stock: number;
};

type Props = {
  products: Product[];
  role?: "buyer" | "supplier";
};

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

function categoryLabel(category: string) {
  if (category === "compost") return "Pupuk Kompos";
  if (category === "maggot") return "Produk Maggot";
  return "Produk Lainnya";
}

function getCategory(value: string | null): Category {
  if (
    value === "compost" ||
    value === "maggot" ||
    value === "other"
  ) {
    return value;
  }

  return "all";
}

export default function MarketplaceWorkspace({
  products,
  role = "buyer",
}: Props) {
  const searchParams = useSearchParams();

  const marketplacePath = `/${role}/marketplace`;
  const cartPath = `/${role}/keranjang`;

  const urlCategory = getCategory(
    searchParams.get("category")
  );

  const urlSearch = searchParams.get("q") ?? "";

  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null);

  const [editedSearch, setEditedSearch] =
    useState<string | null>(null);

  const [sort, setSort] = useState<SortMode>("newest");

  const [onlyAvailable, setOnlyAvailable] =
    useState(false);

  const category = selectedCategory ?? urlCategory;
  const search = editedSearch ?? urlSearch;

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const result = products.filter((product) => {
      const matchesCategory =
        category === "all" ||
        product.category === category;

      const matchesSearch =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        product.sku.toLowerCase().includes(keyword) ||
        (product.description ?? "")
          .toLowerCase()
          .includes(keyword);

      const matchesStock =
        !onlyAvailable || product.stock > 0;

      return (
        matchesCategory &&
        matchesSearch &&
        matchesStock
      );
    });

    return result.sort((a, b) => {
      if (sort === "price-low") {
        return a.price - b.price;
      }

      if (sort === "price-high") {
        return b.price - a.price;
      }

      if (sort === "name") {
        return a.name.localeCompare(b.name, "id");
      }

      return (
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      );
    });
  }, [
    products,
    category,
    search,
    sort,
    onlyAvailable,
  ]);

  const availableCount = products.filter(
    (product) => product.stock > 0
  ).length;

  const activeFilters =
    search.trim() !== "" ||
    category !== "all" ||
    onlyAvailable ||
    sort !== "newest";

  function resetFilters() {
    setEditedSearch("");
    setSelectedCategory("all");
    setSort("newest");
    setOnlyAvailable(false);
  }

  function scrollToProducts() {
    document
      .getElementById("daftar-produk")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-8 px-4 pb-16 pt-5 text-[#332417] sm:px-6 lg:px-8">

      {/* HERO MARKETPLACE */}
      <section className="relative overflow-hidden rounded-[30px] border border-[#F1E7D4] bg-[#FFF9E9] shadow-[0_10px_35px_rgba(94,70,30,0.07)]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#FFDA57]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-[#BBD49C]/25 blur-3xl" />

        <div className="relative grid min-h-[345px] items-center gap-8 px-6 py-9 sm:px-9 lg:grid-cols-[1.2fr_0.8fr] lg:px-12">

          {/* KONTEN HERO */}
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF0BF] px-4 py-2 text-xs font-extrabold text-[#47763A]">
              <Leaf size={15} />
              MARKETPLACE PUTARASA
            </span>

            <h1 className="mt-5 text-3xl font-black leading-[1.15] tracking-tight sm:text-4xl lg:text-[46px]">
              Temukan Produk
              <span className="block text-[#47763A]">
                untuk Kebutuhanmu.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-[#74695B] sm:text-base">
              Dari sampah organik menjadi produk yang
              bermanfaat. Temukan kompos, maggot, dan
              produk lainnya di PUTARASA.
            </p>

            {/* PENCARIAN */}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                scrollToProducts();
              }}
              className="mt-6 flex max-w-xl items-center gap-2 rounded-2xl border border-[#EEE3CE] bg-white p-1.5 shadow-sm"
            >
              <Search
                size={21}
                className="ml-3 shrink-0 text-[#47763A]"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setEditedSearch(event.target.value)
                }
                placeholder="Cari kompos, maggot, atau produk..."
                aria-label="Cari produk"
                className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm outline-none placeholder:text-[#9A8974]"
              />

              <button
                type="submit"
                className="rounded-xl bg-[#47763A] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#315F2E]"
              >
                Cari
              </button>
            </form>

            {/* KATEGORI POPULER */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-extrabold">
                Populer:
              </span>

              {(
                [
                  ["Kompos", "compost"],
                  ["Maggot", "maggot"],
                  ["Lainnya", "other"],
                ] as const
              ).map(([label, value]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(
                      category === value ? "all" : value
                    );
                    scrollToProducts();
                  }}
                  aria-pressed={category === value}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    category === value
                      ? "bg-[#47763A] text-white"
                      : "bg-[#F5EDCF] text-[#5B503E] hover:bg-[#FFDA57]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ILUSTRASI HERO */}
          <div className="relative hidden min-h-[260px] items-center justify-center lg:flex">
            <div className="absolute right-4 top-0 h-60 w-60 rounded-full bg-[#DDEBCB]" />
            <div className="absolute bottom-0 left-10 h-48 w-48 rounded-full bg-[#FFDA57]/30" />

            <div className="relative flex h-[260px] w-[285px] items-center justify-center rounded-[40px] border border-[#E6D9BE] bg-gradient-to-br from-[#E6F1D8] via-[#F7E8C6] to-[#D7E7C3] shadow-xl">
              <div className="absolute left-5 top-5 rounded-2xl bg-white/80 p-3 text-[#47763A] shadow-sm">
                <Leaf size={27} />
              </div>

              <div className="flex h-44 w-44 items-center justify-center rounded-full bg-white/40">
                <ShoppingBag
                  size={112}
                  strokeWidth={1.3}
                  className="text-[#47763A]"
                />
              </div>

              <div className="absolute -bottom-4 -right-5 rounded-2xl bg-[#FFDA57] px-5 py-3 text-center text-sm font-black shadow-lg">
                Belanja Baik,
                <br />
                untuk Bumi
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DAFTAR PRODUK */}
      <section
        id="daftar-produk"
        className="scroll-mt-28 space-y-5"
      >
        {/* JUDUL KATALOG */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#47763A]">
              Katalog PUTARASA
            </p>

            <h2 className="mt-1 text-2xl font-black">
              Produk Tersedia
            </h2>

            <p className="mt-1 text-sm text-[#8C7A65]">
              Jelajahi produk dan pilih yang sesuai
              kebutuhanmu.
            </p>
          </div>

          <span className="rounded-full bg-[#EAF3DF] px-4 py-2 text-xs font-extrabold text-[#47763A]">
            {filteredProducts.length} Produk Ditemukan
          </span>
        </div>

        {/* TOOLBAR FILTER */}
        <div className="flex flex-col gap-4 rounded-2xl border border-[#EFE5D4] bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#F0F7E9] p-3">
              <Filter
                size={20}
                className="text-[#47763A]"
              />
            </div>

            <div>
              <p className="text-sm font-black">
                Filter Produk
              </p>

              <p className="text-xs text-[#8C7A65]">
                {filteredProducts.length} dari{" "}
                {products.length} produk
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">

            {/* FILTER STOK */}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#FFFBF1] px-4 py-3 text-sm font-semibold">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(event) =>
                  setOnlyAvailable(event.target.checked)
                }
                className="h-4 w-4 accent-[#47763A]"
              />
              Stok Tersedia
            </label>

            {/* URUTKAN */}
            <div className="relative">
              <SlidersHorizontal
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#47763A]"
              />

              <select
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value as SortMode)
                }
                aria-label="Urutkan produk"
                className="appearance-none rounded-xl border border-[#E9DFCE] bg-white py-3 pl-10 pr-10 text-sm font-semibold outline-none focus:border-[#47763A]"
              >
                <option value="newest">Terbaru</option>
                <option value="price-low">
                  Harga Terendah
                </option>
                <option value="price-high">
                  Harga Tertinggi
                </option>
                <option value="name">Nama A–Z</option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7A65]"
              />
            </div>

            {/* RESET */}
            {activeFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold text-[#8C7A65] hover:bg-[#F5F1E8]"
              >
                <X size={17} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* GRID PRODUK */}
        {filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-[#EFE5D4] bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#F0F7E9]">
              <Search
                size={36}
                className="text-[#47763A]"
              />
            </div>

            <h3 className="mt-5 text-xl font-black">
              Produk Tidak Ditemukan
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8C7A65]">
              Coba gunakan kata kunci lain atau hapus
              filter yang sedang aktif.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#47763A] px-6 py-3 font-extrabold text-white"
            >
              <X size={17} />
              Hapus Filter
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const available = product.stock > 0;

              return (
                <article
                  key={product.id}
                  className="group flex flex-col overflow-hidden rounded-[24px] border border-[#EFE5D4] bg-white p-2 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* GAMBAR */}
                  <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-[18px] bg-[#EAF3DF]">
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
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
                      {available
                        ? "Tersedia"
                        : "Stok Habis"}
                    </span>
                  </div>

                  {/* INFORMASI */}
                  <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-[#47763A]">
                      <BadgeCheck size={15} />
                      {categoryLabel(product.category)}
                    </p>

                    <h3 className="mt-2 line-clamp-2 min-h-12 text-base font-black leading-6">
                      {product.name}
                    </h3>

                    <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-[#8C7A65]">
                      {product.description ||
                        "Produk hasil pengolahan sampah organik PUTARASA."}
                    </p>

                    <p className="mt-3 text-[11px] text-[#9A8974]">
                      SKU: {product.sku}
                    </p>

                    {/* HARGA */}
                    <div className="mt-auto pt-4">
                      <div className="flex items-end justify-between gap-2 border-t border-[#F2EADF] pt-4">
                        <div>
                          <p className="text-lg font-black text-[#47763A]">
                            {formatRupiah(product.price)}
                          </p>

                          <p className="text-xs text-[#8C7A65]">
                            per {product.unit}
                          </p>
                        </div>

                        <Link
                          href={`${marketplacePath}/${product.id}`}
                          aria-label={`Lihat detail ${product.name}`}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#47763A] text-white transition hover:bg-[#315F2E]"
                        >
                          <ShoppingCart size={19} />
                        </Link>
                      </div>

                      {/* TOMBOL DETAIL */}
                      <Link
                        href={`${marketplacePath}/${product.id}`}
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFDA57] px-4 py-3 text-xs font-extrabold transition hover:bg-[#FFE585]"
                      >
                        Lihat Detail Produk
                        <ArrowRight size={16} />
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
            Pilih Produk, Dukung Bumi
          </h2>

          <p className="mt-2 text-sm text-[#74695B]">
            {availableCount} produk memiliki stok
            tersedia saat ini.
          </p>
        </div>

        <Link
          href={cartPath}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#47763A] px-6 py-3.5 text-sm font-extrabold text-white hover:bg-[#315F2E]"
        >
          <ShoppingBag size={18} />
          Lihat Keranjang
          <ArrowRight size={17} />
        </Link>
      </section>

      <footer className="border-t border-[#EDE5D6] pt-6 text-center text-xs text-[#9A8974]">
        PUTARASA — Dari Dapur, Untuk Bumi
      </footer>
    </main>
  );
}
