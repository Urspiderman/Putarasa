
import Link from "next/link";
import { ArrowLeft, Recycle } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import ProcessingWorkspace from "@/components/admin/ProcessingWorkspace";

export const dynamic = "force-dynamic";

export default async function AdminProcessingPage() {
  await requireRole("admin");

  const supabase = await createClient();

  const [batchResult, inputResult, outputResult, wasteResult] =
    await Promise.all([
      supabase
        .from("processing_batches")
        .select(
          "id,batch_code,processing_method,status,start_date,completion_date,notes,created_at"
        )
        .order("created_at", { ascending: false }),

      supabase
        .from("processing_batch_inputs")
        .select("id,batch_id,pickup_id,weight_kg"),

      supabase
        .from("processing_outputs")
        .select("id,batch_id,output_type,weight_kg,notes,created_at")
        .order("created_at", { ascending: false }),

      supabase
        .from("processing_available_waste")
        .select(
          "pickup_id,pickup_date,waste_type,actual_weight_kg,allocated_weight_kg,available_weight_kg"
        )
        .order("pickup_date", { ascending: false }),
    ]);

  const error =
    batchResult.error ||
    inputResult.error ||
    outputResult.error ||
    wasteResult.error;

  return (
    <main className="min-h-screen bg-[#FFFBF1] px-4 py-7 text-[#332417] sm:px-7 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-7">
        <div className="space-y-4">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#47763A] hover:underline"
          >
            <ArrowLeft size={17} />
            Kembali ke Dashboard
          </Link>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFDA57]">
              <Recycle size={29} />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold sm:text-3xl">
                Pengolahan Sampah
              </h1>
              <p className="mt-1 text-sm text-[#7B6A55]">
                Kelola batch kompos dan maggot dari sampah organik
                yang telah dikumpulkan.
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            Gagal memuat data pengolahan: {error.message}
          </div>
        ) : (
          <ProcessingWorkspace
            batches={batchResult.data ?? []}
            inputs={inputResult.data ?? []}
            outputs={outputResult.data ?? []}
            availableWaste={wasteResult.data ?? []}
          />
        )}
      </div>
    </main>
  );
}
