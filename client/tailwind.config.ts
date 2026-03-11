import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx,css}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx,css}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx,css}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#121212',     // Dark background
        purple: '#7C3AED',      // Accent/Purple
        yellow: '#FACC15',      // Alert/Highlight
        red: '#EF4444',         // Error/Danger
        white: '#ffffff',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
      },
    },
    safelist: ['bg-primary', 'text-primary'],
  },
  plugins: [],
};
export default config;