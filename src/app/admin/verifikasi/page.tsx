
import Link from "next/link";
import {
  ArrowLeft,
  ClipboardCheck,
  ShieldCheck,
} from "lucide-react";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import VerificationWorkspace from "@/components/admin/VerificationWorkspace";

export default async function AdminVerificationPage() {
  await requireRole("admin");

  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_admin_role_applications"
  );

  return (
    <main className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#A77A00] hover:underline"
      >
        <ArrowLeft size={17} />
        Kembali ke Dashboard
      </Link>

      <div className="mb-8 mt-7">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#FFF0BF] px-4 py-2 text-xs font-bold text-[#916B00]">
          <ShieldCheck size={16} />
          Persetujuan Akses
        </div>

        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Verifikasi Akun
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#817361]">
          Periksa dan kelola permohonan akses Supplier
          dan Courier sebelum pengguna dapat menjalankan
          aktivitas operasional PUTARASA.
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
        >
          <div className="flex items-start gap-3">
            <ClipboardCheck
              size={22}
              className="shrink-0"
            />

            <div>
              <p className="font-bold">
                Gagal Memuat Pengajuan
              </p>

              <p className="mt-2">{error.message}</p>

              <p className="mt-3 text-xs">
                Pastikan fungsi get_admin_role_applications
                sudah dibuat di Supabase dan akun memiliki
                role Admin.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <VerificationWorkspace
          applications={data ?? []}
        />
      )}
    </main>
  );
}
