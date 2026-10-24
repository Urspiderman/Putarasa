
import Image from "next/image";

type LogoProps = {
  showText?: boolean;
  size?: number;
  className?: string;
};

export default function PutarasaLogo({
  showText = true,
  size = 42,
  className = "",
}: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <Image
        src="/logo-putarasa.svg"
        alt="Logo PUTARASA"
        width={size}
        height={size}
        className="shrink-0 object-contain"
        priority
      />

      {showText && (
        <span className="text-[24px] font-extrabold tracking-[-0.05em] text-[#302218]">
          Putarasa
        </span>
      )}
    </div>
  );
}
