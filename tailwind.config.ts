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
        // Paleta oficial Quillay SPA
        quillay: {
          tronco: "#20130f",        // Marrón tronco — texto principal, logo
          oscuro: "#1d3214",        // Verde oscuro follaje — headers fuertes
          medio: "#435c33",         // Verde medio — acciones principales
          claro: "#688555",         // Verde claro — éxito, hover
        },
        neutral: {
          900: "#20130f",
          800: "#444242",
          700: "#5b5b5f",
          500: "#858585",
          400: "#87868a",
          200: "#dbdbdb",
          50: "#ffffff",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
