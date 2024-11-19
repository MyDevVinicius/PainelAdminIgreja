import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forte: "#0b3e4d", // Cor forte
        textlogo: "#239d8d", // Cor para texto logo
        media: "#1c6b6e", // Cor para media
        fraca: "#43cfb6", // Cor fraca
      },
    },
  },
  plugins: [],
} satisfies Config;
