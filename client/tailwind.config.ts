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
          dark: '#0A192F',
          blue: '#112240',
          light: '#64FFDA',
          slate: '#8892B0',
          heading: '#CCD6F6'
        }
      },
    },
  },
  plugins: [],
};

export default config;