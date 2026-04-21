import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#f8fafc",
        accent: "#ea580c",
        ocean: "#0f766e"
      },
      boxShadow: {
        panel: "0 20px 45px -24px rgba(15, 23, 42, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
