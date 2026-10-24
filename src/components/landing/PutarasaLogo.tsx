
import Image from "next/image";

type LogoProps = {
  showText?: boolean;
  showName?: boolean;
  size?: number;
  className?: string;
};

export default function PutarasaLogo({
  showText = true,
  showName,
  size = 48,
  className = "",
}: LogoProps) {
  const displayText = showName ?? showText;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Logo dengan background kuning sesuai navbar */}
      <div
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#FFDA57]"
        style={{
          width: size,
          height: size,
        }}
      >
        <Image
          src="/logo-putarasa.svg"
          alt="Logo PUTARASA"
          width={size}
          height={size}
          className="h-full w-full object-contain"
          unoptimized
        />
      </div>

      {/* Nama PUTARASA */}
      {displayText && (
        <span className="whitespace-nowrap text-[24px] font-black leading-none tracking-tight text-[#332417]">
          PUTARASA
        </span>
      )}
    </div>
  );
}
