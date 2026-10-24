
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        putarasa: {
          cream: "#FFFBF1",
          yellow: "#FFC20A",
          brown: "#302218",
          green: "#557A35",
        },
      },
    },
  },
  plugins: [],
};

export default config;
