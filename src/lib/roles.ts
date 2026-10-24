
export const ROLES = [
  "admin",
  "supplier",
  "courier",
  "buyer",
] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
  return (
    typeof value === "string" &&
    ROLES.some((role) => role === value)
  );
}

export const roleConfig: Record<
  Role,
  { label: string; dashboard: string }
> = {
  admin: {
    label: "Admin",
    dashboard: "/admin/dashboard",
  },
  supplier: {
    label: "Supplier",
    dashboard: "/supplier/dashboard",
  },
  courier: {
    label: "Courier",
    dashboard: "/courier/dashboard",
  },
  buyer: {
    label: "Buyer",
    dashboard: "/buyer/dashboard",
  },
};

export function getRoleDashboard(role: Role): string {
  return roleConfig[role].dashboard;
}

export const roleMenus: Record<
  Role,
  { label: string; href: string }[]
> = {
  admin: [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Pengguna & Role", href: "/admin/pengguna" },
    { label: "Verifikasi", href: "/admin/verifikasi" },
    { label: "Penjemputan", href: "/admin/penjemputan" },
    { label: "Pengolahan", href: "/admin/pengolahan" },
    { label: "Inventori", href: "/admin/inventori" },
    { label: "Produk", href: "/admin/produk" },
    { label: "Pesanan", href: "/admin/pesanan" },
    { label: "Pembayaran", href: "/admin/pembayaran" },
    { label: "Laporan", href: "/admin/laporan" },
    { label: "Pengaturan", href: "/admin/pengaturan" },
  ],
  supplier: [
    { label: "Dashboard", href: "/supplier/dashboard" },
    { label: "Penjemputan", href: "/supplier/penjemputan" },
    { label: "Jadwal", href: "/supplier/jadwal" },
    { label: "Riwayat", href: "/supplier/riwayat" },
    { label: "Dampak", href: "/supplier/dampak" },
    { label: "Marketplace", href: "/supplier/marketplace" },
    { label: "Keranjang", href: "/supplier/keranjang" },
    { label: "Pesanan Saya", href: "/supplier/pesanan" },
    { label: "Profil", href: "/supplier/profil" },
  ],
  courier: [
    { label: "Dashboard", href: "/courier/dashboard" },
    { label: "Tugas Hari Ini", href: "/courier/tugas" },
    { label: "Navigasi", href: "/courier/navigasi" },
    { label: "Riwayat", href: "/courier/riwayat" },
    { label: "Marketplace", href: "/courier/marketplace" },
    { label: "Keranjang", href: "/courier/keranjang" },
    { label: "Pesanan Saya", href: "/courier/pesanan" },
    { label: "Profil", href: "/courier/profil" },
  ],
  buyer: [
    { label: "Dashboard", href: "/buyer/dashboard" },
    { label: "Marketplace", href: "/buyer/marketplace" },
    { label: "Keranjang", href: "/buyer/keranjang" },
    { label: "Pesanan Saya", href: "/buyer/pesanan" },
    { label: "Chatbot AI", href: "/buyer/chatbot" },
    { label: "Profil", href: "/buyer/profil" },
  ],
};
