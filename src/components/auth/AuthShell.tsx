
import Link from "next/link";
import type { ReactNode } from "react";

import PutarasaLogo from "@/components/landing/PutarasaLogo";
import AuthArtwork from "./AuthArtwork";

type AuthShellProps = {
  mode: "login" | "register";
  children: ReactNode;
};

export default function AuthShell({
  mode,
  children,
}: AuthShellProps) {
  const isLogin = mode === "login";

  return (
    <main className="min-h-screen bg-[#FFFBF1] px-4 py-6 text-[#302218] sm:px-6 lg:py-10">
      <div className="relative mx-auto min-h-[850px] max-w-[1400px] overflow-hidden rounded-[32px] border border-[#F1E5C9] bg-[#FFFCF5] shadow-[0_18px_60px_rgba(80,58,25,0.09)]">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#FFE9A5]/70" />
        <div className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-[#FFE5A0]/65" />

        <div className="relative z-10 px-6 pt-8 sm:px-10 lg:px-14">
          <Link href="/" className="inline-flex flex-col">
            <PutarasaLogo size={60} />
            <span className="ml-[72px] -mt-1 text-xs text-[#786650]">
              Dari Dapur, Untuk Bumi
            </span>
          </Link>
        </div>

        <div className="relative z-10 grid items-center gap-8 px-6 pb-14 pt-8 sm:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14 lg:px-14">
          <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-[510px]">
              <AuthArtwork variant={mode} />
            </div>

            <div className="mt-5 max-w-md text-center lg:text-left">
              <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl">
                {isLogin
                  ? "Kelola Sampah, Rawat Bumi."
                  : "Langkah Kecil untuk Bumi yang Lebih Hijau."}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#766E63] sm:text-base">
                {isLogin
                  ? "Masuk dan lanjutkan perjalananmu bersama Putarasa."
                  : "Bergabung dengan ekosistem pengelolaan sampah organik yang berkelanjutan."}
              </p>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[520px]">
            <Link
              href="/"
              className="mb-7 inline-flex text-sm font-semibold text-[#BD8200] hover:underline"
            >
              ← Kembali ke Beranda
            </Link>

            <div className="mb-7">
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                {isLogin ? (
                  <>
                    Selamat Datang di{" "}
                    <span className="text-[#D99A00]">Putarasa!</span>
                  </>
                ) : (
                  "Daftar Akun Putarasa"
                )}
              </h1>
              <p className="mt-3 text-sm text-[#766E63] sm:text-base">
                {isLogin
                  ? "Masuk ke akunmu untuk melanjutkan."
                  : "Mulai perjalananmu untuk bumi yang lebih hijau!"}
              </p>
            </div>

            <div className="rounded-[28px] border border-[#F0E8DA] bg-white p-6 shadow-[0_12px_40px_rgba(61,42,18,0.06)] sm:p-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
