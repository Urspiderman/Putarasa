
import type { SVGProps } from "react";

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
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        role="img"
        aria-label="Logo Putarasa"
      >
        <rect width="48" height="48" rx="12" fill="#FFC20A" />
        <path
          d="M12 30C12 18 22 12 36 11C36 26 29 36 18 36C14 36 12 34 12 30Z"
          fill="#2C4D21"
        />
        <path
          d="M14 35C19 28 24 23 33 17"
          stroke="#FFF5CD"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M20 29L19 22M26 24L32 26"
          stroke="#FFF5CD"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {showText && (
        <span className="text-[24px] font-extrabold tracking-[-0.05em] text-[#302218]">
          Putarasa
        </span>
      )}
    </div>
  );
}
