import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
     colors: {
      "dark-1": "#000000",
      "light-1": "#FFFFFF",
     }
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
