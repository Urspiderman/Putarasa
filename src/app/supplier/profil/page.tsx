
import Link from "next/link";
import { ChevronRight, Leaf } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import SupplierProfileWorkspace from
  "@/components/supplier/SupplierProfileWorkspace";

export default async function SupplierProfilePage() {
  const { user } = await requireRole("supplier");
  const supabase = await createClient();

  const [profileResult, supplierResult] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle(),

      supabase
        .from("supplier_profiles")
        .select("supplier_type,institution_name")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

  const error =
    profileResult.error ?? supplierResult.error;

  const metadata = user.user_metadata ?? {};

  const metadataName =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : "";

  const metadataPhone =
    typeof metadata.phone === "string"
      ? metadata.phone
      : "";

  const metadataAddress =
    typeof metadata.default_pickup_address === "string"
      ? metadata.default_pickup_address
      : "";

  const fullName =
    profileResult.data?.full_name ||
    metadataName ||
    "";

  return (
    <main className="min-h-screen bg-[#FFFBF1] text-[#332417]">
      <div className="mx-auto w-full max-w-[1500px] space-y-7 px-4 py-7 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-[#8C7A65]">
          <Link
            href="/supplier/dashboard"
            className="hover:text-[#47763A]"
          >
            Supplier
          </Link>

          <ChevronRight size={15} />

          <span className="font-black text-[#47763A]">
            Profil
          </span>
        </div>

        <section className="relative overflow-hidden rounded-[30px] bg-[#FFDA57] p-7 sm:p-9 lg:p-10">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/20" />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-xs font-black text-[#47763A]">
              <Leaf size={16} />
              SUPPLIER ACCOUNT
            </span>

            <h1 className="mt-5 text-3xl font-black sm:text-4xl">
              Profil Supplier
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#655221] sm:text-base">
              Kelola informasi pribadi, identitas usaha,
              dan alamat penjemputan default dalam
              satu halaman.
            </p>
          </div>
        </section>

        {error ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
          >
            Gagal memuat profil: {error.message}
          </div>
        ) : (
          <SupplierProfileWorkspace
            initialName={fullName}
            initialPhone={metadataPhone}
            initialAddress={metadataAddress}
            initialSupplierType={
              supplierResult.data?.supplier_type ?? ""
            }
            initialInstitutionName={
              supplierResult.data?.institution_name ?? ""
            }
            email={user.email ?? ""}
            createdAt={user.created_at}
          />
        )}

        <footer className="border-t border-[#EDE5D6] py-5 text-center text-xs text-[#9A8974]">
          PUTARASA — Supplier Workspace
        </footer>
      </div>
    </main>
  );
}
