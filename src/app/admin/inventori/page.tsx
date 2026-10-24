
import Link from "next/link";
import { ArrowLeft, Boxes } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import InventoryWorkspace from
  "@/components/admin/InventoryWorkspace";

export default async function InventoriPage() {
  await requireRole("admin");

  const supabase = await createClient();

  const [
    productsResult,
    stockResult,
    movementsResult,
    outputsResult,
  ] = await Promise.all([
    supabase
      .from("putarasa_products")
      .select("id,name,sku,category,unit,is_active")
      .order("name"),

    supabase
      .from("putarasa_inventory")
      .select("product_id,quantity"),

    supabase
      .from("putarasa_inventory_movements")
      .select(
        "id,product_id,movement_type,quantity_change,quantity_before,quantity_after,source_output_id,notes,created_at"
      )
      .order("created_at", { ascending: false })
      .limit(200),

    supabase
      .from("processing_outputs")
      .select(
        "id,batch_id,output_type,weight_kg,created_at,processing_batches!inner(batch_code,status)"
      )
      .eq("processing_batches.status", "completed")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const errors = [
    productsResult.error,
    stockResult.error,
    movementsResult.error,
    outputsResult.error,
  ].filter((error) => error !== null);

  if (errors.length) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        <h1 className="text-xl font-extrabold">
          Gagal memuat inventori
        </h1>
        <p className="mt-2 text-sm">
          {errors.map((error) => error?.message).join("; ")}
        </p>
      </div>
    );
  }

  const usedOutputIds = new Set(
    (movementsResult.data ?? [])
      .map((item) => item.source_output_id)
      .filter(Boolean)
  );

  const availableOutputs = (outputsResult.data ?? [])
    .filter((item) => !usedOutputIds.has(item.id))
    .map((item) => {
      const batchRelation = item.processing_batches;
      const batch = Array.isArray(batchRelation)
        ? batchRelation[0]
        : batchRelation;

      return {
        id: item.id,
        output_type: item.output_type,
        weight_kg: Number(item.weight_kg),
        batch_code: batch?.batch_code ?? "Batch",
      };
    });

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-8 px-5 py-8 text-[#332417] sm:px-8 lg:px-10">
      <header className="space-y-6">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#47763A] hover:opacity-75"
        >
          <ArrowLeft size={18} />
          Kembali ke Dashboard
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-2xl bg-[#FFDA57]">
            <Boxes size={30} />
          </div>

          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Manajemen Inventori
            </h1>
            <p className="mt-1 text-sm leading-6 text-[#8C7A65]">
              Pantau stok produk, catat pergerakan barang,
              dan kelola hasil pengolahan PUTARASA.
            </p>
          </div>
        </div>
      </header>

      <InventoryWorkspace
        products={productsResult.data ?? []}
        stocks={(stockResult.data ?? []).map((item) => ({
          product_id: item.product_id,
          quantity: Number(item.quantity),
        }))}
        movements={(movementsResult.data ?? []).map(
          (item) => ({
            ...item,
            quantity_change: Number(item.quantity_change),
            quantity_before: Number(item.quantity_before),
            quantity_after: Number(item.quantity_after),
          })
        )}
        availableOutputs={availableOutputs}
      />
    </main>
  );
}
