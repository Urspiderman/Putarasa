
export default function EcoIllustration() {
  return (
    <div className="relative mx-auto flex w-full max-w-[520px] items-center justify-center overflow-hidden rounded-[32px] bg-gradient-to-br from-[#F3F8E9] via-[#FFF9E8] to-[#F9E8CE] p-8 shadow-sm">
      {/* Decorative circles */}
      <div className="absolute -left-12 -top-12 h-48 w-48 rounded-full bg-[#B9D68B]/30 blur-2xl" />
      <div className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-[#FFDA57]/30 blur-2xl" />

      <div className="relative z-10 flex w-full flex-col items-center gap-6 py-8">
        <div className="flex h-44 w-44 items-center justify-center rounded-full bg-white/85 shadow-lg ring-8 ring-white/40 sm:h-52 sm:w-52">
          <img
            src="/logo-putarasa.svg"
            alt="Logo daur ulang sampah organik PUTARASA"
            className="h-32 w-32 object-contain sm:h-40 sm:w-40"
          />
        </div>

        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#47763A]">
            Ekonomi Sirkular
          </p>

          <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-[#332417] sm:text-3xl">
            Sampah Organik,
            <br />
            Jadi Lebih Bernilai
          </h3>

          <p className="mx-auto mt-3 max-w-[320px] text-sm leading-relaxed text-[#6F6254]">
            Dari pengumpulan hingga pengolahan, PUTARASA
            menghubungkan setiap langkah menuju lingkungan
            yang lebih berkelanjutan.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {["Kumpulkan", "Olah", "Manfaatkan"].map((item) => (
            <span
              key={item}
              className="rounded-full border border-[#DDE8CC] bg-white/80 px-4 py-2 text-xs font-bold text-[#47763A]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
