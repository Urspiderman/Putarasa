
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) {
        setError(loginError.message);
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const { error: oauthError } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          },
        });

      if (oauthError) {
        setError(oauthError.message);
        setLoading(false);
      }
    } catch {
      setError("Gagal memulai login Google.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <div>
        <label
          htmlFor="login-email"
          className="mb-2 block text-sm font-bold"
        >
          Email
        </label>

        <div className="relative">
          <Mail
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#766E63]"
          />
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            placeholder="Masukkan email Anda"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-[#E9E1D6] bg-white py-3.5 pl-12 pr-4 outline-none transition focus:border-[#E4AB00] focus:ring-2 focus:ring-[#FFE49B]"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="login-password"
          className="mb-2 block text-sm font-bold"
        >
          Password
        </label>

        <div className="relative">
          <LockKeyhole
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#766E63]"
          />
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[#E9E1D6] bg-white py-3.5 pl-12 pr-12 outline-none transition focus:border-[#E4AB00] focus:ring-2 focus:ring-[#FFE49B]"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={
              showPassword ? "Sembunyikan password" : "Lihat password"
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#766E63]"
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <Link
          href="/auth/forgot-password"
          className="text-sm font-semibold text-[#C58A00] hover:underline"
        >
          Lupa password?
        </Link>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-full bg-[#FFC20A] px-5 py-4 font-extrabold transition hover:bg-[#F0B600] disabled:opacity-60"
      >
        {loading ? "Memproses..." : "Masuk"}
        <ArrowRight size={19} />
      </button>

      <div className="flex items-center gap-3 text-xs text-[#A49A8C]">
        <span className="h-px flex-1 bg-[#EEE6D9]" />
        atau
        <span className="h-px flex-1 bg-[#EEE6D9]" />
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={handleGoogleLogin}
        className="flex w-full items-center justify-center gap-3 rounded-full border border-[#E9E1D6] py-3.5 text-sm font-bold hover:bg-[#FFFBF1] disabled:opacity-60"
      >
        <span className="text-lg font-extrabold text-[#4285F4]">G</span>
        Lanjut dengan Google
      </button>

      <p className="pt-2 text-center text-sm">
        Belum punya akun?{" "}
        <Link
          href="/auth/register"
          className="font-bold text-[#C58A00] hover:underline"
        >
          Daftar di sini
        </Link>
      </p>
    </form>
  );
}
