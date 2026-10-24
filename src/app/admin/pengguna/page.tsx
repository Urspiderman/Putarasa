
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import UsersWorkspace from "@/components/admin/UsersWorkspace";

export default async function AdminUsersPage() {
  await requireRole("admin");

  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_admin_users"
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
          <Users size={16} />
          Manajemen Akun
        </div>

        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Manajemen Pengguna
        </h1>

        <p className="mt-3 text-sm leading-7 text-[#817361]">
          Lihat seluruh akun PUTARASA, cari pengguna,
          dan pantau role serta status pengajuannya.
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
        >
          Gagal memuat data pengguna: {error.message}
        </div>
      ) : (
        <UsersWorkspace users={data ?? []} />
      )}
    </main>
  );
}
