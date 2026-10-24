
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import PutarasaLogo from "@/components/landing/PutarasaLogo";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    async function checkRecovery() {
      const { data } = await supabase.auth.getUser();

      if (!mounted) return;

      setAuthorized(Boolean(data.user));
      setChecking(false);
    }

    void checkRecovery();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error: updateError } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      await supabase.auth.signOut();
      setSuccess(true);
    } catch {
      setError("Gagal memperbarui password.");
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

        <div className="rounded-[28px] border border-[#EEE5D7] bg-white p-7 shadow-lg sm:p-10">
          {checking ? (
            <p className="text-center text-sm text-[#766E63]">
              Memeriksa tautan pemulihan...
            </p>
          ) : success ? (
            <div className="text-center">
              <CheckCircle2
                size={56}
                className="mx-auto text-[#6A9C42]"
              />
              <h1 className="mt-5 text-2xl font-extrabold">
                Password Berhasil Diubah
              </h1>
              <p className="mt-3 text-sm text-[#766E63]">
                Silakan masuk kembali menggunakan password baru.
              </p>
              <Link
                href="/auth/login"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#FFC20A] px-6 py-3 font-bold"
              >
                Masuk Sekarang <ArrowRight size={18} />
              </Link>
            </div>
          ) : !authorized ? (
            <div className="text-center">
              <h1 className="text-2xl font-extrabold">
                Tautan Tidak Valid
              </h1>
              <p className="mt-3 text-sm leading-7 text-[#766E63]">
                Sesi pemulihan tidak ditemukan atau sudah berakhir.
                Silakan minta tautan baru.
              </p>
              <Link
                href="/auth/forgot-password"
                className="mt-6 inline-flex rounded-xl bg-[#FFC20A] px-6 py-3 font-bold"
              >
                Minta Tautan Baru
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-extrabold">
                Buat Password Baru
              </h1>
              <p className="mt-3 text-sm text-[#766E63]">
                Gunakan password baru dengan minimal 8 karakter.
              </p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-2 block text-sm font-bold"
                  >
                    Password Baru
                  </label>
                  <div className="relative">
                    <LockKeyhole
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#766E63]"
                    />
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-[#E9E1D6] py-3.5 pl-12 pr-12 outline-none focus:border-[#E4AB00]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword
                          ? "Sembunyikan password"
                          : "Lihat password"
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirm-new-password"
                    className="mb-2 block text-sm font-bold"
                  >
                    Konfirmasi Password
                  </label>
                  <input
                    id="confirm-new-password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    className="w-full rounded-xl border border-[#E9E1D6] px-4 py-3.5 outline-none focus:border-[#E4AB00]"
                  />
                </div>

                {error && (
                  <p role="alert" className="text-sm text-red-700">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFC20A] py-4 font-extrabold disabled:opacity-60"
                >
                  {loading ? "Menyimpan..." : "Simpan Password Baru"}
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
