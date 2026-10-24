
type AuthArtworkProps = {
  variant?: "login" | "register";
};

export default function AuthArtwork({
  variant = "login",
}: AuthArtworkProps) {
  return (
    <svg
      viewBox="0 0 440 430"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-auto w-full"
      role="img"
      aria-label="Ilustrasi lingkungan Putarasa"
    >
      <circle cx="200" cy="215" r="175" fill="#FFF0C3" />

      {variant === "login" ? (
        <>
          <circle cx="185" cy="195" r="125" fill="#9ADBCB" />
          <path
            d="M120 92C155 80 174 110 158 135L125 149L140 185L105 206L75 180L68 140Z"
            fill="#A5BE57"
          />
          <path
            d="M225 85L263 110L276 145L248 170L219 151L204 120Z"
            fill="#A5BE57"
          />
          <path
            d="M132 240L180 229L208 259L193 310L155 301L126 274Z"
            fill="#A5BE57"
          />
          <circle cx="151" cy="186" r="8" fill="#503B29" />
          <circle cx="219" cy="186" r="8" fill="#503B29" />
          <path
            d="M169 211Q185 231 202 211"
            stroke="#503B29"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <circle cx="126" cy="210" r="13" fill="#F7AD88" />
          <circle cx="241" cy="210" r="13" fill="#F7AD88" />

          <path
            d="M245 251L355 251L339 374H263Z"
            fill="#D7A16A"
          />
          <ellipse cx="300" cy="252" rx="55" ry="16" fill="#9B6A42" />
          <path
            d="M270 248Q300 203 331 248"
            fill="#6C4A30"
          />
          <path
            d="M280 328L296 299L309 328Z"
            fill="#FFF0D2"
          />
          <path
            d="M278 337H322"
            stroke="#FFF0D2"
            strokeWidth="9"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <path
            d="M126 211H317L298 371H146Z"
            fill="#E6B17B"
          />
          <ellipse cx="221" cy="211" rx="96" ry="24" fill="#F2C795" />
          <path
            d="M151 205Q220 165 292 205"
            fill="#67462C"
          />
          <path
            d="M220 194C220 136 214 112 219 79"
            stroke="#6B963E"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <path
            d="M218 149C154 147 139 106 152 76C203 80 227 108 218 149Z"
            fill="#7FAF45"
          />
          <path
            d="M219 118C231 65 273 55 300 69C291 111 264 134 219 118Z"
            fill="#97C65B"
          />
          <path
            d="M220 185C252 148 291 150 306 173C286 201 257 208 220 185Z"
            fill="#669D40"
          />
          <path
            d="M221 294C191 270 198 243 238 237C240 261 233 284 221 294Z"
            fill="#7AA44B"
          />
        </>
      )}

      <path
        d="M70 372Q150 347 218 380Q292 349 375 378"
        stroke="#8CB65A"
        strokeWidth="12"
        strokeLinecap="round"
      />

      <g fill="#FFC83E">
        <path d="M61 91L67 106L82 112L67 118L61 133L55 118L40 112L55 106Z" />
        <path d="M360 110L365 121L376 126L365 131L360 142L355 131L344 126L355 121Z" />
      </g>
    </svg>
  );
}
