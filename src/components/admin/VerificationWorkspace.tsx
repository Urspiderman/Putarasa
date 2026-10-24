
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ClipboardCheck,
  Clock3,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  Check,
  Loader2,
  CalendarDays,
  Mail,
  UserRound,
  ShieldCheck,
  Truck,
  Sprout,
  AlertCircle,
} from "lucide-react";

import { reviewApplication } from "@/app/admin/verifikasi/actions";

export type ApplicationRecord = {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  requested_role: string;
  status: string;
  review_notes: string | null;
  created_at: string;
};

type StatusFilter = "all" | "pending" | "approved" | "rejected";
type RoleFilter = "all" | "supplier" | "courier";
type Decision = "approved" | "rejected";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

function roleLabel(role: string) {
  if (role === "supplier") return "Supplier";
  if (role === "courier") return "Courier";
  return role;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<
    string,
    { label: string; style: string }
  > = {
    pending: {
      label: "Menunggu",
      style: "bg-amber-50 text-amber-700",
    },
    approved: {
      label: "Disetujui",
      style: "bg-green-50 text-green-700",
    },
    rejected: {
      label: "Ditolak",
      style: "bg-red-50 text-red-700",
    },
  };

  const item = config[status] ?? {
    label: status,
    style: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${item.style}`}
    >
      {item.label}
    </span>
  );
}

export default function VerificationWorkspace({
  applications,
}: {
  applications: ApplicationRecord[];
}) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");
  const [roleFilter, setRoleFilter] =
    useState<RoleFilter>("all");

  const [selected, setSelected] =
    useState<ApplicationRecord | null>(null);

  const [decision, setDecision] =
    useState<Decision | null>(null);

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const stats = {
    total: applications.length,
    pending: applications.filter(
      (item) => item.status === "pending"
    ).length,
    approved: applications.filter(
      (item) => item.status === "approved"
    ).length,
    rejected: applications.filter(
      (item) => item.status === "rejected"
    ).length,
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((item) => {
      const matchesSearch =
        !query ||
        item.full_name.toLowerCase().includes(query) ||
        (item.email || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        item.status === statusFilter;

      const matchesRole =
        roleFilter === "all" ||
        item.requested_role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [applications, search, statusFilter, roleFilter]);

  function closeModal() {
    if (loading) return;

    setSelected(null);
    setDecision(null);
    setNotes("");
    setMessage("");
    setIsError(false);
  }

  function openDetail(item: ApplicationRecord) {
    setSelected(item);
    setDecision(null);
    setNotes("");
    setMessage("");
    setIsError(false);
  }

  async function handleReview() {
    if (!selected || !decision || loading) return;

    if (decision === "rejected" && !notes.trim()) {
      setMessage("Alasan penolakan wajib diisi.");
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const result = await reviewApplication(
        selected.id,
        decision,
        notes
      );

      setMessage(result.message);
      setIsError(!result.success);

      if (result.success) {
        setSelected(null);
        setDecision(null);
        setNotes("");
        router.refresh();
      }
    } catch {
      setMessage("Terjadi kesalahan saat memproses pengajuan.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      label: "Total Pengajuan",
      value: stats.total,
      icon: ClipboardCheck,
      bg: "bg-[#FFF0C5]",
      color: "text-[#9A7200]",
    },
    {
      label: "Menunggu",
      value: stats.pending,
      icon: Clock3,
      bg: "bg-[#FFF3D7]",
      color: "text-[#B77B00]",
    },
    {
      label: "Disetujui",
      value: stats.approved,
      icon: CheckCircle2,
      bg: "bg-[#E8F4DF]",
      color: "text-[#4B7B36]",
    },
    {
      label: "Ditolak",
      value: stats.rejected,
      icon: XCircle,
      bg: "bg-[#FDE8E4]",
      color: "text-[#B95A49]",
    },
  ];

  return (
    <div className="space-y-7">
      {/* STATISTICS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => {
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

      {/* TABLE */}
      <div className="overflow-hidden rounded-[24px] border border-[#EFE5D6] bg-white shadow-sm">
        <div className="space-y-5 border-b border-[#F0E9DD] p-6">
          <div>
            <h2 className="text-lg font-black">
              Daftar Pengajuan
            </h2>

            <p className="mt-1 text-sm text-[#8A7B67]">
              Tinjau pendaftaran Supplier dan Courier.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A09483]"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Cari nama atau email..."
                className="w-full rounded-xl border border-[#E9E1D6] bg-[#FFFCF7] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#E4AB00]"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(
                  event.target.value as RoleFilter
                )
              }
              className="rounded-xl border border-[#E9E1D6] bg-[#FFFCF7] px-4 py-3 text-sm font-semibold outline-none"
            >
              <option value="all">Semua Role</option>
              <option value="supplier">Supplier</option>
              <option value="courier">Courier</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "Semua"],
                ["pending", "Menunggu"],
                ["approved", "Disetujui"],
                ["rejected", "Ditolak"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                aria-pressed={statusFilter === value}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  statusFilter === value
                    ? "bg-[#FFC20A] text-[#332417]"
                    : "bg-[#F7F3EB] text-[#817361] hover:bg-[#FFF0C5]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-[#FFFAED] text-xs uppercase tracking-wide text-[#806E54]">
              <tr>
                <th className="px-6 py-4">Pemohon</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tindakan</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F1EADF]">
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#FFFCF5]"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFF0C5] font-extrabold text-[#9A7200]">
                        {(item.full_name || "P")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <p className="font-bold">
                          {item.full_name}
                        </p>
                        <p className="mt-1 text-xs text-[#8A7B67]">
                          {item.email || "Email tidak tersedia"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#EAF3DE] px-3 py-1.5 text-xs font-bold text-[#4B7B36]">
                      {item.requested_role === "courier" ? (
                        <Truck size={14} />
                      ) : (
                        <Sprout size={14} />
                      )}
                      {roleLabel(item.requested_role)}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-xs text-[#817361]">
                    {formatDate(item.created_at)}
                  </td>

                  <td className="px-6 py-5">
                    <StatusBadge status={item.status} />
                  </td>

                  <td className="px-6 py-5">
                    <button
                      type="button"
                      onClick={() => openDetail(item)}
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
              <ClipboardCheck
                size={42}
                className="mx-auto text-[#D6B76C]"
              />

              <p className="mt-4 font-bold">
                Tidak Ada Pengajuan Ditemukan
              </p>

              <p className="mt-2 text-sm text-[#8A7B67]">
                Coba ubah pencarian atau filter.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-[#F0E9DD] px-6 py-4 text-xs text-[#8A7B67]">
          Menampilkan {filtered.length} dari{" "}
          {applications.length} pengajuan.
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="verification-detail-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white p-7 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="verification-detail-title"
                  className="text-xl font-black"
                >
                  Detail Pengajuan
                </h2>

                <p className="mt-1 text-xs text-[#8A7B67]">
                  Tinjau permohonan akses PUTARASA
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                aria-label="Tutup detail"
                className="rounded-lg p-2 hover:bg-[#F7F3EB] disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-[#FFFAED] p-5">
              <p className="text-lg font-black">
                {selected.full_name}
              </p>

              <p className="mt-1 text-sm text-[#817361]">
                {selected.email || "Email tidak tersedia"}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <StatusBadge status={selected.status} />

                <span className="rounded-full bg-[#E8F4DF] px-3 py-1.5 text-xs font-bold capitalize text-[#4B7B36]">
                  {roleLabel(selected.requested_role)}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div className="flex gap-3">
                <UserRound
                  size={19}
                  className="text-[#A77A00]"
                />
                <div>
                  <p className="text-xs text-[#8A7B67]">
                    Nama Pemohon
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {selected.full_name}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Mail
                  size={19}
                  className="text-[#A77A00]"
                />
                <div>
                  <p className="text-xs text-[#8A7B67]">
                    Email
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {selected.email || "Tidak tersedia"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <ShieldCheck
                  size={19}
                  className="text-[#A77A00]"
                />
                <div>
                  <p className="text-xs text-[#8A7B67]">
                    Role Diajukan
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {roleLabel(selected.requested_role)}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CalendarDays
                  size={19}
                  className="text-[#A77A00]"
                />
                <div>
                  <p className="text-xs text-[#8A7B67]">
                    Tanggal Pengajuan
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {formatDate(selected.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {selected.review_notes && (
              <div className="mt-6 rounded-xl bg-[#F7F3EB] p-4">
                <p className="text-xs font-bold text-[#817361]">
                  Catatan Peninjauan
                </p>
                <p className="mt-2 text-sm">
                  {selected.review_notes}
                </p>
              </div>
            )}

            {selected.status === "pending" && (
              <div className="mt-7 border-t border-[#EFE5D6] pt-6">
                <h3 className="font-black">
                  Keputusan Admin
                </h3>

                <p className="mt-1 text-xs text-[#8A7B67]">
                  Pilih tindakan untuk pengajuan ini.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setDecision("approved");
                      setMessage("");
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold ${
                      decision === "approved"
                        ? "border-green-600 bg-green-50 text-green-700"
                        : "border-[#E9E1D6] hover:bg-green-50"
                    }`}
                  >
                    <Check size={18} />
                    Setujui
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setDecision("rejected");
                      setMessage("");
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold ${
                      decision === "rejected"
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-[#E9E1D6] hover:bg-red-50"
                    }`}
                  >
                    <X size={18} />
                    Tolak
                  </button>
                </div>

                {decision === "rejected" && (
                  <div className="mt-4">
                    <label
                      htmlFor="rejection-notes"
                      className="mb-2 block text-sm font-bold"
                    >
                      Alasan Penolakan
                    </label>

                    <textarea
                      id="rejection-notes"
                      value={notes}
                      onChange={(event) =>
                        setNotes(event.target.value)
                      }
                      rows={3}
                      placeholder="Tuliskan alasan penolakan..."
                      className="w-full resize-none rounded-xl border border-[#E9E1D6] p-4 text-sm outline-none focus:border-[#E4AB00]"
                    />
                  </div>
                )}

                {decision && (
                  <button
                    type="button"
                    onClick={handleReview}
                    disabled={loading}
                    className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-extrabold text-white disabled:opacity-60 ${
                      decision === "approved"
                        ? "bg-[#47763A] hover:bg-[#365D2B]"
                        : "bg-[#B95A49] hover:bg-[#9F4739]"
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                        Memproses...
                      </>
                    ) : decision === "approved" ? (
                      <>
                        <CheckCircle2 size={18} />
                        Konfirmasi Persetujuan
                      </>
                    ) : (
                      <>
                        <XCircle size={18} />
                        Konfirmasi Penolakan
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {message && (
              <div
                role="alert"
                className={`mt-4 flex items-start gap-2 rounded-xl p-3 text-sm ${
                  isError
                    ? "bg-red-50 text-red-700"
                    : "bg-green-50 text-green-700"
                }`}
              >
                <AlertCircle size={18} />
                {message}
              </div>
            )}

            <button
              type="button"
              onClick={closeModal}
              disabled={loading}
              className="mt-5 w-full rounded-xl bg-[#F7F3EB] py-3 text-sm font-bold text-[#6E604F] disabled:opacity-50"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
