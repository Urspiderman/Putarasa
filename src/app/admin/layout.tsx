
import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Memastikan akun memiliki akses Admin
  // sekaligus mengambil semua role akun dari database.
  const { roles } = await requireRole("admin");

  return (
    <div className="min-h-screen bg-[#FFFBF1] text-[#332417]">
      {/* Sidebar Admin dengan fitur Ganti Role */}
      <AdminSidebar roles={roles} />

      {/* Konten halaman Admin tetap seperti sebelumnya */}
      <div className="min-h-screen pt-16 lg:ml-[270px] lg:pt-0">
        {children}
      </div>
    </div>
  );
}
