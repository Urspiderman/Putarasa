
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Users,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  Truck,
  Eye,
  X,
  Clock3,
  Mail,
  CalendarDays,
  UserRound,
} from "lucide-react";

type UserRecord = {
  id: string;
  full_name: string;
  email: string | null;
  created_at: string;
  roles: string[];
  pending_roles: string[];
};

type FilterRole =
  | "all"
  | "admin"
  | "supplier"
  | "courier"
  | "buyer"
  | "pending";

const filters: { value: FilterRole; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "admin", label: "Admin" },
  { value: "supplier", label: "Supplier" },
  { value: "courier", label: "Courier" },
  { value: "buyer", label: "Buyer" },
  { value: "pending", label: "Menunggu" },
];

const roleLabels: Record<string, string> = {
  admin: "Admin",
  supplier: "Supplier",
  courier: "Courier",
  buyer: "Buyer",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: "bg-[#EEE7FF] text-[#7652AB]",
    supplier: "bg-[#E8F4DF] text-[#4B7B36]",
    courier: "bg-[#E4F0FF] text-[#497BAA]",
    buyer: "bg-[#FFF0C5] text-[#9A7200]",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        styles[role] || "bg-gray-100 text-gray-600"
      }`}
    >
      {roleLabels[role] || role}
    </span>
  );
}

export default function UsersWorkspace({
  users,
}: {
  users: UserRecord[];
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterRole>("all");
  const [selected, setSelected] = useState<UserRecord | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.full_name.toLowerCase().includes(query) ||
        (user.email || "").toLowerCase().includes(query);

      const matchesRole =
        filter === "all" ||
        (filter === "pending"
          ? user.pending_roles.length > 0
          : user.roles.includes(filter));

      return matchesSearch && matchesRole;
    });
  }, [users, search, filter]);

  const stats = [
    {
      label: "Total Pengguna",
      value: users.length,
      icon: Users,
      bg: "bg-[#FFF0C5]",
      color: "text-[#9A7200]",
    },
    {
      label: "Supplier Aktif",
      value: users.filter((u) => u.roles.includes("supplier")).length,
      icon: Sprout,
      bg: "bg-[#E8F4DF]",
      color: "text-[#4B7B36]",
    },
    {
      label: "Courier Aktif",
      value: users.filter((u) => u.roles.includes("courier")).length,
      icon: Truck,
      bg: "bg-[#E4F0FF]",
      color: "text-[#497BAA]",
    },
    {
      label: "Menunggu Verifikasi",
      value: users.filter((u) => u.pending_roles.length > 0).length,
      icon: Clock3,
      bg: "bg-[#FFF3D7]",
      color: "text-[#A77A00]",
    },
  ];

  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-[22px] border border-[#EFE5D6] bg-white p-6 shadow-sm"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg} ${item.color}`}
              >
                <Icon size={23} />
              </div>

              <p className="mt-5 text-sm text-[#817361]">
                {item.label}
              </p>

              <p className="mt-2 text-3xl font-black">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-[24px] border border-[#EFE5D6] bg-white shadow-sm">
        <div className="space-y-5 border-b border-[#F0E9DD] p-6">
          <div>
            <h2 className="text-lg font-black">
              Daftar Pengguna
            </h2>
            <p className="mt-1 text-sm text-[#8A7B67]">
              Kelola dan pantau akun yang terdaftar di PUTARASA.
            </p>
          </div>

          <div className="relative max-w-md">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A09483]"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau email..."
              className="w-full rounded-xl border border-[#E9E1D6] bg-[#FFFCF7] py-3 pl-12 pr-4 text-sm outline-none focus:border-[#E4AB00] focus:ring-2 focus:ring-[#FFE49B]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                aria-pressed={filter === item.value}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  filter === item.value
                    ? "bg-[#FFC20A] text-[#332417]"
                    : "bg-[#F7F3EB] text-[#817361] hover:bg-[#FFF0C5]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-[#FFFAED] text-xs uppercase tracking-wide text-[#806E54]">
              <tr>
                <th className="px-6 py-4">Pengguna</th>
                <th className="px-6 py-4">Role Aktif</th>
                <th className="px-6 py-4">Status Pengajuan</th>
                <th className="px-6 py-4">Bergabung</th>
                <th className="px-6 py-4">Detail</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F1EADF]">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-[#FFFCF5]">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFF0C5] font-extrabold text-[#9A7200]">
                        {(user.full_name || "P").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold">{user.full_name}</p>
                        <p className="mt-1 text-xs text-[#8A7B67]">
                          {user.email || "Email tidak tersedia"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-1.5">
                      {user.roles.length ? (
                        user.roles.map((role) => (
                          <RoleBadge key={role} role={role} />
                        ))
                      ) : (
                        <span className="text-xs text-[#A09483]">
                          Belum ada
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    {user.pending_roles.length ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                        <Clock3 size={14} />
                        Menunggu: {user.pending_roles.join(", ")}
                      </span>
                    ) : (
                      <span className="text-xs text-[#8A7B67]">
                        Tidak ada pengajuan aktif
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-5 text-xs text-[#817361]">
                    {formatDate(user.created_at)}
                  </td>

                  <td className="px-6 py-5">
                    <button
                      type="button"
                      onClick={() => setSelected(user)}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#FFF0C5] px-3 py-2 text-xs font-bold text-[#916B00] hover:bg-[#FFE39A]"
                    >
                      <Eye size={16} />
                      Lihat Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="px-6 py-16 text-center">
              <Search
                size={42}
                className="mx-auto text-[#D6B76C]"
              />
              <p className="mt-4 font-bold">
                Tidak Ada Pengguna Ditemukan
              </p>
              <p className="mt-2 text-sm text-[#8A7B67]">
                Coba ubah kata kunci atau filter pencarian.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-[#F0E9DD] px-6 py-4 text-xs text-[#8A7B67]">
          Menampilkan {filtered.length} dari {users.length} pengguna.
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-detail-title"
            className="w-full max-w-lg rounded-[28px] bg-white p-7 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="user-detail-title"
                  className="text-xl font-black"
                >
                  Detail Pengguna
                </h2>
                <p className="mt-1 text-xs text-[#8A7B67]">
                  Informasi akun PUTARASA
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Tutup detail"
                className="rounded-lg p-2 hover:bg-[#F7F3EB]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-7 flex items-center gap-4 rounded-2xl bg-[#FFFAED] p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFE8A0] text-xl font-black text-[#916B00]">
                {selected.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-extrabold">
                  {selected.full_name}
                </p>
                <p className="mt-1 text-sm text-[#8A7B67]">
                  {selected.email || "Email tidak tersedia"}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div className="flex gap-3">
                <UserRound size={19} className="text-[#A77A00]" />
                <div>
                  <p className="text-xs text-[#8A7B67]">Nama Lengkap</p>
                  <p className="mt-1 text-sm font-bold">
                    {selected.full_name}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Mail size={19} className="text-[#A77A00]" />
                <div>
                  <p className="text-xs text-[#8A7B67]">Email</p>
                  <p className="mt-1 text-sm font-bold">
                    {selected.email || "Tidak tersedia"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <ShieldCheck size={19} className="text-[#A77A00]" />
                <div>
                  <p className="text-xs text-[#8A7B67]">Role Aktif</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selected.roles.length ? (
                      selected.roles.map((role) => (
                        <RoleBadge key={role} role={role} />
                      ))
                    ) : (
                      <span className="text-sm">Belum ada role aktif</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Clock3 size={19} className="text-[#A77A00]" />
                <div>
                  <p className="text-xs text-[#8A7B67]">
                    Pengajuan Menunggu
                  </p>
                  <p className="mt-1 text-sm font-bold capitalize">
                    {selected.pending_roles.length
                      ? selected.pending_roles.join(", ")
                      : "Tidak ada"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CalendarDays size={19} className="text-[#A77A00]" />
                <div>
                  <p className="text-xs text-[#8A7B67]">
                    Tanggal Bergabung
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {formatDate(selected.created_at)}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-8 w-full rounded-xl bg-[#FFC20A] py-3.5 font-extrabold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
