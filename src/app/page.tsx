
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Leaf,
  Menu,
  PackageCheck,
  Recycle,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  Truck,
  Users,
  X,
} from "lucide-react";

import PutarasaLogo from "@/components/landing/PutarasaLogo";
import EcoIllustration from "@/components/landing/EcoIllustration";

const navItems = [
  { label: "Beranda", href: "#beranda" },
  { label: "Tentang", href: "#tentang" },
  { label: "Produk", href: "#produk" },
  { label: "Dampak", href: "#dampak" },
  { label: "Mitra", href: "#mitra" },
  { label: "FAQ", href: "#faq" },
];

const steps = [
  {
    icon: ClipboardCheck,
    title: "Ajukan Penjemputan",
    desc: "Supplier mengajukan pengambilan sampah organik.",
  },
  {
    icon: Truck,
    title: "Proses Penjemputan",
    desc: "Courier mengambil sampah sesuai penugasan.",
  },
  {
    icon: Recycle,
    title: "Pengolahan",
    desc: "Sampah dikelola menjadi produk yang bermanfaat.",
  },
  {
    icon: ShoppingBag,
    title: "Produk Kembali",
    desc: "Hasil pengolahan tersedia melalui marketplace.",
  },
];

const faqs = [
  {
    question: "Apa itu Putarasa?",
    answer:
      "Putarasa adalah platform yang menghubungkan penyedia sampah organik, kurir, pengelola, dan pembeli produk hasil pengolahan seperti pupuk organik dan maggot.",
  },
  {
    question: "Siapa saja yang dapat bergabung?",
    answer:
      "Rumah tangga, restoran, hotel, dan penyedia makanan dapat mengajukan diri sebagai Supplier. Pengguna juga dapat bergabung sebagai Courier atau Buyer sesuai kebutuhan.",
  },
  {
    question: "Bagaimana cara mengajukan penjemputan?",
    answer:
      "Daftar sebagai Supplier, tunggu persetujuan akun, kemudian ajukan penjemputan melalui dashboard Supplier.",
  },
  {
    question: "Apakah Supplier dan Courier bisa membeli produk?",
    answer:
      "Bisa. Supplier, Courier, dan Buyer dapat menggunakan marketplace yang sama untuk membeli produk Putarasa.",
  },
];

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#FFFBF1] font-sans text-[#302218]">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-[#EEE6D8] bg-[#FFFBF1]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[82px] max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
          <Link href="#beranda" aria-label="Beranda Putarasa">
            <PutarasaLogo size={42} />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[14px] font-semibold text-[#51483D] transition hover:text-[#BD8100]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <Link
              href="/auth/login"
              className="rounded-xl border border-[#E8DFCF] px-6 py-3 text-sm font-semibold transition hover:bg-white"
            >
              Masuk
            </Link>
            <Link
              href="/auth/register"
              className="rounded-xl bg-[#FFC20A] px-6 py-3 text-sm font-bold transition hover:bg-[#EFB200]"
            >
              Daftar
            </Link>
          </div>

          <button
            type="button"
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-xl border border-[#E8DFCF] p-3 lg:hidden"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileOpen && (
          <nav className="border-t border-[#EEE6D8] bg-[#FFFBF1] px-6 py-5 lg:hidden">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-semibold"
                >
                  {item.label}
                </a>
              ))}
              <div className="flex gap-3 border-t border-[#EEE6D8] pt-4 sm:hidden">
                <Link
                  href="/auth/login"
                  className="flex-1 rounded-xl border border-[#E8DFCF] py-3 text-center font-semibold"
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/register"
                  className="flex-1 rounded-xl bg-[#FFC20A] py-3 text-center font-bold"
                >
                  Daftar
                </Link>
              </div>
            </div>
          </nav>
        )}
      </header>

      <main>
        {/* HERO */}
        <section
          id="beranda"
          className="relative scroll-mt-24 overflow-hidden"
        >
          <div className="pointer-events-none absolute -left-24 top-56 h-72 w-72 rounded-full bg-[#FFF0B9]/45 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-12 h-96 w-96 rounded-full bg-[#FFF0B9]/55 blur-3xl" />

          <div className="relative mx-auto grid max-w-[1440px] items-center gap-10 px-5 pb-12 pt-16 sm:px-8 lg:min-h-[650px] lg:grid-cols-[.95fr_1.05fr] lg:px-12 lg:pt-12">
            <div className="max-w-[670px]">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#EFF2DB] px-4 py-2 text-sm font-semibold text-[#557A35]">
                <Leaf size={16} />
                Dari Dapur, Untuk Bumi
              </span>

              <h1 className="mt-7 text-[clamp(2.7rem,5vw,5.1rem)] font-extrabold leading-[1.1] tracking-[-0.055em]">
                Sampah organik hari ini,{" "}
                <span className="text-[#D69500]">
                  manfaat untuk esok hari.
                </span>
              </h1>

              <p className="mt-7 max-w-[610px] text-base leading-8 text-[#766E63] sm:text-lg">
                Putarasa membantu rumah tangga, restoran, hotel,
                dan penyedia makanan mengelola sampah organik
                sekaligus menghubungkan masyarakat dengan produk
                olahan yang bermanfaat.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[#FFC20A] px-7 py-4 text-sm font-extrabold shadow-[0_8px_20px_rgba(255,194,10,.18)] transition hover:-translate-y-0.5 hover:bg-[#F1B400]"
                >
                  Mulai bersama Putarasa
                  <ArrowRight size={18} />
                </Link>

                <a
                  href="#produk"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E8DFCF] bg-white/60 px-7 py-4 text-sm font-bold transition hover:bg-white"
                >
                  Jelajahi Produk
                  <ArrowUpRight size={17} />
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-4 text-sm text-[#655D50]">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={19} className="text-[#669E40]" />
                  Alur terstruktur
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={19} className="text-[#669E40]" />
                  Mudah dipantau
                </span>
                <span className="flex items-center gap-2">
                  <ShieldCheck size={19} className="text-[#669E40]" />
                  Berbasis data
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-[12%] right-[12%] top-[8%] h-[78%] rounded-[45%] bg-[#FFF0BE]/60" />

              <div className="relative mx-auto max-w-[680px]">
                <div className="mb-2 grid grid-cols-3 gap-2 text-center">
                  {[
                    ["01", "Sampah Organik"],
                    ["02", "Pengolahan"],
                    ["03", "Produk Bermanfaat"],
                  ].map(([number, label]) => (
                    <div
                      key={number}
                      className="rounded-2xl border border-white/80 bg-white/80 px-2 py-3 shadow-sm backdrop-blur"
                    >
                      <span className="text-xs font-extrabold text-[#D69500]">
                        {number}
                      </span>
                      <p className="mt-1 text-[11px] font-bold sm:text-xs">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>

                <EcoIllustration />
              </div>

              <div className="relative -mt-2 grid grid-cols-3 gap-2 rounded-[22px] border border-[#EFE7D8] bg-white/90 p-4 shadow-[0_16px_45px_rgba(64,42,15,.07)] sm:gap-4 sm:p-5">
                {[
                  { icon: Users, title: "Kolaboratif", sub: "Empat peran" },
                  { icon: Recycle, title: "Sirkular", sub: "Kelola & olah" },
                  { icon: Sprout, title: "Bermanfaat", sub: "Produk organik" },
                ].map(({ icon: Icon, title, sub }) => (
                  <div key={title} className="text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF3DC] text-[#5D8A3A]">
                      <Icon size={19} />
                    </div>
                    <p className="text-xs font-extrabold sm:text-sm">
                      {title}
                    </p>
                    <p className="mt-1 text-[10px] text-[#8C8276] sm:text-xs">
                      {sub}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TENTANG */}
        <section
          id="tentang"
          className="scroll-mt-24 bg-white py-20 lg:py-24"
        >
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-[750px] text-center">
              <SectionLabel>TENTANG PUTARASA</SectionLabel>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Menghubungkan setiap langkah
                <span className="text-[#D69500]"> ekonomi sirkular</span>
              </h2>
              <p className="mt-5 leading-8 text-[#766E63]">
                Dari pengajuan penjemputan sampai produk hasil
                pengolahan, Putarasa membantu seluruh proses
                berjalan lebih teratur dan transparan.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map(({ icon: Icon, title, desc }, index) => (
                <article
                  key={title}
                  className="rounded-[26px] border border-[#EEE8DE] bg-[#FFFCF6] p-7 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-7 flex items-center justify-between">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0BC] text-[#946700]">
                      <Icon size={27} />
                    </span>
                    <span className="text-3xl font-extrabold text-[#E6DDCE]">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#766E63]">
                    {desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* PRODUK */}
        <section id="produk" className="scroll-mt-24 py-20 lg:py-24">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <SectionLabel>PRODUK PUTARASA</SectionLabel>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Dari sisa organik menjadi nilai baru
                </h2>
                <p className="mt-4 max-w-2xl leading-7 text-[#766E63]">
                  Temukan produk hasil pengolahan organik melalui
                  marketplace Putarasa.
                </p>
              </div>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 font-bold text-[#A87900]"
              >
                Gabung untuk berbelanja <ArrowRight size={18} />
              </Link>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <ProductCard
                type="compost"
                title="Pupuk Organik"
                description="Produk hasil pengolahan bahan organik yang dapat dimanfaatkan untuk mendukung perawatan tanaman."
                icon={<Sprout size={48} strokeWidth={1.5} />}
              />
              <ProductCard
                type="maggot"
                title="Maggot BSF"
                description="Produk berbasis larva Black Soldier Fly yang merupakan bagian dari pemanfaatan kembali bahan organik."
                icon={<Leaf size={48} strokeWidth={1.5} />}
              />
            </div>
          </div>
        </section>

        {/* DAMPAK */}
        <section
          id="dampak"
          className="scroll-mt-24 bg-[#F4F5E9] py-20 lg:py-24"
        >
          <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:px-12">
            <div>
              <SectionLabel>DAMPAK POSITIF</SectionLabel>
              <h2 className="mt-4 max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl">
                Setiap langkah kecil berarti untuk lingkungan.
              </h2>
              <p className="mt-5 max-w-xl leading-8 text-[#766E63]">
                Putarasa dirancang untuk membantu pencatatan
                sampah yang dikumpulkan, hasil pengolahan,
                dan manfaat yang dihasilkan secara terukur.
              </p>
              <div className="mt-7 space-y-4">
                {[
                  "Pencatatan penjemputan dan berat sampah",
                  "Pemantauan proses pengolahan organik",
                  "Informasi hasil olahan dan ketersediaan produk",
                ].map((text) => (
                  <div key={text} className="flex items-start gap-3">
                    <CheckCircle2
                      size={20}
                      className="mt-1 shrink-0 text-[#649B42]"
                    />
                    <span className="font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: Truck,
                  title: "Penjemputan",
                  text: "Status dan riwayat pengambilan tercatat.",
                },
                {
                  icon: Recycle,
                  title: "Pengolahan",
                  text: "Alur pemrosesan lebih mudah dipantau.",
                },
                {
                  icon: PackageCheck,
                  title: "Hasil Olahan",
                  text: "Produk dan stok dikelola terpusat.",
                },
                {
                  icon: Sprout,
                  title: "Keberlanjutan",
                  text: "Mendorong pemanfaatan sampah organik.",
                },
              ].map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-[24px] border border-[#E7EAD8] bg-white p-7 shadow-sm"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EDF3D9] text-[#628D3C]">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-extrabold">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[#766E63]">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MITRA */}
        <section
          id="mitra"
          className="scroll-mt-24 bg-white py-20 lg:py-24"
        >
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
            <div className="text-center">
              <SectionLabel>BERGABUNG BERSAMA KAMI</SectionLabel>
              <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
                Satu platform, berbagai peran
              </h2>
              <p className="mx-auto mt-4 max-w-2xl leading-7 text-[#766E63]">
                Setiap pengguna dapat berkontribusi sesuai
                kebutuhannya dalam ekosistem Putarasa.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {[
                {
                  icon: Leaf,
                  title: "Supplier",
                  desc: "Ajukan penjemputan dan pantau pengelolaan sampah organik.",
                },
                {
                  icon: Truck,
                  title: "Courier",
                  desc: "Terima penugasan dan perbarui proses penjemputan.",
                },
                {
                  icon: ShoppingBag,
                  title: "Buyer",
                  desc: "Jelajahi dan beli produk hasil pengolahan organik.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <article
                  key={title}
                  className="rounded-[26px] border border-[#EEE8DE] p-8"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF0BC] text-[#8D6909]">
                    <Icon size={31} />
                  </div>
                  <h3 className="mt-6 text-xl font-extrabold">{title}</h3>
                  <p className="mt-3 min-h-[75px] text-sm leading-7 text-[#766E63]">
                    {desc}
                  </p>
                  <Link
                    href="/auth/register"
                    className="mt-6 inline-flex items-center gap-2 font-bold text-[#A87900]"
                  >
                    Bergabung <ArrowRight size={17} />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-24 py-20 lg:py-24">
          <div className="mx-auto max-w-[920px] px-5 sm:px-8">
            <div className="text-center">
              <SectionLabel>FAQ</SectionLabel>
              <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
                Pertanyaan yang sering diajukan
              </h2>
            </div>

            <div className="mt-10 space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={faq.question}
                  className="overflow-hidden rounded-2xl border border-[#EEE5D5] bg-white"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setActiveFaq(activeFaq === index ? null : index)
                    }
                    aria-expanded={activeFaq === index}
                    className="flex w-full items-center justify-between gap-4 p-6 text-left font-bold"
                  >
                    {faq.question}
                    <ChevronDown
                      size={20}
                      className={`shrink-0 transition-transform ${
                        activeFaq === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {activeFaq === index && (
                    <p className="px-6 pb-6 text-sm leading-7 text-[#766E63]">
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 pb-20 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1344px] overflow-hidden rounded-[32px] bg-[#FFC20A] px-7 py-14 text-center sm:px-12">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/30">
              <Sprout size={34} />
            </div>
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl">
              Mari mulai perubahan dari dapur kita.
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-[#534019]">
              Bergabung dengan Putarasa dan ambil bagian dalam
              pengelolaan sampah organik yang lebih baik.
            </p>
            <Link
              href="/auth/register"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#302218] px-7 py-4 font-bold text-white transition hover:bg-[#4B382B]"
            >
              Daftar Sekarang <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#EEE6D8] bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-7 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <div>
            <PutarasaLogo size={38} />
            <p className="mt-3 text-sm text-[#766E63]">
              Dari Sisa, Menjadi Asa.
            </p>
          </div>
          <div className="flex flex-wrap gap-5">
            {navItems.slice(1).map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-[#766E63] hover:text-[#B78300]"
              >
                {item.label}
              </a>
            ))}
          </div>
          <p className="text-xs text-[#948B7E]">
            © {new Date().getFullYear()} Putarasa.
          </p>
        </div>
      </footer>
    </div>
  );
}

function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF0BC] px-4 py-2 text-xs font-extrabold tracking-[.12em] text-[#9B7000]">
      <Leaf size={14} />
      {children}
    </span>
  );
}

function ProductCard({
  title,
  description,
  icon,
  type,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  type: "compost" | "maggot";
}) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-[#ECE3D2] bg-white shadow-sm">
      <div
        className={`relative flex h-64 items-center justify-center overflow-hidden ${
          type === "compost" ? "bg-[#EAF0D9]" : "bg-[#F9EBCB]"
        }`}
      >
        <div className="absolute h-48 w-48 rounded-full bg-white/40" />
        <div className="relative flex h-32 w-32 items-center justify-center rounded-[30px] bg-white/80 text-[#638F3C] shadow-xl">
          {icon}
        </div>
        <span className="absolute bottom-5 left-6 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-[#6A603F]">
          Produk organik
        </span>
      </div>

      <div className="p-7">
        <h3 className="text-2xl font-extrabold">{title}</h3>
        <p className="mt-3 min-h-[65px] text-sm leading-7 text-[#766E63]">
          {description}
        </p>
        <Link
          href="/auth/register"
          className="mt-6 inline-flex items-center gap-2 font-extrabold text-[#A87900]"
        >
          Lihat di Marketplace <ArrowRight size={18} />
        </Link>
      </div>
    </article>
  );
}
