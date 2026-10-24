
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail, CheckCircle2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import PutarasaLogo from "@/components/landing/PutarasaLogo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
        });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSent(true);
    } catch {
      setError("Gagal mengirim email. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFFBF1] px-4 py-10">
      <div className="w-full max-w-[480px]">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex">
            <PutarasaLogo size={48} />
          </Link>
        </div>

        <div className="rounded-[28px] border border-[#EEE5D7] bg-white p-7 shadow-[0_18px_55px_rgba(60,42,20,.07)] sm:p-10">
          {sent ? (
            <div className="text-center">
              <CheckCircle2
                size={56}
                className="mx-auto text-[#6A9C42]"
              />

              <h1 className="mt-5 text-2xl font-extrabold">
                Periksa Email Kamu
              </h1>

              <p className="mt-3 text-sm leading-7 text-[#766E63]">
                Jika email tersebut terdaftar, kamu akan
                menerima tautan untuk mengatur ulang password.
                Periksa juga folder spam.
              </p>

              <Link
                href="/auth/login"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#FFC20A] px-6 py-3 font-bold"
              >
                Kembali ke Login <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#B98300]"
              >
                <ArrowLeft size={17} />
                Kembali ke Login
              </Link>

              <h1 className="mt-7 text-3xl font-extrabold">
                Lupa Password?
              </h1>

              <p className="mt-3 text-sm leading-7 text-[#766E63]">
                Masukkan email akun Putarasa kamu.
                Kami akan mengirimkan tautan untuk mengatur ulang password.
              </p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <div>
                  <label
                    htmlFor="forgot-email"
                    className="mb-2 block text-sm font-bold"
                  >
                    Alamat Email
                  </label>

                  <div className="relative">
                    <Mail
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#766E63]"
                    />

                    <input
                      id="forgot-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Masukkan email Anda"
                      className="w-full rounded-xl border border-[#E9E1D6] py-3.5 pl-12 pr-4 outline-none focus:border-[#E4AB00] focus:ring-2 focus:ring-[#FFE49B]"
                    />
                  </div>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFC20A] py-4 font-extrabold hover:bg-[#F0B600] disabled:opacity-60"
                >
                  {loading ? "Mengirim..." : "Kirim Tautan Reset"}
                  <ArrowRight size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
