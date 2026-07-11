/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Fundo escuro
        void: {
          900: "#070711",
          800: "#0b0b1a",
          700: "#111129",
          600: "#161637",
        },
        // Azul elétrico
        electric: {
          400: "#38bdf8",
          500: "#22a6f2",
          600: "#0b8be8",
        },
        // Roxo
        grape: {
          400: "#a855f7",
          500: "#9333ea",
          600: "#7c22ce",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(56,189,248,0.15), 0 8px 40px -12px rgba(56,189,248,0.35)",
        "glow-grape":
          "0 0 0 1px rgba(168,85,247,0.18), 0 8px 40px -12px rgba(168,85,247,0.45)",
        "glow-strong":
          "0 0 0 1px rgba(56,189,248,0.4), 0 0 60px -8px rgba(147,51,234,0.6)",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        sweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        sweep: "sweep 4s linear infinite",
        "fade-up": "fade-up 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
