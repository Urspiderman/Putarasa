
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Sprout,
} from "lucide-react";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import ProductWorkspace from
  "@/components/admin/ProductWorkspace";

export default async function ProdukPage() {
  await requireRole("admin");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("putarasa_products")
    .select(
      "id,name,sku,category,description,price,unit,image_url,is_active,created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        <h1 className="text-xl font-extrabold">
          Gagal memuat produk
        </h1>
        <p className="mt-2 text-sm">
          {error.message}
        </p>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-8 px-5 py-8 text-[#332417] sm:px-8 lg:px-10">
      <header className="space-y-6">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#47763A] transition hover:opacity-75"
        >
          <ArrowLeft size={18} />
          Kembali ke Dashboard
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-2xl bg-[#FFDA57]">
            <Package
              size={30}
              className="text-[#332417]"
            />
          </div>

          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#332417]">
              Manajemen Produk
            </h1>

            <p className="mt-1 text-sm leading-6 text-[#8C7A65]">
              Kelola katalog, harga jual, dan status
              produk kompos serta maggot PUTARASA.
            </p>
          </div>
        </div>
      </header>

      <ProductWorkspace products={data ?? []} />

      <div className="flex items-center gap-2 border-t border-[#EFE5D4] pt-5 text-xs text-[#8C7A65]">
        <Sprout size={16} className="text-[#47763A]" />
        PUTARASA — Dari Dapur, Untuk Bumi
      </div>
    </main>
  );
}
