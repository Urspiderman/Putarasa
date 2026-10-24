
import Link from "next/link";
import {
  Clock3,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";

import PutarasaLogo from "@/components/landing/PutarasaLogo";
import { requireUser, getUserRoles } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getRoleDashboard } from "@/lib/roles";

type Application = {
  id: string;
  requested_role: string;
  status: "pending" | "approved" | "rejected";
  review_notes: string | null;
};

export default async function PendingPage() {
  const user = await requireUser();
  const roles = await getUserRoles();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("role_applications")
    .select("id, requested_role, status, review_notes")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const applications = (data ?? []) as Application[];

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFFBF1] px-4 py-10">
      <div className="w-full max-w-[600px] rounded-[30px] border border-[#EEE5D7] bg-white p-8 shadow-lg sm:p-12">
        <div className="mb-8 flex justify-center">
          <PutarasaLogo size={46} />
        </div>

        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF1C3] text-[#B98400]">
            <Clock3 size={38} />
          </div>

          <h1 className="mt-6 text-3xl font-extrabold">
            Status Pengajuan Akun
          </h1>

          <p className="mt-3 text-sm leading-7 text-[#766E63]">
            Halo, {user.user_metadata?.full_name || "Pengguna"}.
            Berikut status pengajuan role Putarasa kamu.
          </p>
        </div>

        {error && (
          <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            Gagal memuat pengajuan: {error.message}
          </p>
        )}

        {!error && applications.length === 0 && (
          <p className="mt-7 rounded-xl bg-[#FFF8E4] p-4 text-center text-sm text-[#80611B]">
            Belum ada pengajuan Supplier atau Courier.
          </p>
        )}

        <div className="mt-7 space-y-4">
          {applications.map((application) => (
            <div
              key={application.id}
              className="rounded-2xl border border-[#EEE5D7] p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-extrabold capitalize">
                  {application.requested_role}
                </h2>

                {application.status === "pending" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                    <Clock3 size={14} />
                    Menunggu
                  </span>
                ) : application.status === "approved" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                    <CheckCircle2 size={14} />
                    Disetujui
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                    <XCircle size={14} />
                    Ditolak
                  </span>
                )}
              </div>

              {application.review_notes && (
                <p className="mt-3 text-sm leading-6 text-[#766E63]">
                  Catatan Admin: {application.review_notes}
                </p>
              )}
            </div>
          ))}
        </div>

        {roles.length > 0 && (
          <Link
            href={
              roles.length === 1
                ? getRoleDashboard(roles[0])
                : "/auth/select-role"
            }
            className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-[#FFC20A] px-6 py-4 font-bold"
          >
            Masuk Workspace Aktif <ArrowRight size={18} />
          </Link>
        )}

        <Link
          href="/"
          className="mt-5 block text-center text-sm font-semibold text-[#B98400]"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}
