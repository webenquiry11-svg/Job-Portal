import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        premium: {
          dark: '#0A192F',    // Deep Navy
          blue: '#112240',    // Card Background
          light: '#64FFDA',   // Neon Teal Accents
          slate: '#8892B0',   // Secondary Text
          heading: '#CCD6F6'  // Primary Titles
        }
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
      },
    },
  },
  plugins: [],
};
export default config;