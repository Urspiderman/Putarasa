
import Link from "next/link";
import { MailCheck, ArrowRight } from "lucide-react";
import PutarasaLogo from "@/components/landing/PutarasaLogo";

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFFBF1] px-4">
      <div className="w-full max-w-[500px] rounded-[30px] border border-[#EEE5D7] bg-white p-8 text-center shadow-lg sm:p-12">
        <div className="mb-7 flex justify-center">
          <PutarasaLogo size={46} />
        </div>

        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF2C8] text-[#C28B00]">
          <MailCheck size={47} />
        </div>

        <h1 className="mt-7 text-3xl font-extrabold">
          Verifikasi Email Kamu
        </h1>

        <p className="mt-4 text-sm leading-8 text-[#766E63]">
          Kami telah memproses permintaan pendaftaran.
          Jika diperlukan, tautan verifikasi akan dikirim
          ke email yang kamu daftarkan.
          Klik tautan tersebut untuk mengaktifkan akun.
        </p>

        <p className="mt-4 rounded-xl bg-[#FFF8E3] p-4 text-xs leading-6 text-[#86691D]">
          Tidak menemukan email? Periksa folder spam.
          Pengiriman email bergantung pada konfigurasi
          Supabase Auth.
        </p>

        <Link
          href="/auth/login"
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFC20A] px-6 py-4 font-extrabold"
        >
          Kembali ke Login <ArrowRight size={19} />
        </Link>
      </div>
    </main>
  );
}
