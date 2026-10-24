
export default function EcoIllustration() {
  return (
    <div className="relative w-full">
      <div className="absolute inset-5 rounded-[42%] bg-[#FFF0B9]/60 blur-3xl" />

      <svg
        viewBox="0 0 650 470"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 h-auto w-full drop-shadow-xl"
        role="img"
        aria-label="Ilustrasi pengolahan sampah organik menjadi pupuk dan maggot"
      >
        <defs>
          <linearGradient id="bin" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#F0D4A8" />
            <stop offset="1" stopColor="#C69C6D" />
          </linearGradient>
          <linearGradient id="soil" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#795138" />
            <stop offset="1" stopColor="#40291F" />
          </linearGradient>
          <linearGradient id="bag" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#E9BD7E" />
            <stop offset="1" stopColor="#BC8C55" />
          </linearGradient>
        </defs>

        <ellipse cx="332" cy="424" rx="285" ry="24" fill="#D8C7A7" opacity=".35" />

        {/* Decorative leaves */}
        <g fill="#79AE46">
          <path d="M65 250C18 210 18 168 55 148C93 180 99 221 65 250Z" />
          <path d="M93 315C48 299 35 260 53 230C101 247 119 284 93 315Z" />
          <path d="M564 222C553 176 573 145 614 139C621 186 603 217 564 222Z" />
          <path d="M567 304C591 265 625 260 645 280C625 319 594 329 567 304Z" />
        </g>
        <g stroke="#527F35" strokeWidth="4" fill="none" strokeLinecap="round">
          <path d="M65 250L47 181M93 315L61 263M564 222L597 162M567 304L620 287" />
        </g>

        {/* Soil base */}
        <path
          d="M95 395C142 359 221 374 272 391C342 360 417 373 470 392C506 380 553 387 581 411L581 426H95Z"
          fill="url(#soil)"
        />

        {/* Compost bin */}
        <path
          d="M129 195L373 195L355 387Q252 406 151 387Z"
          fill="url(#bin)"
          stroke="#B88C59"
          strokeWidth="3"
        />
        <ellipse cx="251" cy="195" rx="124" ry="27" fill="#8D6748" />
        <ellipse cx="251" cy="189" rx="113" ry="21" fill="#4F3828" />

        {/* Organic scraps */}
        <g>
          <path d="M155 176C150 132 178 115 213 137C225 159 204 179 155 176Z" fill="#65A64B" />
          <path d="M204 170C203 125 237 108 259 134C271 161 252 176 204 170Z" fill="#91C958" />
          <path d="M254 169C263 122 299 121 317 149C311 172 292 179 254 169Z" fill="#4D9345" />
          <path d="M299 179C306 146 341 143 352 166C347 188 325 190 299 179Z" fill="#74B64C" />
          <circle cx="202" cy="174" r="23" fill="#E98B32" />
          <circle cx="265" cy="178" r="20" fill="#ECA742" />
          <path d="M175 177Q194 151 218 164" stroke="#F9D48D" strokeWidth="9" fill="none" strokeLinecap="round" />
          <path d="M265 150Q277 139 287 145" stroke="#357E38" strokeWidth="7" fill="none" />
          <path d="M315 165L334 137L350 169Z" fill="#E8B47C" />
        </g>

        {/* Recycling mark */}
        <g transform="translate(251 287)" fill="#548442">
          <path d="M0-42L20-10H8L-5-31L-15-15L-27-22L-10-48Z" />
          <path d="M37-3L17 29L11 17L24-3L3-4L8-18L40-16Z" />
          <path d="M-32 12L-10 12L-17 1L-5-6L13 23L-4 45L-10 31L-30 31Z" />
        </g>

        {/* Fertilizer package */}
        <g transform="translate(392 195)">
          <path
            d="M22 0H136L148 184H8Z"
            fill="url(#bag)"
            stroke="#B78A57"
            strokeWidth="3"
          />
          <path d="M22 0L8 23H148L136 0Z" fill="#B98B55" />
          <rect x="29" y="58" width="99" height="92" rx="10" fill="#FFF8E8" />
          <path d="M78 111C49 90 59 69 98 72C99 94 93 108 78 111Z" fill="#578C3A" />
          <path d="M78 114L94 83" stroke="#FFF8E8" strokeWidth="3" />
          <text
            x="78"
            y="128"
            textAnchor="middle"
            fontSize="13"
            fontWeight="800"
            fill="#443022"
          >
            PUPUK
          </text>
          <text
            x="78"
            y="141"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill="#443022"
          >
            ORGANIK
          </text>
        </g>

        {/* Growing plant */}
        <g transform="translate(102 330)">
          <path d="M0 65C4 23 22-2 47-30" stroke="#55883A" strokeWidth="7" fill="none" />
          <path d="M26 0C-6-3-12-33-5-53C26-48 38-23 26 0Z" fill="#70B548" />
          <path d="M40-22C37-54 60-70 84-64C81-35 64-21 40-22Z" fill="#4E963E" />
          <path d="M12 35C-16 37-30 15-26-7C1-9 19 11 12 35Z" fill="#8BC955" />
        </g>
      </svg>
    </div>
  );
}
