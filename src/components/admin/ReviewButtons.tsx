
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { reviewApplication } from "@/app/admin/verifikasi/actions";

type ReviewButtonsProps = {
  applicationId: string;
  applicantName: string;
};

export default function ReviewButtons({
  applicationId,
  applicantName,
}: ReviewButtonsProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function handleReview(
    decision: "approved" | "rejected"
  ) {
    if (loading || completed) return;

    const isApprove = decision === "approved";

    const confirmed = window.confirm(
      isApprove
        ? `Apakah kamu yakin ingin menyetujui pengajuan ${applicantName}?`
        : `Apakah kamu yakin ingin menolak pengajuan ${applicantName}?`
    );

    if (!confirmed) return;

    let notes = "";

    if (!isApprove) {
      const reason = window.prompt(
        `Masukkan alasan penolakan untuk ${applicantName}:`
      );

      if (reason === null) return;

      if (!reason.trim()) {
        setIsError(true);
        setMessage("Alasan penolakan wajib diisi.");
        return;
      }

      notes = reason.trim();
    }

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const result = await reviewApplication(
        applicationId,
        decision,
        notes
      );

      setMessage(result.message);
      setIsError(!result.success);

      if (result.success) {
        setCompleted(true);
        router.refresh();
      }
    } catch (error) {
      console.error("Review application error:", error);

      setIsError(true);
      setMessage(
        "Terjadi kesalahan saat memproses pengajuan."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={loading || completed}
          onClick={() => handleReview("approved")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E7F3DF] px-4 py-2.5 text-sm font-bold text-[#47742F] transition hover:bg-[#D6EACB] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <Loader2
              size={16}
              className="animate-spin"
            />
          ) : (
            <Check size={16} />
          )}

          Setujui
        </button>

        <button
          type="button"
          disabled={loading || completed}
          onClick={() => handleReview("rejected")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FDEAEA] px-4 py-2.5 text-sm font-bold text-[#B84545] transition hover:bg-[#FBDADA] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X size={16} />
          Tolak
        </button>
      </div>

      {message && (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-xl px-3 py-2 text-xs font-medium ${
            isError
              ? "bg-red-50 text-red-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {isError ? (
            <AlertCircle
              size={16}
              className="shrink-0"
            />
          ) : (
            <CheckCircle2
              size={16}
              className="shrink-0"
            />
          )}

          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
