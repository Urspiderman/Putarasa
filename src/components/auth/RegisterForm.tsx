
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
  UserRound,
  ShoppingBag,
  Sprout,
  Truck,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type RegisterRole = "buyer" | "supplier" | "courier";

const roleOptions = [
  {
    value: "buyer" as const,
    label: "Buyer",
    description: "Pembeli Produk",
    icon: ShoppingBag,
  },
  {
    value: "supplier" as const,
    label: "Supplier",
    description: "Pemasok Sampah",
    icon: Sprout,
  },
  {
    value: "courier" as const,
    label: "Courier",
    description: "Kurir Penjemputan",
    icon: Truck,
  },
];

export default function RegisterForm() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<RegisterRole>("buyer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
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

      const { error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          data: {
            full_name: fullName.trim(),
            requested_role: role,
          },
        },
      });

      if (signupError) {
        setError(signupError.message);
        return;
      }

      router.push("/auth/verify-email");
    } catch {
      setError("Pendaftaran gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div>
        <label htmlFor="register-name" className="mb-2 block text-sm font-bold">
          Nama Lengkap
        </label>
        <div className="relative">
          <UserRound size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#766E63]" />
          <input
            id="register-name"
            required
            minLength={3}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Masukkan nama lengkap"
            autoComplete="name"
            className="w-full rounded-xl border border-[#E9E1D6] py-3 pl-12 pr-4 outline-none focus:border-[#E4AB00] focus:ring-2 focus:ring-[#FFE49B]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="register-email" className="mb-2 block text-sm font-bold">
          Email
        </label>
        <div className="relative">
          <Mail size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#766E63]" />
          <input
            id="register-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Masukkan email Anda"
            autoComplete="email"
            className="w-full rounded-xl border border-[#E9E1D6] py-3 pl-12 pr-4 outline-none focus:border-[#E4AB00] focus:ring-2 focus:ring-[#FFE49B]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="register-password" className="mb-2 block text-sm font-bold">
          Password
        </label>
        <div className="relative">
          <LockKeyhole size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#766E63]" />
          <input
            id="register-password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 8 karakter"
            autoComplete="new-password"
            className="w-full rounded-xl border border-[#E9E1D6] py-3 pl-12 pr-12 outline-none focus:border-[#E4AB00] focus:ring-2 focus:ring-[#FFE49B]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#766E63]"
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="register-confirm" className="mb-2 block text-sm font-bold">
          Konfirmasi Password
        </label>
        <input
          id="register-confirm"
          type="password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Ulangi password"
          autoComplete="new-password"
          className="w-full rounded-xl border border-[#E9E1D6] px-4 py-3 outline-none focus:border-[#E4AB00] focus:ring-2 focus:ring-[#FFE49B]"
        />
      </div>

      <fieldset>
        <legend className="mb-3 text-sm font-bold">Pilih Role Anda</legend>
        <div className="grid grid-cols-3 gap-2">
          {roleOptions.map(({ value, label, description, icon: Icon }) => (
            <button
              key={value}
              type="button"
              aria-pressed={role === value}
              onClick={() => setRole(value)}
              className={`flex min-h-[116px] flex-col items-center justify-center rounded-xl border p-2 text-center transition ${
                role === value
                  ? "border-[#F3B600] bg-[#FFF8E0] ring-1 ring-[#F3B600]"
                  : "border-[#E9E1D6] bg-white hover:bg-[#FFFBF1]"
              }`}
            >
              <Icon size={27} className="mb-2 text-[#6D963F]" />
              <span className="text-sm font-extrabold">{label}</span>
              <span className="mt-1 text-[10px] leading-4 text-[#766E63]">
                {description}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      {role !== "buyer" && (
        <p className="rounded-xl bg-[#FFF7DD] p-3 text-xs leading-5 text-[#80611B]">
          Akun {role === "supplier" ? "Supplier" : "Courier"} memerlukan
          persetujuan Admin sebelum dapat menggunakan fitur operasional.
        </p>
      )}

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-full bg-[#FFC20A] px-5 py-4 font-extrabold hover:bg-[#F0B600] disabled:opacity-60"
      >
        {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
        <ArrowRight size={19} />
      </button>

      <p className="text-center text-xs leading-5 text-[#766E63]">
        Dengan mendaftar, kamu menyetujui syarat dan kebijakan
        privasi Putarasa.
      </p>

      <p className="text-center text-sm">
        Sudah punya akun?{" "}
        <Link href="/auth/login" className="font-bold text-[#C58A00] hover:underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}
