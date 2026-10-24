
import Link from "next/link";
import {
  ArrowLeft,
  Settings2,
} from "lucide-react";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import SettingsWorkspace from
  "@/components/admin/SettingsWorkspace";

export default async function PengaturanPage() {
  await requireRole("admin");

  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        Gagal mengambil informasi akun Admin.
      </div>
    );
  }

  const metadata = user.user_metadata ?? {};

  const fullName =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : "";

  const phone =
    typeof metadata.phone_number === "string"
      ? metadata.phone_number
      : "";

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
            <Settings2 size={30} />
          </div>

          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Pengaturan
            </h1>
            <p className="mt-1 text-sm leading-6 text-[#8C7A65]">
              Kelola profil, keamanan akun, dan informasi
              aplikasi PUTARASA.
            </p>
          </div>
        </div>
      </header>

      <SettingsWorkspace
        email={user.email ?? ""}
        fullName={fullName}
        phone={phone}
        createdAt={user.created_at}
        lastSignInAt={user.last_sign_in_at ?? null}
        emailConfirmed={Boolean(user.email_confirmed_at)}
      />
    </main>
  );
}
