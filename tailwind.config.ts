import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#e0e7ff",
          500: "#4f46e5",
          600: "#4338ca"
        }
      }
    }
  },
  plugins: []
};

export default config;
